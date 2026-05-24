import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.BACKEND_GO_URL}/verify-nik`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}