import { NextResponse } from 'next/server';
export async function GET() {
  const res = await fetch(`${process.env.BACKEND_GO_URL}/dpt`);
  const data = await res.json();
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.BACKEND_GO_URL}/dpt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}