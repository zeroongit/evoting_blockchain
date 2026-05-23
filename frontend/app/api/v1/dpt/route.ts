import { NextResponse } from 'next/server';
export async function GET() {
  const res = await fetch("http://127.0.0.1:8080/api/v1/dpt");
  const data = await res.json();
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch("http://127.0.0.1:8080/api/v1/dpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}