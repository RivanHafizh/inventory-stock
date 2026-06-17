export const printReport = (
  elementId: string
) => {
  const content =
    document.getElementById(
      elementId
    );

  if (!content) return;

  const printWindow =
    window.open(
      "",
      "",
      "width=1000,height=800"
    );

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Inventory Ayam</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          table,
          th,
          td {
            border: 1px solid #ddd;
          }

          th,
          td {
            padding: 10px;
            text-align: left;
          }

          th {
            background: #16a34a;
            color: white;
          }
        </style>

      </head>

      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};