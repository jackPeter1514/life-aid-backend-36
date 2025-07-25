
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import DiagnosticCenters from "./pages/DiagnosticCenters";
import DiagnosticTests from "./pages/DiagnosticTests";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomerRequests from "./pages/AdminCustomerRequests";
import AdminTestHistory from "./pages/AdminTestHistory";
import AdminPendingResults from "./pages/AdminPendingResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments/book" element={<BookAppointment />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/centers" element={<DiagnosticCenters />} />
          <Route path="/tests" element={<DiagnosticTests />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/customer-requests" element={<AdminCustomerRequests />} />
          <Route path="/admin/test-history" element={<AdminTestHistory />} />
          <Route path="/admin/pending-results" element={<AdminPendingResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
