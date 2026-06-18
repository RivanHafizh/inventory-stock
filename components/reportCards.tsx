import {
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
} from "lucide-react";

const cards = [
  {
    title: "Master Data Ayam",
    value: "25",
    desc: "+2 Data Minggu Ini",
    icon: Database,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "Ayam Masuk",
    value: "1.250",
    desc: "+10% dari bulan lalu",
    icon: ArrowDownCircle,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Ayam Keluar",
    value: "980",
    desc: "-5% dari bulan lalu",
    icon: ArrowUpCircle,
    bg: "bg-red-100",
    color: "text-red-500",
  },
  {
    title: "Total Stok",
    value: "270",
    desc: "Stok Saat Ini",
    icon: Package,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
];

export default function ReportCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
          >

            <div className="flex justify-between items-start">

              <div>

                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="text-4xl font-bold text-gray-800 mt-3">
                  {card.value}
                </h2>

                <p className="text-sm text-gray-400 mt-3">
                  {card.desc}
                </p>

              </div>

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${card.bg}`}
              >
                <Icon
                  size={30}
                  className={card.color}
                />
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}