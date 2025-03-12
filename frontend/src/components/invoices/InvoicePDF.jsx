import React from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

// Define PDF styles
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 4 },
  header: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  line: { borderBottom: "1px solid black", marginBottom: 6 },
});

// Invoice PDF Component
const InvoicePDF = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.text}>Invoice Number: {invoice.invoiceNumber}</Text>
        <Text style={styles.text}>Date: {invoice.date}</Text>
      </View>

      <View style={styles.line} />

      {/* Student Details */}
      <View style={styles.section}>
        <Text style={styles.header}>Student Information</Text>
        <Text style={styles.text}>Name: {invoice.studentName}</Text>
        <Text style={styles.text}>ID: {invoice.studentId}</Text>
        <Text style={styles.text}>Grade: {invoice.grade}</Text>
      </View>

      <View style={styles.line} />

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.header}>Payment Details</Text>
        {invoice.items.map((item, index) => (
          <Text key={index} style={styles.text}>
            {item.description}: ${item.amount}
          </Text>
        ))}
        <View style={styles.line} />
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
          Total: ${invoice.totalAmount}
        </Text>
      </View>
    </Page>
  </Document>
);

// Download PDF Button
export const DownloadInvoiceButton = ({ invoice }) => (
  <PDFDownloadLink document={<InvoicePDF invoice={invoice} />} fileName={`invoice_${invoice.invoiceNumber}.pdf`}>
    {({ loading }) => (loading ? "Generating PDF..." : "Download Invoice")}
  </PDFDownloadLink>
);

export default InvoicePDF;