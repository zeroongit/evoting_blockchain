// lib/ipfs.ts

export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ipfs", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Gagal upload ke IPFS");
  }

  const data = await response.json();
  return data.cid; 
}

export function getIPFSUrl(cid: string) {
  // Gunakan Gateway Publik yang stabil untuk Skripsi
  // Opsi 1: Gateway Pinata (kadang ada limit bandwidth)
  // return `https://gateway.pinata.cloud/ipfs/${cid}`;
  
  // Opsi 2: Gateway Cloudflare (Biasanya lebih cepat & gratis)
  return `https://cloudflare-ipfs.com/ipfs/${cid}`;
}