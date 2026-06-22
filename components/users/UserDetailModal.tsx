import { X } from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: string;
}

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
}

export default function UserDetailModal({
  open,
  onClose,
  user,
}: UserDetailModalProps) {
  if (!open || !user)
    return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-[32px] p-8 w-full max-w-lg">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-black">
            Detail Admin
          </h2>

          <button
            onClick={onClose}
          >
            <X />
          </button>

        </div>

        <div className="space-y-4">

          <div>
            <p className="text-gray-500">
              Nama
            </p>

            <h3 className="text-black font-semibold">
              {user.nama}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Email
            </p>

            <h3 className="text-black font-semibold">
              {user.email}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Password
            </p>

            <h3 className="text-black font-semibold">
              {user.password}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Role
            </p>

            <h3 className="text-black font-semibold">
              Admin
            </h3>
          </div>

        </div>

      </div>

    </div>
  );
}