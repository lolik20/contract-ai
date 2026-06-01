import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 55,
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
    fontFamily: "Times-Roman",
  },
  h2: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  h3: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    marginTop: 12,
    marginBottom: 5,
  },
  p: {
    marginBottom: 6,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  li: {
    marginBottom: 3,
    paddingLeft: 8,
    fontFamily: "Times-Roman",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
  },
});

// ---- tiny HTML → tokens parser ----------------------------------------

type Token =
  | { type: "h2" | "h3" | "p"; text: string; html: string }
  | { type: "li"; text: string }
  | { type: "hr" };

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function parseHtml(html: string): Token[] {
  const tokens: Token[] = [];

  // headings
  html = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => {
    tokens.push({ type: "h2", text: stripTags(inner), html: inner });
    return "%%TOKEN%%";
  });
  html = html.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => {
    tokens.push({ type: "h3", text: stripTags(inner), html: inner });
    return "%%TOKEN%%";
  });

  // list items
  html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => {
    tokens.push({ type: "li", text: "• " + stripTags(inner) });
    return "%%TOKEN%%";
  });

  // paragraphs and divs
  html = html.replace(/<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>/gi, (_, inner) => {
    const text = stripTags(inner).trim();
    if (text) tokens.push({ type: "p", text, html: inner });
    return "%%TOKEN%%";
  });

  // remaining text nodes outside tags
  const leftover = stripTags(html).replace(/%%TOKEN%%/g, "").trim();
  if (leftover) tokens.push({ type: "p", text: leftover, html: leftover });

  return tokens;
}

// Render inline bold segments: text between <strong>…</strong>
function renderRichText(html: string) {
  const parts: React.ReactElement[] = [];
  const regex = /<strong[^>]*>([\s\S]*?)<\/strong>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(html)) !== null) {
    if (m.index > last) {
      const plain = stripTags(html.slice(last, m.index));
      if (plain) parts.push(<Text key={i++}>{plain}</Text>);
    }
    const bold = stripTags(m[1]);
    parts.push(<Text key={i++} style={s.bold}>{bold}</Text>);
    last = m.index + m[0].length;
  }

  const tail = stripTags(html.slice(last));
  if (tail) parts.push(<Text key={i++}>{tail}</Text>);

  return parts.length > 0 ? parts : [<Text key={0}>{stripTags(html)}</Text>];
}

// -----------------------------------------------------------------------

interface Props {
  title: string;
  htmlContent: string;
}

export function ContractPdfDocument({ title, htmlContent }: Props) {
  const tokens = parseHtml(htmlContent);

  return (
    <Document title={title}>
      <Page size="A4" style={s.page}>
        {tokens.map((token, idx) => {
          if (token.type === "h2") {
            return <Text key={idx} style={s.h2}>{token.text}</Text>;
          }
          if (token.type === "h3") {
            return <Text key={idx} style={s.h3}>{token.text}</Text>;
          }
          if (token.type === "li") {
            return <Text key={idx} style={s.li}>{token.text}</Text>;
          }
          if (token.type === "p" && token.html) {
            return (
              <Text key={idx} style={s.p}>
                {renderRichText(token.html)}
              </Text>
            );
          }
          return null;
        })}
      </Page>
    </Document>
  );
}
