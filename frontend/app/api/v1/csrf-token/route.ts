import { NextResponse } from 'next/server';

const globalStore = global as unknown as { 
  dptStore: { name: string, nik: string }[],
  validCSRFTokens: Set<string>
};
if (!globalStore.dptStore) {
  globalStore.dptStore = [];
}
if (!globalStore.validCSRFTokens) {
  globalStore.validCSRFTokens = new Set();
}

export async function GET() {
  const randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  globalStore.validCSRFTokens.add(randomToken);
  return NextResponse.json({ csrfToken: randomToken });
}
