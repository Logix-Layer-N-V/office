import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json([])
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(
      { error: "Tasks model not yet in database. Coming soon." },
      { status: 503 }
    )
  } catch {
    return NextResponse.json(
      { error: "Tasks model not yet in database. Coming soon." },
      { status: 503 }
    )
  }
}
