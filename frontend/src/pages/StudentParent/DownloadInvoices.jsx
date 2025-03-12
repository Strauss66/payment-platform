import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../../components/InvoicePDF.jsx"; // We'll create this next

export default function DownloadInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Dummy invoice data (Replace this with API data)
  const invoices = [
    { id: 1, student: "John Doe", amount: "$500", date: "03/10/2025" },
    { id: 2, student: "Jane Smith", amount: "$300", date: "02/15/2025" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Download Invoices</h1>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => {
              console.log("Selected Invoice:", invoice); // Debugging
              setSelectedInvoice(invoice);
            }}
            className={`p-4 border rounded-lg cursor-pointer ${selectedInvoice?.id === invoice.id ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
          >
            <h3 className="text-lg font-semibold">Invoice #{invoice.id}</h3>
            <p>Student: {invoice.student}</p>
            <p>Amount: {invoice.amount}</p>
            <p>Date: {invoice.date}</p>
          </div>
        ))}
      </div>

      {/* Show download button only when an invoice is selected */}
      {selectedInvoice && (
        <div className="mt-6">
          <PDFDownloadLink
            document={<InvoicePDF invoice={selectedInvoice} />}
            fileName={`Invoice-${selectedInvoice.id}.pdf`}
          >
            {({ loading }) =>
              loading ? (
                <button className="bg-gray-400 text-white px-4 py-2 rounded-md">Generating PDF...</button>
              ) : (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Download Invoice</button>
              )
            }
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}