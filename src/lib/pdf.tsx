import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { parse, HTMLElement as NHTMLElement } from "node-html-parser";
import path from "path";

// Register DejaVu Sans (full Cyrillic support) from local TTF files
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "DejaVu",
  fonts: [
    { src: path.join(fontsDir, "DejaVuSans.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "DejaVuSans-Bold.ttf"), fontWeight: "bold" },
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
    fontFamily: "DejaVu",
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
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 20,
  },
  sigBlock: {
    flex: 1,
  },
});

function renderInline(node: NHTMLElement): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const t = child.rawText.replace(/\s+/g, " ");
      if (t.trim()) parts.push(t);
    } else if (child instanceof NHTMLElement) {
      const tag = child.tagName?.toLowerCase();
      if (tag === "strong" || tag === "b") {
        parts.push(
          <Text key={parts.length} style={s.bold}>
            {child.innerText.replace(/\s+/g, " ")}
          </Text>
        );
      } else {
        const t = child.innerText.replace(/\s+/g, " ");
        if (t.trim()) parts.push(t);
      }
    }
  }
  return parts;
}

function walk(node: NHTMLElement, elements: React.ReactElement[], key: { v: number }) {
  for (const child of node.childNodes) {
    if (!(child instanceof NHTMLElement)) continue;
    const tag = child.tagName?.toLowerCase();
    const k = key.v++;

    if (tag === "h2") {
      const txt = child.innerText.replace(/\s+/g, " ").trim();
      if (txt) elements.push(<Text key={k} style={s.h2}>{txt}</Text>);
    } else if (tag === "h3") {
      const txt = child.innerText.replace(/\s+/g, " ").trim();
      if (txt) elements.push(<Text key={k} style={s.h3}>{txt}</Text>);
    } else if (tag === "p") {
      const inline = renderInline(child);
      const txt = child.innerText.replace(/\s+/g, " ").trim();
      if (txt) {
        elements.push(
          <Text key={k} style={s.p}>{inline.length > 0 ? inline : txt}</Text>
        );
      }
    } else if (tag === "ul") {
      for (const li of child.querySelectorAll("li")) {
        elements.push(
          <Text key={key.v++} style={s.li}>{"• " + li.innerText.replace(/\s+/g, " ").trim()}</Text>
        );
      }
    } else if (tag === "li") {
      const txt = child.innerText.replace(/\s+/g, " ").trim();
      if (txt) elements.push(<Text key={k} style={s.li}>{"• " + txt}</Text>);
    } else if (tag === "div" || tag === "section") {
      // Signatures grid: div with class "grid" containing 2 child divs
      if (child.classNames.includes("grid")) {
        const childDivs = child.querySelectorAll("div");
        if (childDivs.length >= 2) {
          elements.push(
            <View key={k} style={s.sigRow}>
              <Text style={[s.p, s.sigBlock]}>{childDivs[0].innerText.replace(/\s+/g, " ").trim()}</Text>
              <Text style={[s.p, s.sigBlock]}>{childDivs[1].innerText.replace(/\s+/g, " ").trim()}</Text>
            </View>
          );
          continue;
        }
      }
      // If the div has no block-level children (e.g. only spans/text),
      // render its combined text as a paragraph so nothing is lost.
      if (hasBlockChildren(child)) {
        walk(child, elements, key);
      } else {
        const txt = child.innerText.replace(/\s+/g, " ").trim();
        if (txt) elements.push(<Text key={k} style={s.p}>{txt}</Text>);
      }
    } else if (tag === "span") {
      // Stray top-level span — capture its text
      const txt = child.innerText.replace(/\s+/g, " ").trim();
      if (txt) elements.push(<Text key={k} style={s.p}>{txt}</Text>);
    }
  }
}

const BLOCK_TAGS = new Set(["h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "div", "section", "article"]);

function hasBlockChildren(node: NHTMLElement): boolean {
  return node.childNodes.some(
    (c) => c instanceof NHTMLElement && BLOCK_TAGS.has(c.tagName?.toLowerCase() ?? "")
  );
}

interface Props {
  title: string;
  htmlContent: string;
}

export function ContractPdfDocument({ title, htmlContent }: Props) {
  const root = parse(htmlContent);
  const elements: React.ReactElement[] = [];
  walk(root as unknown as NHTMLElement, elements, { v: 0 });

  return (
    <Document title={title}>
      <Page size="A4" style={s.page}>
        {elements}
      </Page>
    </Document>
  );
}
