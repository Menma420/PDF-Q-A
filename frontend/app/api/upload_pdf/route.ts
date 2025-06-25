import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Change this URL to your FastAPI backend deployment
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/upload_pdf/";
  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text || "Unknown error from backend" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ detail: "Backend not reachable" }, { status: 500 });
  }
} 