import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LifeDashboard } from "@/components/LifeDashboard";
import { UserPreferencesProvider, useUserPreferences } from "@/context/UserPreferencesContext"; // Импортируем контекст
import { TutorialProvider } from "./context/TutorialContext"; // Импортируем TutorialProvider
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import Ideas from "./pages/Ideas";
import Motivation from "./pages/Motivation";
import History from "./pages/History";
import TimeIndicator from './pages/TimeIndicator';
import Documentation from './pages/Documentation';
import Auth from './pages/Auth'; // Импортируем новую страницу
import Notifications from './pages/Notifications'; // Импортируем новую страницу
// Импортируем новые страницы сфер жизни
import Work from './pages/Work';
import Health from './pages/Health';
import FamilyFriends from './pages/FamilyFriends';
import Development from './pages/Development';
import Hobbies from './pages/Hobbies';
import Rest from './pages/Rest';
import Finance from './pages/Finance';
import Spirituality from './pages/Spirituality';

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLowMood } = useUserPreferences();
  return (
    <div className={`min-h-screen bg-background ${isLowMood ? 'low-mood-theme' : ''}`}>
      <Navigation />
      <main className="lg:pl-64 pl-0">
        <Routes>
          <Route path="/" element={<LifeDashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/motivation" element={<Motivation />} />
          <Route path="/history" element={<History />} />
          <Route path="/family" element={<FamilyFriends />} />
          <Route path="/time-indicator" element={<TimeIndicator />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/auth" element={<Auth />} /> {/* Новый маршрут */}
          <Route path="/notifications" element={<Notifications />} /> {/* Новый маршрут */}
          {/* Новые маршруты для сфер жизни */}
          <Route path="/work" element={<Work />} />
          <Route path="/health" element={<Health />} />
          <Route path="/family-friends" element={<FamilyFriends />} />
          <Route path="/development" element={<Development />} />
          <Route path="/hobbies" element={<Hobbies />} />
          <Route path="/rest" element={<Rest />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/spirituality" element={<Spirituality />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserPreferencesProvider> {/* Оборачиваем в провайдер */}
          <TutorialProvider> {/* Оборачиваем в TutorialProvider */}
            <AppContent /> {/* Используем новый компонент */}
          </TutorialProvider>
        </UserPreferencesProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
