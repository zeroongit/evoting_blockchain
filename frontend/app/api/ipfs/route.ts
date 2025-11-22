import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const formData = new FormData();
    formData.append("file", file);

    // Metadata opsional (biar rapi di dashboard Pinata)
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    // Options opsional
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    // Kirim ke PINATA
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        // Ambil kunci dari .env
        pinata_api_key: process.env.PINATA_API_KEY!,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Pinata Error: ${res.statusText}`);
    }

    const json = await res.json();
    
    // Kembalikan Hash (IpfsHash) ke Frontend
    return NextResponse.json({ cid: json.IpfsHash });

  } catch (error: any) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}