import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles for the PDF
const styles = StyleSheet.create({
  page: { padding: 20 },
  header: { fontSize: 20, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
  section: { marginBottom: 10 },
  text: { fontSize: 12 },
});

export default function InvoicePDF({ invoice }) {
    console.log("Invoice Data:", invoice); // Debugging
  
    if (!invoice) {
      return (
        <Document>
          <Page style={styles.page}>
            <Text>Error: No invoice data provided</Text>
          </Page>
        </Document>
      );
    }
    
    return (
      <Document>
        <Page style={styles.page}>
          <View>
            <Text style={styles.header}>Invoice #{invoice.id}</Text>
            <View style={styles.section}>
              <Text style={styles.text}>Student: {invoice.student}</Text>
              <Text style={styles.text}>Amount: {invoice.amount}</Text>
              <Text style={styles.text}>Date: {invoice.date}</Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  }