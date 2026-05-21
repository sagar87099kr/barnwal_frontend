import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an elegant PDF invoice, with options to trigger printing or downloading.
 * 
 * @param {Object} billData The bill invoice details
 * @param {string} action The action to perform: 'print', 'download', or 'both'
 */
export const generatePDF = (billData, action = 'print') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.text("BARWNAL TRADERS", 105, 20, null, null, "center");
  
  doc.setFontSize(12);
  doc.text("Hardware & Building Materials", 105, 28, null, null, "center");
  doc.text("Phone: +91 1234567890", 105, 34, null, null, "center");
  
  // Bill Details
  doc.line(14, 40, 196, 40);
  doc.setFontSize(11);
  doc.text(`Bill No: ${billData.billNumber}`, 14, 47);
  doc.text(`Date: ${new Date(billData.date || billData.createdAt).toLocaleString()}`, 120, 47);
  doc.text(`Customer: ${billData.customerName || "Walk-in Customer"}`, 14, 53);
  doc.line(14, 57, 196, 57);
  
  // Table
  const tableColumn = ["S.No", "Item Description", "Qty", "Price (Rs)", "Amount (Rs)"];
  const tableRows = [];

  billData.products.forEach((item, index) => {
    const rowData = [
      index + 1,
      item.company ? `${item.name} (${item.company})` : item.name,
      item.quantity,
      item.price.toFixed(2),
      item.subtotal.toFixed(2)
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 62,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    styles: { fontSize: 10 }
  });

  const finalY = doc.lastAutoTable.finalY || 62;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${billData.totalAmount.toFixed(2)}`, 130, finalY + 15);
  
  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", 105, finalY + 40, null, null, "center");
  
  if (action === 'print' || action === 'both') {
    try {
      // Auto-Print: configures print action
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      if (blobUrl) {
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      console.error("Error launching print dialog:", err);
    }
  }
  
  if (action === 'download' || action === 'both') {
    // Save/download a copy
    doc.save(`${billData.billNumber}.pdf`);
  }
};
