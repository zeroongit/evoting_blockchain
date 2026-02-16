"use client";

import { useState, useRef, useEffect } from "react";
import { createPublicClient, http, keccak256, toBytes } from "viem";
import { sepolia } from "viem/chains";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { DPT_DATABASE } from "@/lib/dptData";
import { getPoseidonHash } from "@/lib/poseidon";

interface FaceVerificationProps {
  userAddress: string;
  onVerified: (zkInput: any) => void;
}

export default function FaceVerification({ userAddress, onVerified }: FaceVerificationProps) {
  const [scanning, setScanning] = useState(false);
  const [scanFinished, setScanFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState("");
  
  // STATE INPUT
  const [nik, setNik] = useState("");
  const [isNikVerified, setIsNikVerified] = useState(false);
  const [checkingNik, setCheckingNik] = useState(false);
  
  // STATE SISTEM
  const [message, setMessage] = useState("Silakan Masukkan Identitas Kependudukan.");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const [simulasiNik, setSimulasiNik] = useState("");
  const [simulasiNama, setSimulasiNama] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const publicClient = createPublicClient({ 
    chain: sepolia, 
    transport: http(),
    batch: { multicall: false } 
  });

  // --- 🛡️ LAPIS 1: CEK WALLET ---
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!userAddress) return;
      try {
        const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
        // Cek apakah wallet ini sudah memverifikasi wajah (humanVerified)
        const status = await publicClient.readContract({
          address: contractAddress,
          abi: EVOTING_ABI,
          functionName: "humanVerified", 
          args: [userAddress],
        }) as boolean;

        if (status) {
          setIsBlocked(true);
          setBlockReason("WALLET_BLOCKED");
          setMessage("⛔ WALLET DITOLAK: Wallet ini sudah terdaftar.");
        }
      } catch (error) {
        console.error("Connection Error", error);
      }
    };
    checkUserStatus();
    return () => stopCamera();
  }, [userAddress]);

  const handleTambahSimulasi = () => {
    if (!simulasiNik || simulasiNik.length < 16) {
      alert("NIK simulasi harus 16 digit!");
      return;
    }

    // Cek apakah NIK sudah ada
    const exists = DPT_DATABASE.find((u) => u.nik === simulasiNik);
    if (exists) {
      alert("NIK tersebut sudah ada di DPT!");
      return;
    }

    // Push data baru ke array DPT secara langsung (di memori)
    DPT_DATABASE.push({
      nik: simulasiNik,
      nama: simulasiNama || "Pemilih Simulasi",
      status: "WNI",
      usia: 20,
      valid: true
    });

    alert(`Berhasil! NIK ${simulasiNik} telah ditambahkan ke DPT.`);
    setSimulasiNik('');
    setSimulasiNama('');
  };

  // --- 🛡️ LAPIS 2: CEK NIK (NULLIFIER) ---
  const handleCheckNIK = async () => {
    setMessage("⏳ Mengecek Status Hak Pilih NIK...");
    setCheckingNik(true);

    // 1. Cek di Mock Database DPT
    const foundUser = DPT_DATABASE.find((user) => user.nik === nik);
    if (!foundUser) {
        setCheckingNik(false);
        alert("NIK Tidak Ditemukan di DPT.");
        setMessage("❌ NIK Tidak Terdaftar.");
        return;
    }

    try {
        // 2. Generate Nullifier (SAMA PERSIS DENGAN PAGE.TSX)
        const nikHash = keccak256(toBytes(nik));
        const voterIdVal = BigInt(nikHash) % BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

        const realNullifier = await getPoseidonHash([
          voterIdVal,
          BigInt(0),
          BigInt(222)
        ]);

        console.log("🔍 [DEBUG] Voter ID:", voterIdVal.toString());
        console.log("🔍 [DEBUG] Real Nullifier (Poseidon):", realNullifier);

        const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
        
        // 3. Panggil 'usedNullifiers' di Smart Contract
        // Pastikan urutan argumen: [ElectionID, Nullifier]
        const isUsed = await publicClient.readContract({
            address: contractAddress,
            abi: EVOTING_ABI,
            functionName: "usedNullifiers", 
            args: [BigInt(0), BigInt(realNullifier)], 
        }) as boolean;

        console.log("🔍 [DEBUG] Status di Blockchain (isUsed):", isUsed);

        if (isUsed) {
            // JIKA TRUE BERARTI SUDAH PERNAH VOTE -> BLOKIR!
            setCheckingNik(false);
            setIsBlocked(true);
            setBlockReason("NIK_USED");
            setMessage(`⛔ NIK DITOLAK: ${foundUser.nama} SUDAH MENGGUNAKAN HAK SUARANYA.`);
            return;
        }

        // Jika Lolos (isUsed == false)
        setCheckingNik(false);
        setIsNikVerified(true);
        setMessage(`✅ Data Valid: ${foundUser.nama}. Silakan Lakukan Pencocokan Wajah.`);
        startCamera();

    } catch (error: any) {
        console.error("Gagal cek nullifier:", error);
        setCheckingNik(false);
        alert("Gagal koneksi Blockchain: " + (error.shortMessage || error.message));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setMessage("❌ Gagal akses kamera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // --- 🛡️ LAPIS 3: BIOMETRIC MATCHING (SIMULASI) ---
  const startScanning = () => {
    setScanning(true);
    setScanFinished(false);
    setProgress(0);
    setMessage("⏳ Mengunduh Foto e-KTP...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) setMessage(`⏳ Mengambil Data Biometrik NIK: ${nik}...`);
        
        else if (prev >= 30 && prev < 70) {
            setMessage("🤖 AI Matching: Membandingkan Wajah Kamera vs Database...");
            
            // 🔥 SIMULASI JOKI (NIK berakhiran 999 akan GAGAL)
            if (nik.endsWith("999") && prev === 50) {
                clearInterval(interval);
                setScanning(false);
                setIsBlocked(true);
                setBlockReason("FACE_MISMATCH");
                setMessage("⛔ VERIFIKASI GAGAL: Wajah Anda TIDAK COCOK dengan Foto e-KTP.");
                stopCamera();
                return 50;
            }
        } 
        else if (prev >= 70 && prev < 100) setMessage("✅ Skor Kecocokan: 98.9% (MATCH)");
        
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setScanFinished(true);
          const randomHash = "Qm" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          setIpfsHash(randomHash);
          setMessage("✅ Verifikasi 3 Lapis Selesai.");
          return 100;
        }
        return prev + 1; 
      });
    }, 50);
  };

  const handleManualConfirmation = () => {
    stopCamera();
    setMessage("🔒 Mengenkripsi Data...");
    setTimeout(() => {
       onVerified({
         human_score: 99, 
         ipfs_cid: ipfsHash, 
         timestamp: Math.floor(Date.now() / 1000),
         nik: nik, 
       });
    }, 1000);
  }

  // --- RENDER UI ---
  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-900 border border-red-500 rounded-2xl p-6 text-center animate-pulse">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-500">Akses Ditolak</h2>
        <p className="text-white font-bold mt-2 text-lg">{message}</p>
        
        <div className="mt-6 p-4 bg-red-900/30 rounded-lg border border-red-700 text-left w-full max-w-sm mx-auto">
            <p className="text-xs text-red-200 font-mono mb-2 border-b border-red-800 pb-1">SECURITY REPORT:</p>
            <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                <li className={blockReason === "WALLET_BLOCKED" ? "text-white font-bold" : "opacity-50"}>
                    Layer 1: Wallet Check {blockReason === "WALLET_BLOCKED" ? "(FAILED)" : "(PASSED)"}
                </li>
                <li className={blockReason === "NIK_USED" ? "text-white font-bold" : "opacity-50"}>
                    Layer 2: NIK/Nullifier Check {blockReason === "NIK_USED" ? "(FAILED)" : "(PASSED)"}
                </li>
                <li className={blockReason === "FACE_MISMATCH" ? "text-white font-bold" : "opacity-50"}>
                    Layer 3: Biometric Match {blockReason === "FACE_MISMATCH" ? "(FAILED)" : "(PASSED)"}
                </li>
            </ul>
        </div>

        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
            Reset Terminal
        </button>
      </div>
    );
  }

  if (!isNikVerified) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Terminal Verifikasi DPT</h2>
            <p className="text-gray-400 text-sm">Masukkan NIK untuk pengecekan 3 Lapis Keamanan.</p>
        </div>
        <div className="space-y-6 flex-grow flex flex-col justify-center">
          <input 
                type="text" 
                inputMode="numeric"
                maxLength={16} 
                value={nik}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setNik(val);
                  }
                }}
                placeholder="Masukkan NIK"
                className="w-full bg-black border-2 border-gray-600 rounded-xl p-5 text-white text-2xl tracking-[0.3em] text-center font-mono outline-none focus:border-cyan-500 transition-all"
                disabled={checkingNik}
            />
            <button onClick={handleCheckNIK} disabled={nik.length < 16 || checkingNik} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold py-5 rounded-xl shadow-lg">
                {checkingNik ? "MEMERIKSA BLOCKCHAIN..." : "VERIFIKASI DATA"}
            </button>
        </div>
        <div className="mt-4 text-[10px] text-gray-600 text-center font-mono">SECURITY: L1(WALLET) • L2(NULLIFIER) • L3(BIOMETRIC)</div>

        <div className="mt-8 p-5 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50">
          <p className="text-sm font-bold text-white mb-1">Tambah DPT Simulasi</p>
          <p className="text-xs text-gray-400 italic mb-4">
            *Note: Masukkan data bebas untuk keperluan simulasi. Data hilang jika web di-refresh.
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric" 
              placeholder="Masukkan NIK Baru (16 Digit)"
              value={simulasiNik}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setSimulasiNik(val);
                }
              }}
              maxLength={16}
              className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white text-sm outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Masukkan Nama (Opsional)"
              value={simulasiNama}
              onChange={(e) => setSimulasiNama(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white text-sm outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleTambahSimulasi}
              disabled={simulasiNik.length < 16}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-colors border border-gray-500"
            >
              + Tambahkan ke DPT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
      <div className="p-3 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 z-20">
        <div className="flex flex-col"><span className="text-xs font-mono text-cyan-500 tracking-widest">LAYER 3 SECURITY</span><span className="text-[10px] text-gray-400">NIK: {nik}</span></div>
        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${scanning ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div><span className="text-xs text-green-500 font-bold">LIVE</span></div>
      </div>
      <div className="relative h-[450px] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className={`absolute z-20 w-72 h-80 border-2 rounded-3xl transition-all duration-500 flex flex-col justify-between p-4 ${scanFinished ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)]" : scanning ? "border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] scale-105" : "border-cyan-500/30"}`}>
            <div className="flex justify-between"><div className="w-8 h-8 border-t-4 border-l-4 border-current rounded-tl-xl"></div><div className="w-8 h-8 border-t-4 border-r-4 border-current rounded-tr-xl"></div></div>
            {scanning && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_15px_#facc15] animate-[scan_2s_ease-in-out_infinite] opacity-80"></div>}
            <div className="flex justify-between"><div className="w-8 h-8 border-b-4 border-l-4 border-current rounded-bl-xl"></div><div className="w-8 h-8 border-b-4 border-r-4 border-current rounded-br-xl"></div></div>
        </div>
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-700 ${scanFinished ? "opacity-30 grayscale blur-sm" : "opacity-100"}`} />
        {scanFinished && (
            <div className="absolute z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <div className="bg-black/80 backdrop-blur-lg border border-green-500 p-8 rounded-2xl text-center shadow-2xl">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-green-400 font-bold text-2xl mb-2">WAJAH COCOK</h3>
                    <p className="text-gray-300 text-sm">Pemilik NIK Terverifikasi.</p>
                </div>
            </div>
        )}
      </div>
      <div className="p-6 bg-gray-900 border-t border-gray-800 relative z-20">
        <p className={`text-center text-xs mb-4 font-mono uppercase tracking-widest ${scanFinished ? "text-green-400" : "text-cyan-500"}`}>{`>> SYSTEM: ${message}`}</p>
        {scanning ? (
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden"><div className="bg-yellow-500 h-full transition-all duration-75" style={{ width: `${progress}%` }}></div></div>
        ) : scanFinished ? (
            <button onClick={handleManualConfirmation} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)]">LANJUT KE BILIK SUARA</button>
        ) : (
            <button onClick={startScanning} className="w-full bg-gray-800 hover:bg-gray-700 border border-cyan-500/50 text-cyan-400 font-bold py-5 rounded-xl shadow-lg tracking-widest">MULAI PENCOCOKAN WAJAH (1:1)</button>
        )}
      </div>
    </div>
  );
}