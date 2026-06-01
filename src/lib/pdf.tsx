import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "TimesDoc",
  fonts: [
    { src: path.join(fontsDir, "LiberationSerif-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "LiberationSerif-Bold.ttf"), fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 55,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "TimesDoc",
  },
  section: {
    marginBottom: 6,
  },
  text: {
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
  },
});

function htmlToLines(html: string): { text: string; bold: boolean }[] {
  // Replace block-level tags with newlines
  let s = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");

  // Strip all remaining tags
  s = s.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return s
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({
      text,
      bold: text === text.toUpperCase() && text.length > 3 && /[А-ЯЁA-Z]/.test(text),
    }));
}

interface Props {
  title: string;
  htmlContent: string;
}

export function ContractPdfDocument({ title, htmlContent }: Props) {
  const lines = htmlToLines(htmlContent);

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        {lines.length === 0 ? (
          <View style={styles.section}>
            <Text style={styles.text}>{title}</Text>
          </View>
        ) : (
          lines.map((line, i) => (
            <View key={i} style={styles.section}>
              <Text style={line.bold ? styles.bold : styles.text}>{line.text}</Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
