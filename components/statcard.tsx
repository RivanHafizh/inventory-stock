import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  growth?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  growth,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-gray-800 mt-2">
            {value}
          </h2>

          {growth && (
            <p className="text-green-600 text-sm mt-2">
              ↑ {growth}
            </p>
          )}
        </div>

        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}