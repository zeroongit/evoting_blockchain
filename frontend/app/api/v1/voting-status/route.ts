import { NextResponse } from 'next/server';

const globalStore = global as unknown as { 
  votingActive: boolean,
  validCSRFTokens: Set<string>
};

if (globalStore.votingActive === undefined) {
  globalStore.votingActive = false; // Default is false
}

export async function GET() {
  return NextResponse.json({ votingActive: globalStore.votingActive });
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("X-CSRF-Token");
    if (!csrfToken || !globalStore.validCSRFTokens?.has(csrfToken)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    if (typeof body.votingActive === 'boolean') {
      try {
        const action = body.votingActive ? "start" : "end";
        const backendRes = await fetch(`http://127.0.0.1:8081/api/v1/admin/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ electionId: 0 })
        });
        
        const backendData = await backendRes.json();
        
        if (!backendRes.ok) {
           return NextResponse.json({ error: backendData.error || "Gagal menghubungi blockchain relayer" }, { status: 500 });
        }
        
        globalStore.votingActive = body.votingActive;
        return NextResponse.json({ 
            votingActive: globalStore.votingActive, 
            message: `Voting is now ${globalStore.votingActive ? 'Active' : 'Disabled'}. Tx: ${backendData.txHash}` 
        });

      } catch (err: any) {
        console.error("Error calling Go backend:", err);
        return NextResponse.json({ error: "Gagal memanggil backend Go: " + err.message }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
