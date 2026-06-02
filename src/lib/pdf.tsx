import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

export interface SignatureData {
  /** Подпись стороны (например, "Сторона 1"). */
  label: string;
  /** Инициалы / Ф.И.О. подписанта. */
  initials: string;
  /** PNG data-URL нарисованной подписи (может быть пустым). */
  dataUrl: string;
}

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
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },
  signatureImage: {
    width: "100%",
    height: 60,
    objectFit: "contain",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginTop: 2,
    paddingTop: 3,
  },
  signatureInitials: {
    fontSize: 10,
  },
  inlineBold: {
    fontWeight: "bold",
  },
});

interface Segment {
  text: string;
  bold: boolean;
}

interface Line {
  segments: Segment[];
  /** Строка-заголовок: целиком в верхнем регистре → центрируем и делаем жирной. */
  heading: boolean;
}

// Управляющие символы-маркеры начала/конца жирного фрагмента.
const BOLD_OPEN = String.fromCharCode(1);
const BOLD_CLOSE = String.fromCharCode(2);

/** Разбивает строку на сегменты по маркерам жирного текста. */
function parseSegments(line: string): Segment[] {
  const segments: Segment[] = [];
  let bold = false;
  let buf = "";
  const flush = () => {
    if (buf) segments.push({ text: buf, bold });
    buf = "";
  };
  for (const ch of line) {
    if (ch === BOLD_OPEN) { flush(); bold = true; }
    else if (ch === BOLD_CLOSE) { flush(); bold = false; }
    else buf += ch;
  }
  flush();
  return segments;
}

function htmlToLines(html: string): Line[] {
  // Replace block-level tags with newlines
  let s = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");

  // Сохраняем жирные фрагменты (<strong>, <b>) маркерами до удаления тегов
  s = s
    .replace(/<(strong|b)(\s[^>]*)?>/gi, BOLD_OPEN)
    .replace(/<\/(strong|b)>/gi, BOLD_CLOSE);

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
    .map((line) => line.replace(/^\s+|\s+$/g, ""))
    .map((line) => ({ line, plain: line.replace(/[\u0001\u0002]/g, "") }))
    .filter(({ plain }) => plain.length > 0)
    .map(({ line, plain }) => ({
      segments: parseSegments(line),
      heading: plain === plain.toUpperCase() && plain.length > 3 && /[А-ЯЁA-Z]/.test(plain),
    }));
}

interface Props {
  title: string;
  htmlContent: string;
  signatures?: SignatureData[];
}

export function ContractPdfDocument({ title, htmlContent, signatures = [] }: Props) {
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
              {line.heading ? (
                <Text style={styles.bold}>
                  {line.segments.map((seg) => seg.text).join("")}
                </Text>
              ) : (
                <Text style={styles.text}>
                  {line.segments.map((seg, j) => (
                    <Text key={j} style={seg.bold ? styles.inlineBold : undefined}>
                      {seg.text}
                    </Text>
                  ))}
                </Text>
              )}
            </View>
          ))
        )}

        {signatures.length > 0 && (
          <View style={styles.signaturesRow} wrap={false}>
            {signatures.map((sig, i) => (
              <View key={i} style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>{sig.label}</Text>
                {sig.dataUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop
                  <Image style={styles.signatureImage} src={sig.dataUrl} />
                ) : (
                  <View style={styles.signatureImage} />
                )}
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureInitials}>
                    {sig.initials || "_______________________"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
