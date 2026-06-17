import * as XLSX from "xlsx";

interface ReportItem {
  tanggal: string;
  jenis: string;
  namaKlien?: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

export const exportExcel = (
  data: ReportItem[],
  totalMasuk: number,
  totalKeluar: number,
  totalStok: number
) => {
  const excelData = data.map((item) => ({
    Tanggal: item.tanggal,
    Jenis: item.jenis,
    Klien: item.namaKlien || "-",
    "Ayam Besar": item.ayamBesar,
    "Ayam Sedang": item.ayamSedang,
    "Ayam Kecil": item.ayamKecil,
    Total: item.total,
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(excelData);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      ["LAPORAN INVENTORY AYAM"],
      [],
      ["Total Masuk", totalMasuk],
      ["Total Keluar", totalKeluar],
      ["Total Stok", totalStok],
      [],
    ],
    {
      origin: "A1",
    }
  );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Laporan"
  );

  XLSX.writeFile(
    workbook,
    `laporan-inventory-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
};