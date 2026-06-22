interface UserStatsProps {
  totalAdmin: number;
}

export default function UserStats({
  totalAdmin,
}: UserStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-white rounded-3xl p-6 shadow-sm">

        <p className="text-gray-500">
          Total Admin
        </p>

        <h2 className="text-4xl font-bold text-black mt-2">
          {totalAdmin}
        </h2>

      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">

        <p className="text-gray-500">
          Owner
        </p>

        <h2 className="text-4xl font-bold text-black mt-2">
          1
        </h2>

      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">

        <p className="text-gray-500">
          Status Sistem
        </p>

        <h2 className="text-4xl font-bold text-green-600 mt-2">
          Aktif
        </h2>

      </div>

    </div>
  );
}