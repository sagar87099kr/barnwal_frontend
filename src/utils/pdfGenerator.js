import { jsPDF } from 'jspdf';
import autoTableDefault, { autoTable as autoTableNamed } from 'jspdf-autotable';

const autoTableFunc = autoTableDefault || autoTableNamed;

/**
 * Generates an elegant PDF invoice, with options to trigger printing or downloading.
 * 
 * @param {Object} billData The bill invoice details
 * @param {string} action The action to perform: 'print', 'download', or 'both'
 */
export const generatePDF = (billData, action = 'print') => {
  const createDoc = (withPrint = false) => {
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

    const options = {
      head: [tableColumn],
      body: tableRows,
      startY: 62,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      styles: { fontSize: 10 }
    };

    // Use extremely robust conditional autoTable calling
    if (typeof autoTableFunc === 'function') {
      try {
        autoTableFunc(doc, options);
      } catch (autoTableErr) {
        console.warn("Calling autoTable standalone failed, trying fallback prototype method...", autoTableErr);
        if (typeof doc.autoTable === 'function') {
          doc.autoTable(options);
        } else {
          throw autoTableErr;
        }
      }
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(options);
    } else {
      console.warn("jspdf-autotable is not loaded or registered correctly. Drawing fallback table...");
      let currentY = 62;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Items Summary:", 14, currentY);
      currentY += 8;
      doc.setFont("helvetica", "normal");
      billData.products.forEach((item, index) => {
        const desc = item.company ? `${item.name} (${item.company})` : item.name;
        doc.text(`${index + 1}. ${desc} x ${item.quantity} - Rs. ${item.subtotal.toFixed(2)}`, 14, currentY);
        currentY += 6;
      });
      doc.lastAutoTable = { finalY: currentY };
    }

    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 62;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${billData.totalAmount.toFixed(2)}`, 130, finalY + 15);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, finalY + 40, null, null, "center");
    
    if (withPrint) {
      doc.autoPrint();
    }
    
    return doc;
  };

  if (action === 'print' || action === 'both') {
    try {
      const printDoc = createDoc(true);
      // Auto-Print: configures print action
      const blobUrl = printDoc.output('bloburl');
      if (blobUrl) {
        window.open(blobUrl, '_blank');
      } else {
        throw new Error("Unable to generate PDF blob URL for printing.");
      }
    } catch (err) {
      console.error("Error launching print dialog:", err);
      alert("Failed to open print preview!\n\nError Details: " + err.message + "\n\nPlease ensure popups are allowed for this site.");
    }
  }
  
  if (action === 'download' || action === 'both') {
    try {
      const downloadDoc = createDoc(false);
      
      // Strategy 1: Attempt native HTML Blob URL download (extremely robust, bypasses internal jsPDF save issues in many viewports)
      try {
        const blob = downloadDoc.output('blob');
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${billData.billNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after short delay to let browser process download trigger
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (blobErr) {
        console.warn("Native HTML Blob URL download failed, trying standard doc.save fallback...", blobErr);
        
        // Strategy 2: Attempt standard jsPDF save (most compatible fallback)
        downloadDoc.save(`${billData.billNumber}.pdf`);
      }
    } catch (err) {
      console.error("All PDF download methods failed:", err);
      alert("PDF Download Failed!\n\nError Details:\n" + err.message + "\n\nIf this persists, please open your browser Developer Console (Press F12 / Cmd+Option+I) to see the full stack trace.");
    }
  }
};

