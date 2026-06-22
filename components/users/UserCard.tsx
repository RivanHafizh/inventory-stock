import {
  User,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: string;
}

interface UserCardProps {
  user: UserData;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserCard({
  user,
  onDetail,
  onEdit,
  onDelete,
}: UserCardProps) {
  return (
    <div
      className="
      bg-white
      rounded-3xl
      p-6
      shadow-sm
      hover:shadow-lg
      transition
    "
    >
      <div className="flex items-center gap-4 mb-5">

        <div
          className="
          w-14
          h-14
          rounded-2xl
          bg-green-100
          flex
          items-center
          justify-center
        "
        >
          <User
            size={28}
            className="text-green-700"
          />
        </div>

        <div>

          <h3 className="font-bold text-black text-lg">
            {user.nama}
          </h3>

          <p className="text-gray-500">
            {user.email}
          </p>

        </div>

      </div>

      <span
        className="
        inline-block
        px-3
        py-1
        rounded-full
        bg-green-100
        text-black
        text-sm
      "
      >
        Admin
      </span>

      <div className="grid grid-cols-3 gap-2 mt-6">

        <button
          onClick={onDetail}
          className="
          py-3
          rounded-xl
          bg-slate-100
          hover:bg-slate-200
          flex
          justify-center
        "
        >
          <Eye size={18} />
        </button>

        <button
          onClick={onEdit}
          className="
          py-3
          rounded-xl
          bg-yellow-100
          hover:bg-yellow-200
          flex
          justify-center
        "
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={onDelete}
          className="
          py-3
          rounded-xl
          bg-red-100
          hover:bg-red-200
          flex
          justify-center
        "
        >
          <Trash2 size={18} />
        </button>

      </div>
    </div>
  );
}