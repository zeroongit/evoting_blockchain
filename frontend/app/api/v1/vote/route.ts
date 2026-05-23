import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Validasi CSRF Token
    const globalStore = global as unknown as { validCSRFTokens: Set<string> };
    const csrfToken = req.headers.get("X-CSRF-Token");
    if (!csrfToken || !globalStore.validCSRFTokens?.has(csrfToken)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();

    // 2. Fitur Blacklist NIK Simulasi Akhiran 999
    if (body.nik && body.nik.endsWith('999')) {
      return NextResponse.json({ 
        status: "REJECTED", 
        reason: "NIK terdeteksi dalam blacklist sistem (Simulasi)" 
      }, { status: 403 });
    }

    // 3. Ambil URL target dengan fallback yang aman
    const BACKEND_GO_URL = `${process.env.BACKEND_GO_URL}/vote`;
    // 4. Eksekusi Jembatan Request ke Go Backend dengan Timeout Kontrol
    try {
      const goResponse = await fetch(BACKEND_GO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        // Menambahkan opsi signal timeout jika backend Go hang/lama merespon
        signal: AbortSignal.timeout(35000) // Diperpanjang menjadi 35 detik agar ZK Prover di Go punya cukup waktu
      });

      // Ambil datanya sebagai teks terlebih dahulu untuk menghindari crash JSON parse
      const rawText = await goResponse.text();

      let goData;
      try {
        goData = JSON.parse(rawText);
      } catch {
        return NextResponse.json({ 
          error: "Invalid JSON response from Go backend", 
          raw_response: rawText 
        }, { status: 502 });
      }

      return NextResponse.json(goData, { status: goResponse.status });

    } catch (fetchError: unknown) {
      // TANGKAP ERROR PROXY DI SINI
      const err = fetchError as Error & { code?: string; cause?: unknown };

      return NextResponse.json({ 
        error: "Internal Server Error / Backend Go Unreachable",
        details: err.message 
      }, { status: 500 });
    }

  } catch (error: unknown) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}