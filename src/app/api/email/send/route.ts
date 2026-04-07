import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email not configured — add RESEND_API_KEY" }, { status: 503 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { to, subject, message, fromName } = await req.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: `${fromName ?? "Logix Layer Finance"} <finance@logixlayer.com>`,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="border-bottom: 2px solid #3B2D8E; padding-bottom: 16px; margin-bottom: 24px;">
            <strong style="font-size: 18px; color: #3B2D8E;">Logix Layer N.V.</strong>
            <p style="margin: 4px 0 0; color: #666; font-size: 13px;">Finance Department</p>
          </div>
          <div style="white-space: pre-wrap; line-height: 1.6; font-size: 15px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
          <div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 16px; color: #999; font-size: 12px;">
            Logix Layer N.V. · Herengracht 182, Amsterdam · finance@logixlayer.com
          </div>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
