import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Manifesto from "./pages/Manifesto";
import MarksGallery from "./pages/MarksGallery";
import Operations from "./pages/Operations";
import Intel from "./pages/Intel";
import PostDetail from "./pages/PostDetail";
import Profile from "./components/Profile";
import Recruitment from "./pages/Recruitment";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.VITE_BASE_URL || ''}>
        <div className="min-h-screen bg-background text-foreground relative static-noise">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/marks" element={<MarksGallery />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/intel" element={<Intel />} />
            <Route path="/intel/post/:postId" element={<PostDetail />} />
            <Route path="/intel/user/:username" element={<Profile />} />
            <Route path="/intel/me/profile" element={<Profile isOwnProfile={true} />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;