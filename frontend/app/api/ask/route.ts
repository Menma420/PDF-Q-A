import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Use NEXT_PUBLIC_API_BASE_URL for the FastAPI backend
  const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/ask/";
  const res = await fetch(backendUrl, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 