import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";

function Simple() {
  return createElement(Document, {},
    createElement(Page, { size: "A4", style: { padding: 40 } },
      createElement(Text, {}, "Hello PDF — тест кириллицы")
    )
  );
}

export async function GET() {
  try {
    const buffer = await renderToBuffer(createElement(Simple));
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=test.pdf",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
