import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this PDF document and provide:

              1. Extract all headings, titles, and section headers. Return them as clean text without any markdown formatting (no **, __, *, etc.). Focus on identifying clear structural elements like chapter titles, section headings, and major topic headers.

              2. Generate a comprehensive summary of the document's content. Write in plain text without any markdown formatting. Provide a concise but thorough overview of the main topics, key points, and overall purpose of the document.

              Important: Return all text in plain format without any markdown symbols, asterisks, underscores, or other formatting characters. Keep the response clean and readable.`,
            },
            {
              type: "file",
              data: buffer,
              mimeType: "application/pdf",
            },
          ],
        },
      ],
      schema: z.object({
        headings: z
          .array(z.string())
          .describe("Array of extracted headings and section titles from the document in plain text format"),
        summary: z
          .string()
          .describe(
            "Comprehensive summary of the document content in plain text format, highlighting main topics and key points",
          ),
      }),
      maxRetries: 3,
    })

    return NextResponse.json({
      headings: result.object.headings,
      summary: result.object.summary,
      filename: file.name,
    })
  } catch (error) {
    console.error("Error processing PDF:", error)

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
      if (error.message.includes("quota")) {
        return NextResponse.json({ error: "API quota exceeded. Please check your API key." }, { status: 429 })
      }
    }

    return NextResponse.json({ error: "Failed to process PDF. Please try again." }, { status: 500 })
  }
}
