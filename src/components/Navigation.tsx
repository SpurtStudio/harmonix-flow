import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Folder,
  ListTodo,
  ListChecks,
  Lightbulb,
  HeartHandshake,
  History as HistoryIcon,
  Users,
  Clock,
  Briefcase,
  Heart,
  Users2,
  GraduationCap,
  Paintbrush,
  Bed,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Импортируем компоненты Sheet
import { useState } from 'react';
import LifeSpheresNavigation from './LifeSpheresNavigation';
import { useUserPreferences } from '@/context/UserPreferencesContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  isAdvanced?: boolean;
  id: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    id: 'nav-dashboard',
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    id: 'nav-calendar',
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
    id: 'nav-goals',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Folder,
    isAdvanced: true,
    id: 'nav-projects',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ListTodo,
    id: 'nav-tasks',
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: ListChecks,
    isAdvanced: true,
    id: 'nav-habits',
  },
  {
    name: 'Ideas',
    href: '/ideas',
    icon: Lightbulb,
    isAdvanced: true,
    id: 'nav-ideas',
  },
  {
    name: 'Motivation',
    href: '/motivation',
    icon: HeartHandshake,
    isAdvanced: true,
    id: 'nav-motivation',
  },
  {
    name: 'History',
    href: '/history',
    icon: HistoryIcon,
    isAdvanced: true,
    id: 'nav-history',
  },
  {
    name: 'Family',
    href: '/family',
    icon: Users,
    isAdvanced: true,
    id: 'nav-family',
  },
  {
    name: 'Time Indicator',
    href: '/time-indicator',
    icon: Clock,
    isAdvanced: true,
    id: 'nav-time-indicator',
  },
  {
    name: 'Documentation',
    href: '/documentation',
    icon: BookOpen,
    id: 'nav-documentation',
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
    id: 'nav-journal',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    isAdvanced: true,
    id: 'nav-analytics',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    id: 'nav-settings',
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isBeginnerMode } = useUserPreferences();

  const filteredNavigationItems = isBeginnerMode
    ? navigationItems.filter(item => !item.isAdvanced)
    : navigationItems;

  return (
    <>
      {/* Mobile menu button and Sheet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="backdrop-blur-xl bg-surface/80 border-primary/20"
              id="mobile-menu-button"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-surface/95 backdrop-blur-xl border-r border-primary/20 p-0">
            <nav className="h-full" id="main-sidebar">
              <div className="p-6">
                <h1 className="text-xl font-bold text-foreground mb-8">Harmony</h1>

                <div className="space-y-2">
                  {filteredNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                      id={item.id}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>

                <LifeSpheresNavigation />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <nav
        className={`
          hidden lg:block fixed top-0 left-0 h-full w-64 bg-surface/95 backdrop-blur-xl border-r border-primary/20 z-40
        `}
        id="main-sidebar-desktop"
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground mb-8">Harmony</h1>

          <div className="space-y-2">
            {filteredNavigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
                id={item.id}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <LifeSpheresNavigation />
        </div>
      </nav>
    </>
  );
}