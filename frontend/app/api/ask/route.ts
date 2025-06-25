import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Change this URL to your FastAPI backend deployment
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/ask/";
  const res = await fetch(backendUrl, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 