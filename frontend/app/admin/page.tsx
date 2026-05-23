"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { toast } from "sonner";

const API_URL = process.env.BACKEND_GO_URL || "http://127.0.0.1:8080/api/v1";

const publicClient = createPublicClient({ 
  chain: avalancheFuji, 
  transport: http(),
});

interface WindowProvider {
  isAvalanche?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export default function AdminPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [dptList, setDptList] = useState<{name?: string, FullName?: string, full_name?: string, nik: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [votingActive, setVotingActive] = useState(false);

  const fetchBlockchainStatus = useCallback(async () => {
    try {
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
      const electionInfo = await publicClient.readContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "getElection",
        args: [BigInt(0)],
        blockTag: 'latest',
      }) as { state: number };
      
      // Di smart contract, state 1 berarti Active
      setVotingActive(electionInfo.state === 1);
    } catch { }
  }, []);

  const fetchDpt = useCallback(() => {
    fetch(`${API_URL}/dpt`)
      .then(res => res.json())
      .then(data => setDptList(data.dpt || []))
      .catch(() => {});
    
    fetchBlockchainStatus();
  }, [fetchBlockchainStatus]);

  useEffect(() => {
    if (walletConnected) {
      fetchDpt();
    }
  }, [walletConnected, fetchDpt]);

  const connectWallet = async () => {
    // 🚀 SINKRONISASI PROVIDER: Wajibkan Core Wallet (window.avalanche)
    const win = window as unknown as { avalanche?: WindowProvider; ethereum?: WindowProvider };
    
    // Kita hanya mengambil objek dari Core Wallet untuk menghindari koneksi via MetaMask
    let provider = null;
    if (typeof win.avalanche !== 'undefined') {
      provider = win.avalanche;
    } else if (typeof win.ethereum !== 'undefined' && win.ethereum.isAvalanche) {
      provider = win.ethereum;
    }

    if (provider) {
      try {
        // Request account access - Membuka pop-up Core Wallet secara instan
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        
        // Memastikan wallet langsung berpindah ke Avalanche Fuji Testnet (ChainID 43113)
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }], // 0xa869 adalah hex dari 43113 (Fuji Testnet)
          });
        } catch (switchError: unknown) {
          // Jika network fuji belum ada di Core Wallet, daftarkan otomatis secara dinamis
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xa869',
                  chainName: 'Avalanche Fuji Testnet',
                  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
                  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://testnet.snowtrace.io/']
                }]
              });
        } catch { }
          }
        }

        setAddress(accounts[0]);
        setWalletConnected(true);
    } catch { }
    } else {
      toast.error("Silakan install ekstensi Core Wallet untuk akses Otoritas Admin. MetaMask tidak didukung di halaman ini.");
    }
  };

  const generateNewDpt = async () => {
    if (!newName.trim()) {
      toast.error("Nama pemilih harus diisi");
      return;
    }
    setLoading(true);
    try {
      const csrfRes = await fetch(`${API_URL}/csrf-token`);
      const csrfData = await csrfRes.json();

      const res = await fetch(`${API_URL}/dpt`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({ name: newName, simulationType: "valid" })
      });
      await res.json();
      setNewName("");
      fetchDpt();
    } catch { 
    } finally {
      setLoading(false);
    }
  };

  const toggleVoting = async (active: boolean) => {
    setLoading(true);
    try {
      const csrfRes = await fetch(`${API_URL}/csrf-token`);
      const csrfData = await csrfRes.json();

      const endpoint = active ? `${API_URL}/admin/start` : `${API_URL}/admin/end`;
      const res = await fetch(endpoint, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({ electionId: 0 }) // Mengirimkan body sebagai angka (int64) agar sesuai dengan Golang
      });
      const data = await res.json();
      if (res.ok) {
        setVotingActive(active);
        toast.success(data.message || `Status voting berhasil diubah menjadi ${active ? 'AKTIF' : 'NON-AKTIF'}`);
      } else {
        toast.error(data.error || "Gagal mengubah status voting");
      }
    } catch(err) {
      toast.error("Gagal memproses transaksi: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">Portal Admin VibeVote</h2>
      
      {!walletConnected ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-700 mb-6 font-medium">Hanya panitia yang diizinkan mengakses halaman ini. Otorisasi diperlukan.</p>
          <button 
            onClick={connectWallet}
            className="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 text-xl transition shadow-lg"
          >
            Koneksi Wallet Admin
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <p className="text-green-800 font-bold text-lg">Terhubung sebagai Otoritas:</p>
            <p className="font-mono text-gray-700 break-all">{address}</p>
          </div>

          <div className="p-6 border rounded-xl bg-gray-50 flex gap-4 flex-wrap">
            <div className="w-full mb-4">
              <h3 className="text-2xl font-bold">Mulai / Akhiri Pemilihan</h3>
              <p className="text-gray-600">Status Saat Ini: <span className={`font-bold ${votingActive ? 'text-green-600' : 'text-red-500'}`}>{votingActive ? 'AKTIF' : 'NON-AKTIF'}</span></p>
            </div>
            
            {votingActive ? (
              <button 
                onClick={() => toggleVoting(false)}
                disabled={loading}
                className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 text-lg disabled:opacity-50"
              >
                Stop Voting
              </button>
            ) : (
              <button 
                onClick={() => toggleVoting(true)}
                disabled={loading}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 text-lg disabled:opacity-50"
              >
                Start Voting
              </button>
            )}
          </div>

          <div className="p-6 border rounded-xl bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-bold">Daftar Pemilih Tetap (DPT)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Pemilih"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <button 
                  onClick={generateNewDpt}
                  disabled={loading}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  {loading ? 'Membuat...' : '+ Tambah DPT Dummy'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Berikut adalah daftar pemilih yang berhak memberikan suara:</p>
            
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK Penduduk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 font-mono text-sm">
                  {dptList.map((dpt, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{i + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-sans">{dpt.FullName || dpt.full_name || dpt.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{dpt.nik}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">Registered</td>
                    </tr>
                  ))}
                  {dptList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Belum ada DPT.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
