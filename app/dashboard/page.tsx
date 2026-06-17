import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">

      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Content Dashboard */}
        <div className="mt-8">
          Dashboard Content
        </div>
      </main>

    </div>
  );
}