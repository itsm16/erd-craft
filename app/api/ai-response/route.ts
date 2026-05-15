import { getAiResponse } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { prompt } = body

    const response = await getAiResponse(process.env.NEXT_PUBLIC_GEMINI_API_KEY!, prompt)

    return NextResponse.json({ response})
}