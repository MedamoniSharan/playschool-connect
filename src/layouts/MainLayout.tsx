import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-dash-canvas font-sans selection:bg-dash-lime selection:text-dash-ink">
      <Sidebar />
      <div className="flex min-h-screen flex-col print:ml-0 lg:pl-[284px]">
        <Navbar />
        <main className="flex-1 p-4 lg:p-8 pt-2 lg:pt-2 animate-fade-in relative z-10 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
