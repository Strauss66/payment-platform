import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../../components/InvoicePDF.jsx"; // Ensure this exists

export default function DownloadInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Dummy invoice data (Replace this with API data)
  const invoices = [
    { id: 1, student: "John Doe", amount: "$500", date: "03/10/2025" },
    { id: 2, student: "Jane Smith", amount: "$300", date: "02/15/2025" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Download Invoices</h1>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => setSelectedInvoice(invoice)}
            className={`p-4 border rounded-lg shadow cursor-pointer flex flex-col bg-white transition-transform transform ${
              selectedInvoice?.id === invoice.id ? "bg-blue-100 scale-105" : "hover:bg-gray-50"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-700">Invoice #{invoice.id}</h3>
            <p className="text-gray-600">Student: <span className="font-medium">{invoice.student}</span></p>
            <p className="text-gray-600">Amount: <span className="font-medium">{invoice.amount}</span></p>
            <p className="text-gray-600">Date: <span className="font-medium">{invoice.date}</span></p>
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
                <button className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">Generating PDF...</button>
              ) : (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Download Invoice
                </button>
              )
            }
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}
