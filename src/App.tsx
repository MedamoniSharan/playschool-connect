import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import type { Role } from "@/types";
import MainLayout from "@/layouts/MainLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Gallery from "@/pages/Gallery";
import Attendance from "@/pages/Attendance";
import Fees from "@/pages/Fees";
import Notifications from "@/pages/Notifications";
import Broadcast from "@/pages/Broadcast";
import Students from "@/pages/Students";
import Curriculum from "@/pages/Curriculum";
import Progress from "@/pages/Progress";
import LessonPlans from "@/pages/LessonPlans";
import Reports from "@/pages/Reports";
import Communications from "@/pages/Communications";
import Branches from "@/pages/Branches";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!currentUser || !roles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route
          path="/branches"
          element={
            <RoleRoute roles={["admin"]}>
              <Branches />
            </RoleRoute>
          }
        />
        <Route
          path="/students"
          element={
            <RoleRoute roles={["admin", "teacher"]}>
              <Students />
            </RoleRoute>
          }
        />
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route
          path="/fees"
          element={
            <RoleRoute roles={["admin", "parent"]}>
              <Fees />
            </RoleRoute>
          }
        />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route
          path="/broadcast"
          element={
            <RoleRoute roles={["admin"]}>
              <Broadcast />
            </RoleRoute>
          }
        />
        <Route
          path="/curriculum"
          element={
            <RoleRoute roles={["admin", "teacher"]}>
              <Curriculum />
            </RoleRoute>
          }
        />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/lessons" element={<ProtectedRoute><LessonPlans /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route
          path="/communications"
          element={
            <RoleRoute roles={["admin", "teacher"]}>
              <Communications />
            </RoleRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
