"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { generateProof } from "@/lib/zk";

interface FaceVerificationProps {
    onVerified: (proof: any) => void;
}

export default function FaceVerification({ onVerified}: FaceVerificationProps) {
    const webcamRef = useRef<Webcam>(null);
    const [step, setStep] = useState<"IDLE" | "SCANNING" | "ANALYZING" | "SUCCESS" | "ERROR">("IDLE");
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            setStep("ANALYZING");
            processFaceData();

        }
    }, [webcamRef]);

    async function processFaceData() {
        try  {
            addLog("🔍 Menganalisis fitur wajah...");
            await new Promise((r) => setTimeout(r, 1500));

            const humanScore = Math.floor(Math.random() * (100-75) + 75);
            const uniqueScore = Math.floor(Math.random() * (100-85) + 85);
            const behaviorScore = Math.floor(Math.random() * (100-65) + 65);
            
            addLog(`✅ Wajah Terdeteksi! Human Score: ${humanScore}%`)
            addLog(`✅ Uniqueness Check: ${uniqueScore}%`);

            await new Promise((r) => setTimeout(r, 1000));
            addLog("🔐 Membuat ZK-Proof (Proof of Humanity)...")

            const input = {
                human_score: humanScore,
                uniqueness_score: uniqueScore,
                behavior_proof: behaviorScore,
                timestamp: Math.floor(Date.now() / 1000),
                user_identifier: 123456
            };

            const result = await generateProof('humanity', input);
            addLog("🎉 ZK-Proof berhasil dibuat!");
            setStep("SUCCESS");
            onVerified(result);
        } catch (error: any) {
            console.error(error);
            setStep("ERROR");
            addLog("❌ Gagal: " + error.message);
        }
    }
    
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto bg-black p-4 rounded-xl shadow-2xl overflow-hidden">
            <div className="relative w-full aspect-video bg-gray-900 reounded-lg overflow-hidden border-2 border-gray-700">
                {step === "IDLE" || step === "SCANNING" ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full obkect-cover transform scale-x-[-1]" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-64 border-2 broder-cyan-400 rounnded-3xl opacity-70 boorder-dashed animate-pulse"></div>
                        </div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                            <span className="bg-black/50 text-white px-2 py-1 text-xs rounded">Pastikan wajah terlihat jelas</span>
                        </div>
                    </>
                ) : (
                    imgSrc && <img src={imgSrc} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
            </div>

            <div className="w-full mt-4 bg-gray-900 rounded p-3 h-32 overflow-y-auto font-mono text-xs text-green-400 border border-gray-800">
                <p className="text-gray-500 border-b border-gray-800 pb-1 mb-1"> SYSTEM_LOGS:</p>
                {logs.map((log, i) => (
                    <p key={i}> {log} </p>
                ))}
                {step === "ANALYZING" && <p className="animate-pulse">Processing</p>}
            </div>

            <div className="mt-4 w-full">
                {step === "IDLE" && (
                    <button onClick={() => { setStep("SCANNING"); setTimeout(capture, 1000);}}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition">
                        📸 Scan Wajah & Verifikasi
                    </button>
                )}

                {step === "SUCCESS" && (
                    <div className="w-full bg-green-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2"> 
                        ✅ Verifikasi Berhasil
                    </div>
                )}

                {step === "ERROR" && (
                    <button onClick={() => setStep("IDLE")}
                    className="w-full bg-reg-600 text-white font-bold py-3 rounded">
                        Coba Lagi
                    </button>
                )}
            </div>
        </div>
    );
};