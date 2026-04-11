import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Gallery from "@/pages/Gallery";
import Attendance from "@/pages/Attendance";
import Fees from "@/pages/Fees";
import Notifications from "@/pages/Notifications";
import Broadcast from "@/pages/Broadcast";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/broadcast" element={<Broadcast />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
