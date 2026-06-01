import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { parse } from "node-html-parser";
import path from "path";

// Liberation Serif — metric-compatible Times New Roman with full Cyrillic,
// the standard typeface for official documents.
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "TimesDoc",
  fonts: [
    { src: path.join(fontsDir, "LiberationSerif-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "LiberationSerif-Bold.ttf"), fontWeight: "bold" },
  ],
});

const s = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 55,
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
    fontFamily: "TimesDoc",
  },
  h2: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  h3: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
  },
  p: {
    marginBottom: 6,
    textAlign: "justify",
  },
  li: {
    marginBottom: 3,
    paddingLeft: 12,
  },
  bold: {
    fontWeight: "bold",
  },
});

// node-html-parser node types: 1 = element, 3 = text.
// We deliberately avoid `instanceof` checks because module bundling
// (Turbopack) can produce duplicate class identities, breaking them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

const ELEMENT = 1;
const TEXT = 3;
const clean = (str: string) => str.replace(/\s+/g, " ");

const BLOCK_TAGS = new Set([
  "h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "div", "section", "article",
]);

function hasBlockChildren(node: Node): boolean {
  return node.childNodes.some(
    (c: Node) => c.nodeType === ELEMENT && BLOCK_TAGS.has((c.tagName || "").toLowerCase())
  );
}

// Render inline content (text + <strong>) of a node into React-PDF nodes.
function renderInline(node: Node): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  for (const child of node.childNodes) {
    if (child.nodeType === TEXT) {
      const t = clean(child.rawText);
      if (t.trim()) parts.push(t);
    } else if (child.nodeType === ELEMENT) {
      const tag = (child.tagName || "").toLowerCase();
      if (tag === "strong" || tag === "b") {
        parts.push(
          <Text key={parts.length} style={s.bold}>
            {clean(child.innerText)}
          </Text>
        );
      } else {
        const t = clean(child.innerText);
        if (t.trim()) parts.push(t);
      }
    }
  }
  return parts;
}

function walk(node: Node, elements: React.ReactElement[], key: { v: number }) {
  for (const child of node.childNodes) {
    if (child.nodeType !== ELEMENT) continue;
    const tag = (child.tagName || "").toLowerCase();
    const k = key.v++;

    if (tag === "h2") {
      const txt = clean(child.innerText).trim();
      if (txt) elements.push(<Text key={k} style={s.h2}>{txt}</Text>);
    } else if (tag === "h3") {
      const txt = clean(child.innerText).trim();
      if (txt) elements.push(<Text key={k} style={s.h3}>{txt}</Text>);
    } else if (tag === "p") {
      const inline = renderInline(child);
      const txt = clean(child.innerText).trim();
      if (txt) {
        elements.push(
          <Text key={k} style={s.p}>{inline.length > 0 ? inline : txt}</Text>
        );
      }
    } else if (tag === "ul" || tag === "ol") {
      for (const li of child.querySelectorAll("li")) {
        const txt = clean(li.innerText).trim();
        if (txt) elements.push(<Text key={key.v++} style={s.li}>{"• " + txt}</Text>);
      }
    } else if (tag === "li") {
      const txt = clean(child.innerText).trim();
      if (txt) elements.push(<Text key={k} style={s.li}>{"• " + txt}</Text>);
    } else if (tag === "div" || tag === "section" || tag === "article") {
      if (hasBlockChildren(child)) {
        walk(child, elements, key);
      } else {
        const txt = clean(child.innerText).trim();
        if (txt) elements.push(<Text key={k} style={s.p}>{txt}</Text>);
      }
    } else if (tag === "span") {
      const txt = clean(child.innerText).trim();
      if (txt) elements.push(<Text key={k} style={s.p}>{txt}</Text>);
    }
  }
}

interface Props {
  title: string;
  htmlContent: string;
}

export function ContractPdfDocument({ title, htmlContent }: Props) {
  const root = parse(htmlContent);
  const elements: React.ReactElement[] = [];
  walk(root as unknown as Node, elements, { v: 0 });

  // Fallback: if structured parsing produced nothing, dump plain text
  // so the document is never blank.
  if (elements.length === 0) {
    const plain = clean(parse(htmlContent).innerText).trim();
    if (plain) elements.push(<Text key={0} style={s.p}>{plain}</Text>);
  }

  return (
    <Document title={title}>
      <Page size="A4" style={s.page}>
        {elements}
      </Page>
    </Document>
  );
}
