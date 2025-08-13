// src/components/LifeSpheresNavigation.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  Heart,
  Users2,
  GraduationCap,
  Paintbrush,
  Bed,
  Landmark,
  Sparkles
} from 'lucide-react';

const LifeSpheresNavigation: React.FC = () => {
  const spheres = [
    { name: 'Работа', path: '/work', icon: Briefcase },
    { name: 'Здоровье', path: '/health', icon: Heart },
    { name: 'Семья/Друзья', path: '/family-friends', icon: Users2 },
    { name: 'Развитие', path: '/development', icon: GraduationCap },
    { name: 'Хобби', path: '/hobbies', icon: Paintbrush },
    { name: 'Отдых', path: '/rest', icon: Bed },
    { name: 'Финансы', path: '/finance', icon: Landmark },
    { name: 'Духовность', path: '/spirituality', icon: Sparkles },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-primary/10">
      <h3 className="text-lg font-semibold text-foreground mb-4">Сферы жизни</h3>
      <div className="space-y-2">
        {spheres.map(sphere => (
          <NavLink
            key={sphere.path}
            to={sphere.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <sphere.icon className="h-5 w-5 mr-3" />
            {sphere.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default LifeSpheresNavigation;