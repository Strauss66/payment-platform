import React, { useState, useEffect } from "react";
import { DownloadInvoiceButton } from "../../components/invoices/InvoicePDF";

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch invoices (simulated API response)
  useEffect(() => {
    setInvoices([
      {
        invoiceNumber: "INV-001",
        date: "2025-03-10",
        studentName: "John Doe",
        studentId: "12345",
        grade: "10th",
        items: [
          { description: "Tuition Fee - March", amount: 500 },
          { description: "Library Fee", amount: 50 },
        ],
        totalAmount: 550,
      },
      {
        invoiceNumber: "INV-002",
        date: "2025-02-10",
        studentName: "John Doe",
        studentId: "12345",
        grade: "10th",
        items: [{ description: "Tuition Fee - February", amount: 500 }],
        totalAmount: 500,
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Download Invoices</h1>

      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Select</th>
              <th className="border p-2">Invoice #</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoiceNumber} className="border">
                <td className="border p-2 text-center">
                  <input
                    type="radio"
                    name="selectedInvoice"
                    onChange={() => setSelectedInvoice(invoice)}
                  />
                </td>
                <td className="border p-2">{invoice.invoiceNumber}</td>
                <td className="border p-2">{invoice.date}</td>
                <td className="border p-2">${invoice.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Download Selected Invoice Button */}
      {selectedInvoice && (
        <div className="mt-4">
          <DownloadInvoiceButton invoice={selectedInvoice} />
        </div>
      )}
    </div>
  );
};

export default ViewInvoices;