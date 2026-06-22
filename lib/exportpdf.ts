import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportItem {
  tanggal: string;
  jenis: string;
  namaKlien?: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

export const exportPDF = (
  data: ReportItem[],
  totalMasuk: number,
  totalKeluar: number,
  totalStok: number
) => {
  const doc = new jsPDF();

  doc.setFontSize(22);

  doc.text(
    "SIMBOLON INVENTORY",
    14,
    15
  );

  doc.setFontSize(10);

  doc.text(
    "Laporan Inventory Ayam",
    14,
    22
  );

  doc.text(
    `Tanggal Cetak : ${new Date().toLocaleDateString(
      "id-ID"
    )}`,
    14,
    30
  );

  doc.text(
    `Total Masuk : ${totalMasuk}`,
    14,
    38
  );

  doc.text(
    `Total Keluar : ${totalKeluar}`,
    14,
    45
  );

  doc.text(
    `Total Stok : ${totalStok}`,
    14,
    52
  );

  autoTable(doc, {
    startY: 65,

    head: [[
      "No",
      "Tanggal",
      "Jenis",
      "Klien",
      "Besar",
      "Sedang",
      "Kecil",
      "Total",
    ]],

    body: data.map(
      (item, index) => [
        index + 1,
        item.tanggal,
        item.jenis,
        item.namaKlien || "-",
        item.ayamBesar,
        item.ayamSedang,
        item.ayamKecil,
        item.total,
      ]
    ),

    styles: {
      fontSize: 8,
    },

    headStyles: {
      fillColor: [22, 163, 74],
    },
  });

  doc.save(
    `laporan-inventory-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
};