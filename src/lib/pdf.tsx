import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import Html from "react-pdf-html";

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 55,
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
});

const stylesheet = {
  h2: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  h3: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
  },
  p: {
    marginBottom: 6,
    textAlign: "justify",
  },
  ul: {
    marginLeft: 16,
    marginBottom: 6,
  },
  li: {
    marginBottom: 3,
  },
  strong: {
    fontWeight: "bold",
  },
  ".grid": {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    marginTop: 24,
  },
};

interface Props {
  title: string;
  htmlContent: string;
}

export function ContractPdfDocument({ title, htmlContent }: Props) {
  const html = `<html><body>${htmlContent}</body></html>`;

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Html stylesheet={stylesheet}>{html}</Html>
      </Page>
    </Document>
  );
}
