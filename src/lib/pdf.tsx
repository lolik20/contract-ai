import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { parse, HTMLElement as NHTMLElement } from "node-html-parser";

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
    paddingLeft: 12,
    fontFamily: "Times-Roman",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  sigBlock: {
    flex: 1,
  },
});

// Render inline content of a node: handles <strong>, text nodes, <span>
function renderInline(node: NHTMLElement): React.ReactNode[] {
  const parts: React.ReactNode[] = [];

  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      // text node
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
        // span, em, any other inline — treat as plain text
        const t = child.innerText.replace(/\s+/g, " ");
        if (t.trim()) parts.push(t);
      }
    }
  }

  return parts;
}

// Walk the DOM tree and collect PDF elements
function walk(node: NHTMLElement, elements: React.ReactElement[], key: { v: number }) {
  for (const child of node.childNodes) {
    if (!(child instanceof NHTMLElement)) continue;

    const tag = child.tagName?.toLowerCase();
    const k = key.v++;

    if (tag === "h2") {
      elements.push(
        <Text key={k} style={s.h2}>{child.innerText.replace(/\s+/g, " ").trim()}</Text>
      );
    } else if (tag === "h3") {
      elements.push(
        <Text key={k} style={s.h3}>{child.innerText.replace(/\s+/g, " ").trim()}</Text>
      );
    } else if (tag === "p") {
      const inline = renderInline(child);
      if (inline.length > 0) {
        elements.push(
          <Text key={k} style={s.p}>{inline}</Text>
        );
      }
    } else if (tag === "ul") {
      // render each <li>
      for (const li of child.querySelectorAll("li")) {
        elements.push(
          <Text key={key.v++} style={s.li}>{"• " + li.innerText.replace(/\s+/g, " ").trim()}</Text>
        );
      }
    } else if (tag === "li") {
      elements.push(
        <Text key={k} style={s.li}>{"• " + child.innerText.replace(/\s+/g, " ").trim()}</Text>
      );
    } else if (tag === "div" || tag === "section" || tag === "article") {
      // check if this div contains a signature block (2 child divs side by side)
      const childDivs = child.querySelectorAll(":scope > div");
      if (childDivs.length === 2 && child.classNames.includes("grid")) {
        // signatures row
        const left = childDivs[0].innerText.replace(/\s+/g, " ").trim();
        const right = childDivs[1].innerText.replace(/\s+/g, " ").trim();
        elements.push(
          <View key={k} style={s.sigRow}>
            <Text style={[s.p, s.sigBlock]}>{left}</Text>
            <Text style={[s.p, s.sigBlock]}>{right}</Text>
          </View>
        );
      } else {
        // recurse into div
        walk(child, elements, key);
      }
    }
    // ignore: span (inline only), script, style, etc.
  }
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
