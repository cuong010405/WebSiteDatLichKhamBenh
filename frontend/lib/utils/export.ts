/**
 * Shared Report Exporter Utility (CSV / Print PDF)
 */

/**
 * Universal CSV / Excel exporter with UTF-8 BOM encoding for proper Vietnamese character rendering
 */
export function exportToCSV(
  data: Array<Record<string, any>>,
  filename: string = "bao-cao.csv",
  columnMap?: Record<string, string>
) {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để xuất báo cáo!");
  }

  // Determine headers
  const sample = data[0];
  const keys = Object.keys(sample);
  
  // Format header row
  const headerLabels = keys.map((k) => (columnMap && columnMap[k] ? columnMap[k] : k));
  const csvRows: string[] = [];

  // Add Header Row
  csvRows.push(headerLabels.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","));

  // Add Data Rows
  for (const row of data) {
    const values = keys.map((k) => {
      const val = row[k];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  // UTF-8 BOM prefix (\uFEFF) ensures Excel opens Vietnamese accents correctly
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Universal Styled Excel Exporter (.xls) with custom colors, borders, font styling, cell alignment, and total sum row
 */
export function exportToExcel(
  data: Array<Record<string, any>>,
  filename: string = "bao-cao.xls",
  title: string = "BÁO CÁO VẬN HÀNH LÂM SÀNG"
) {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để xuất báo cáo!");
  }

  const sample = data[0];
  const keys = Object.keys(sample);

  // Header row HTML with styled background & white bold text
  const headerHtml = keys
    .map(
      (k) =>
        `<th style="background-color: #0f172a; color: #ffffff; padding: 12px 16px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; border: 1px solid #334155; text-align: center; text-transform: uppercase; whitespace: nowrap;">${k}</th>`
    )
    .join("");

  // Data rows HTML with alternating row backgrounds and cell formatting
  const rowsHtml = data
    .map((row, idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `<tr style="background-color: ${bgColor};">
        ${keys
          .map((k) => {
            const val = row[k] ?? "—";
            let textAlign = "left";
            let textColor = "#334155";
            let fontWeight = "normal";

            const kLower = k.toLowerCase();
            if (kLower.includes("mã") || kLower.includes("giờ") || kLower.includes("ngày")) {
              textAlign = "center";
              fontWeight = "bold";
            } else if (kLower.includes("tiền") || kLower.includes("giá")) {
              textAlign = "right";
              fontWeight = "bold";
              textColor = "#16a34a";
            } else if (kLower.includes("trạng thái")) {
              textAlign = "center";
              fontWeight = "bold";
              if (String(val).includes("hoàn tất") || String(val).includes("thanh toán")) {
                textColor = "#15803d";
              } else if (String(val).includes("hủy")) {
                textColor = "#dc2626";
              } else {
                textColor = "#d97706";
              }
            }

            return `<td style="padding: 10px 14px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: ${textColor}; font-weight: ${fontWeight}; border: 1px solid #cbd5e1; text-align: ${textAlign};">${val}</td>`;
          })
          .join("")}
      </tr>`;
    })
    .join("");

  // Calculate total amount if there is a currency/amount column
  const amountKey = keys.find(
    (k) => k.toLowerCase().includes("tiền") || k.toLowerCase().includes("giá") || k.toLowerCase().includes("amount")
  );

  let totalAmount = 0;
  if (amountKey) {
    totalAmount = data.reduce((sum, row) => {
      const val = row[amountKey];
      if (!val || val === "—") return sum;
      const num = parseInt(String(val).replace(/[^\d]/g, ""), 10) || 0;
      return sum + num;
    }, 0);
  }

  const amountIdx = amountKey ? keys.indexOf(amountKey) : -1;
  const footerHtml = amountKey && amountIdx >= 0
    ? `<tr style="background-color: #f1f5f9; font-weight: bold;">
        ${keys
          .map((k, idx) => {
            if (idx === 0) {
              return `<td colspan="${amountIdx}" style="padding: 12px 14px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; border: 2px solid #64748b; text-align: left; text-transform: uppercase;">TỔNG CỘNG DOANH THU (${data.length} BẢN GHI):</td>`;
            }
            if (idx < amountIdx) return "";
            if (k === amountKey) {
              return `<td style="padding: 12px 14px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; color: #16a34a; background-color: #ecfdf5; border: 2px solid #64748b; text-align: right; font-weight: bold;">${totalAmount.toLocaleString("vi-VN")}đ</td>`;
            }
            return `<td style="padding: 12px 14px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #64748b; border: 2px solid #64748b; text-align: center;">—</td>`;
          })
          .filter(Boolean)
          .join("")}
      </tr>`
    : "";

  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Báo Cáo MintCare</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; }
          .title { font-size: 16pt; font-weight: bold; color: #0f172a; text-align: center; margin-bottom: 4px; }
          .subtitle { font-size: 10pt; color: #64748b; text-align: center; margin-top: 0; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="title">${title}</div>
        <div class="subtitle">Hệ thống Quản lý Y tế MintCare • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}</div>
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            ${footerHtml}
          </tfoot>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + excelContent], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Universal Word exporter (.doc) with styled HTML table formatting & total summary
 */
export function exportToWord(
  data: Array<Record<string, any>>,
  filename: string = "bao-cao.doc",
  title: string = "BÁO CÁO VẬN HÀNH LÂM SÀNG"
) {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để xuất báo cáo!");
  }

  const sample = data[0];
  const keys = Object.keys(sample);

  const headerHtml = keys
    .map(
      (k) =>
        `<th style="background-color: #1e40af; color: #ffffff; padding: 10px; font-size: 11px; font-weight: bold; border: 1px solid #1e3a8a; text-transform: uppercase;">${k}</th>`
    )
    .join("");

  const rowsHtml = data
    .map(
      (row, idx) =>
        `<tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
          ${keys
            .map(
              (k) =>
                `<td style="padding: 8px 10px; font-size: 11px; color: #334155; border: 1px solid #cbd5e1;">${row[k] ?? "—"}</td>`
            )
            .join("")}
        </tr>`
    )
    .join("");

  // Calculate total amount for Word
  const amountKey = keys.find(
    (k) => k.toLowerCase().includes("tiền") || k.toLowerCase().includes("giá") || k.toLowerCase().includes("amount")
  );

  let totalAmount = 0;
  if (amountKey) {
    totalAmount = data.reduce((sum, row) => {
      const val = row[amountKey];
      if (!val || val === "—") return sum;
      const num = parseInt(String(val).replace(/[^\d]/g, ""), 10) || 0;
      return sum + num;
    }, 0);
  }

  const amountIdx = amountKey ? keys.indexOf(amountKey) : -1;
  const footerHtml = amountKey && amountIdx >= 0
    ? `<tr style="background-color: #f1f5f9; font-weight: bold;">
        ${keys
          .map((k, idx) => {
            if (idx === 0) {
              return `<td colspan="${amountIdx}" style="padding: 10px; font-size: 11px; color: #0f172a; border: 2px solid #1e40af; text-align: left; text-transform: uppercase;">TỔNG CỘNG DOANH THU (${data.length} BẢN GHI):</td>`;
            }
            if (idx < amountIdx) return "";
            if (k === amountKey) {
              return `<td style="padding: 10px; font-size: 12px; color: #16a34a; background-color: #ecfdf5; border: 2px solid #1e40af; text-align: right; font-weight: bold;">${totalAmount.toLocaleString("vi-VN")}đ</td>`;
            }
            return `<td style="padding: 10px; font-size: 10px; color: #64748b; border: 2px solid #1e40af; text-align: center;">—</td>`;
          })
          .filter(Boolean)
          .join("")}
      </tr>`
    : "";

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; }
          .header-box { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #1e40af; }
          .title { font-size: 18pt; font-weight: bold; color: #1e3a8a; margin-bottom: 5pt; text-transform: uppercase; }
          .subtitle { font-size: 10pt; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 9pt; color: #94a3b8; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="title">${title}</div>
          <div class="subtitle">Hệ thống Quản lý Y tế MintCare • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}</div>
        </div>
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            ${footerHtml}
          </tfoot>
        </table>
        <div class="footer">
          <p>Tài liệu được xuất tự động từ hệ thống MintCare Management</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + wordContent], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Universal Print / PDF Report Generator
 */
export function printReportPDF(title: string, headers: string[], rows: any[][]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const headerHtml = headers.map((h) => `<th style="border:1px solid #ddd; padding:8px; background:#f8fafc; text-align:left; font-size:12px;">${h}</th>`).join("");
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>${r.map((cell) => `<td style="border:1px solid #ddd; padding:8px; font-size:12px;">${cell ?? "—"}</td>`).join("")}</tr>`
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 25px; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 40px; text-align: right; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">Xuất từ Hệ Thống MintCare — Ngày ${new Date().toLocaleDateString("vi-VN")}</div>
        </div>
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <p>Báo cáo tự động tổng hợp từ hệ thống MintCare</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
