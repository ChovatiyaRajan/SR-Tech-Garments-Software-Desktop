import { Invoice } from '../types/erp';

function numberToWordsINR(amount: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (!amount || amount === 0) return 'Zero Rupees Only';
  const num = Math.floor(amount);
  
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? inWords(n % 10000000) : '');
  }
  
  return 'Rupees ' + inWords(num).trim() + ' Only';
}

export const printInvoiceHtml = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank');
  const isFullyPaid = invoice.dueAmount <= 0 || invoice.paymentStatus === 'PAID';

  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tax Invoice #${invoice.invoiceNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 20px;
            font-size: 13px;
            line-height: 1.5;
          }
          .no-print-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .btn-primary {
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          }
          .btn-secondary {
            background: #e2e8f0;
            color: #1e293b;
            font-weight: 600;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          }
          .invoice-card {
            max-width: 820px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            padding: 28px;
            border-radius: 12px;
            background: #ffffff;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
            text-transform: uppercase;
          }
          .sub-text {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            font-size: 11px;
            font-weight: 800;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-paid { background: #dcfce7; color: #14532d; border: 1px solid #bbf7d0; }
          .status-partial { background: #fef9c3; color: #713f12; border: 1px solid #fef08a; }
          .status-unpaid { background: #ffe4e6; color: #881337; border: 1px solid #fecdd3; }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .info-label {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 2px;
          }
          .info-val {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
          }
          .info-val-sm {
            font-size: 12px;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          .text-right { text-align: right; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; }
          .totals-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
          }
          .words-box {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            font-size: 12px;
          }
          .totals-table {
            width: 320px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 12px;
          }
          .totals-row.final {
            border-top: 2px solid #cbd5e1;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }
          .totals-row.due {
            border-top: 1px solid #fecdd3;
            background: #fff1f2;
            padding: 8px 10px;
            border-radius: 6px;
            margin-top: 8px;
            color: #be123c;
            font-weight: 800;
          }
          .totals-row.paid-in-full {
            border-top: 1px solid #bbf7d0;
            background: #f0fdf4;
            padding: 8px 10px;
            border-radius: 6px;
            margin-top: 8px;
            color: #15803d;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer-sign {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
          }
          .sign-box {
            text-align: center;
            border-top: 1px solid #0f172a;
            width: 200px;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
          }

          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0 !important; background: white !important; }
            .invoice-card { border: none !important; padding: 0 !important; max-width: 100% !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong>TAX INVOICE #${invoice.invoiceNumber}</strong>
            <p style="font-size: 11px; color: #64748b;">Ready to print or download PDF</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="btn-secondary" onclick="window.close()">Close</button>
          </div>
        </div>

        <div class="invoice-card">
          <div class="invoice-header">
            <div>
              <div class="company-name">SR TECH GARMENT SOFTWARE</div>
              <div class="sub-text">Garment Manufacturing & Wholesale Division</div>
              <div class="sub-text" style="margin-top: 3px;">GSTIN: 24AABCT1337M1Z2 • Surat, Gujarat - 395002</div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px;">TAX INVOICE</h2>
              <div style="margin-top: 6px;">
                <span class="status-badge ${
                  isFullyPaid
                    ? 'status-paid'
                    : invoice.paidAmount > 0
                    ? 'status-partial'
                    : 'status-unpaid'
                }">
                  ${isFullyPaid ? 'FULLY PAID ✓' : invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <span class="info-label">Billed To (Wholesaler / Client)</span>
              <div class="info-val">${invoice.wholesalerName}</div>
              <div class="info-val-sm" style="margin-top: 4px;">Place of Supply: Gujarat (24)</div>
            </div>
            <div>
              <span class="info-label">Invoice & Lot Details</span>
              <div class="info-val">Invoice #: ${invoice.invoiceNumber}</div>
              <div class="info-val-sm">Lot Reference #: <strong>${invoice.lotNumber}</strong></div>
              <div class="info-val-sm">Invoice Date: ${invoice.invoiceDate}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th class="text-right">HSN/SAC</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Garment Finished Goods</strong>
                  <div style="font-size: 11px; color: #64748b;">Manufactured Lot Ref: ${invoice.lotNumber}</div>
                </td>
                <td class="text-right font-mono">6204</td>
                <td class="text-right font-mono">${invoice.totalItemsQuantity.toLocaleString()} pcs</td>
                <td class="text-right font-mono">₹${invoice.ratePerItem.toLocaleString()}</td>
                <td class="text-right font-mono" style="font-weight: 700;">₹${invoice.subtotalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-wrapper">
            <div class="words-box">
              <span class="info-label" style="display: block; margin-bottom: 4px;">Amount In Words</span>
              <div style="font-weight: 700; color: #0f172a; font-size: 13px;">
                ${numberToWordsINR(invoice.finalNetPayableAmount)}
              </div>

              <div style="margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                <span class="info-label" style="display: block; margin-bottom: 2px;">Bank Payment Details</span>
                <div class="info-val-sm">A/C Name: <strong>SR Tech Garment Software</strong></div>
                <div class="info-val-sm">Bank: State Bank of India • A/C No: 382910482910</div>
                <div class="info-val-sm">IFSC: SBIN0001234 • UPI ID: srtechgarment@sbi</div>
              </div>
            </div>

            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal Amount:</span>
                <span class="font-mono">₹${invoice.subtotalAmount.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>GST / Tax (5%):</span>
                <span class="font-mono">₹${invoice.taxAmount.toLocaleString()}</span>
              </div>
              ${
                invoice.discountAmount > 0
                  ? `<div class="totals-row" style="color: #be123c;">
                      <span>Discount:</span>
                      <span class="font-mono">-₹${invoice.discountAmount.toLocaleString()}</span>
                    </div>`
                  : ''
              }
              <div class="totals-row final">
                <span>Grand Total:</span>
                <span class="font-mono">₹${invoice.finalNetPayableAmount.toLocaleString()}</span>
              </div>
              <div class="totals-row" style="color: #15803d; font-weight: 700; margin-top: 6px;">
                <span>Total Amount Paid:</span>
                <span class="font-mono">₹${invoice.paidAmount.toLocaleString()}</span>
              </div>

              ${
                !isFullyPaid && invoice.dueAmount > 0
                  ? `<div class="totals-row due">
                      <span>Outstanding Balance Due:</span>
                      <span class="font-mono">₹${invoice.dueAmount.toLocaleString()}</span>
                    </div>`
                  : `<div class="totals-row paid-in-full">
                      <span>Payment Status:</span>
                      <span class="font-mono">PAID IN FULL ✓</span>
                    </div>`
              }
            </div>
          </div>

          ${
            invoice.notes
              ? `<div style="background: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                  <strong>Remarks / Terms:</strong> ${invoice.notes}
                </div>`
              : ''
          }

          <div class="footer-sign">
            <div>
              <div class="sub-text" style="font-weight: 700; color: #334155;">Terms & Conditions:</div>
              <div class="sub-text">1. Goods once dispatched cannot be returned or replaced.</div>
              <div class="sub-text">2. Subject to Surat jurisdiction.</div>
            </div>
            <div class="sign-box">
              <div>Authorized Signatory</div>
              <div style="font-size: 10px; color: #94a3b8; font-weight: 400; margin-top: 2px;">(Computer Generated Tax Invoice)</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  } else {
    // If popups are blocked on mobile, construct an invisible print iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(content);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1200);
      }, 400);
    } else {
      window.print();
    }
  }
};

export const printLotSummaryHtml = (lifecycle: any) => {
  const printWindow = window.open('', '_blank');
  const { purchase, rawMaterial, cuttings, cutPieces, tailorAssignments, stitchings, finishedProducts = [], employeeAssignments, invoice } = lifecycle;

  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lot Summary #${lifecycle.lotNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 20px;
            font-size: 13px;
            line-height: 1.5;
          }
          .no-print-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .btn-primary {
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          }
          .btn-secondary {
            background: #e2e8f0;
            color: #1e293b;
            font-weight: 600;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          }
          .lot-card {
            max-width: 850px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            padding: 28px;
            border-radius: 12px;
            background: #ffffff;
          }
          .lot-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 800;
            border-radius: 9999px;
            text-transform: uppercase;
            background: #e0e7ff; color: #3730a3;
          }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; background: #f8fafc; p: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .val { font-size: 13px; font-weight: 700; color: #0f172a; }
          .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; margin-top: 16px; margin-bottom: 8px; border-left: 3px solid #0f172a; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; color: #334155; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 600; }
          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0 !important; }
            .lot-card { border: none !important; padding: 0 !important; max-width: 100% !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong>Lot Lifecycle Summary Report #${lifecycle.lotNumber}</strong>
            <p style="font-size: 11px; color: #64748b;">Status: ${lifecycle.status}</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary" onclick="window.print()">🖨️ Print Report</button>
            <button class="btn-secondary" onclick="window.close()">Close</button>
          </div>
        </div>

        <div class="lot-card">
          <div class="lot-header">
            <div>
              <div class="title">Lot Summary #${lifecycle.lotNumber}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">
                Wholesaler: ${purchase ? purchase.wholesalerName : 'N/A'} • Challan #${purchase ? purchase.challanNumber : 'N/A'}
              </div>
            </div>
            <div>
              <span class="badge">${lifecycle.status}</span>
            </div>
          </div>

          <div class="grid">
            <div><span class="label">Purchase Date</span><div class="val">${purchase ? purchase.purchaseDate : '—'}</div></div>
            <div><span class="label">Material Purchased</span><div class="val">${purchase ? purchase.materialName : '—'} (${purchase ? purchase.totalQuantity : 0} ${purchase ? purchase.unit : 'Mtr'})</div></div>
            <div><span class="label">Purchase Cost</span><div class="val">₹${purchase ? purchase.purchaseAmount.toLocaleString() : 0}</div></div>
            <div><span class="label">Fabric Meter Status</span><div class="val">${rawMaterial ? `${rawMaterial.meterUsedInCutting}m Used / ${rawMaterial.availableMeters}m Remaining` : 'N/A'}</div></div>
          </div>

          <div class="section-title">1. Cutting & Generated Pieces</div>
          <table>
            <thead>
              <tr><th>Target Garment Item</th><th class="text-right">Meters Used</th><th class="text-right">Pieces Generated</th></tr>
            </thead>
            <tbody>
              ${cutPieces && cutPieces.sizeBreakdown && cutPieces.sizeBreakdown.length > 0
                ? cutPieces.sizeBreakdown.map((sb: any) => `
                    <tr>
                      <td><strong>${sb.sizeName}</strong></td>
                      <td class="text-right font-mono">${sb.meterUsed} m</td>
                      <td class="text-right font-mono">${sb.piecesGenerated} pcs</td>
                    </tr>
                  `).join('')
                : `<tr><td colspan="3" style="color: #64748b;">Total Cut Pieces Generated: <strong>${cutPieces ? cutPieces.totalPiecesGenerated : 0} pcs</strong></td></tr>`
              }
            </tbody>
          </table>

          <div class="section-title">2. Tailor Stitching Progress</div>
          <table>
            <thead>
              <tr><th>Tailor Name</th><th class="text-right">Assigned</th><th class="text-right">Completed Good</th><th class="text-right">Defective</th></tr>
            </thead>
            <tbody>
              ${tailorAssignments.length > 0
                ? tailorAssignments.map((ta: any) => {
                    const st = stitchings.filter((s: any) => s.tailorAssignmentId === ta.id);
                    const good = st.reduce((sum: number, s: any) => sum + s.stitchedGoodPiecesQty, 0);
                    const def = st.reduce((sum: number, s: any) => sum + s.defectivePiecesQty, 0);
                    return `
                      <tr>
                        <td><strong>${ta.tailorName}</strong></td>
                        <td class="text-right font-mono">${ta.assignedPiecesQty} pcs</td>
                        <td class="text-right font-mono" style="color: #15803d;">${good} pcs</td>
                        <td class="text-right font-mono" style="color: #be123c;">${def} pcs</td>
                      </tr>
                    `;
                  }).join('')
                : `<tr><td colspan="4" style="color: #64748b;">No tailor assignments recorded yet.</td></tr>`
              }
            </tbody>
          </table>

          <div class="section-title">3. Finished Goods & Invoice Settlement</div>
          <div class="grid">
            <div><span class="label">Finished Goods Stock</span><div class="val">${finishedProducts.map((fp: any) => `${fp.productName}: ${fp.totalStitchedQty} pcs`).join(', ') || 'N/A'}</div></div>
            <div><span class="label">Dispatched to Staff</span><div class="val">${employeeAssignments.map((ea: any) => `${ea.employeeName}: ${ea.assignedFinishedQty} pcs`).join(', ') || '0 pcs'}</div></div>
            <div><span class="label">Final Invoice</span><div class="val">${invoice ? `#${invoice.invoiceNumber} — ₹${invoice.finalNetPayableAmount.toLocaleString()} (${invoice.paymentStatus})` : 'Not Invoiced Yet'}</div></div>
            <div><span class="label">Wholesaler Balance</span><div class="val">${invoice ? `Due: ₹${invoice.dueAmount.toLocaleString()}` : '—'}</div></div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  } else {
    window.print();
  }
};
