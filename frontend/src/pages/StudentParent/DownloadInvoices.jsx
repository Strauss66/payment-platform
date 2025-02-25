import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../../components/common/Button";

export default function DownloadInvoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await axios.get("/api/portal/invoices");
        setInvoices(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInvoices();
  }, []);

  const handleDownload = (invoiceId) => {
    // Example: triggers file download
    axios
      .get(`/api/portal/invoices/${invoiceId}/download`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Download Invoices</h2>
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex justify-between items-center p-4 bg-white shadow mb-2"
        >
          <div>
            Invoice #{invoice.id} - ${invoice.amount}
          </div>
          <Button text="Download" onClick={() => handleDownload(invoice.id)} />
        </div>
      ))}
    </div>
  );
}