import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-green-500",
}: StatCardProps) {
  return (
    <div
      className="
      bg-white
      rounded-3xl
      p-6
      shadow-sm
      hover:shadow-lg
      transition-all
    "
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-black mt-3">
            {value}
          </h2>

        </div>

        <div
          className={`
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
            ${color}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}