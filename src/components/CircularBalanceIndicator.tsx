import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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

interface LifeSphere {
  id: string;
  name: string;
  route: string;
  value: number;
  color: string;
  angle: number;
  icon: React.ElementType;
}

const lifeSpheres: LifeSphere[] = [
  { id: 'work', name: 'Работа', route: '/work', value: 75, color: 'harmony-work', angle: 0, icon: Briefcase },
  { id: 'health', name: 'Здоровье', route: '/health', value: 80, color: 'harmony-health', angle: 45, icon: Heart },
  { id: 'relationships', name: 'Отношения', route: '/family-friends', value: 65, color: 'harmony-relationships', angle: 90, icon: Users2 },
  { id: 'development', name: 'Развитие', route: '/development', value: 70, color: 'harmony-growth', angle: 135, icon: GraduationCap },
  { id: 'hobbies', name: 'Хобби', route: '/hobbies', value: 60, color: 'harmony-hobbies', angle: 180, icon: Paintbrush },
  { id: 'rest', name: 'Отдых', route: '/rest', value: 55, color: 'harmony-rest', angle: 225, icon: Bed },
  { id: 'finance', name: 'Финансы', route: '/finance', value: 85, color: 'harmony-finance', angle: 270, icon: Landmark },
  { id: 'spirituality', name: 'Духовность', route: '/spirituality', value: 70, color: 'harmony-spirit', angle: 315, icon: Sparkles }
];

const CircularBalanceIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSphere, setHoveredSphere] = useState<string | null>(null);
  
  const totalBalance = Math.round(lifeSpheres.reduce((sum, sphere) => sum + sphere.value, 0) / lifeSpheres.length);
  const centerSize = 140; // Размер центрального индикатора
  const sphereSize = Math.round(centerSize / 1.5); // Размер сфер в 1.5 раза меньше
  const sphereRadius = 200; // Расстояние от центра до сфер

  const getSpherePosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const x = 250 + sphereRadius * Math.cos(radian);
    const y = 250 + sphereRadius * Math.sin(radian);
    return { x: x - sphereSize / 2, y: y - sphereSize / 2 };
  };

  return (
    <div className="relative w-full flex justify-center items-center min-h-[500px]">
      <svg width="500" height="500" className="absolute">
        {/* Центральный круг баланса жизни */}
        <circle
          cx="250"
          cy="250"
          r={centerSize / 2}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        <text
          x="250"
          y="240"
          textAnchor="middle"
          className="text-3xl font-space font-bold fill-foreground"
        >
          {totalBalance}
        </text>
        
        <text
          x="250"
          y="265"
          textAnchor="middle"
          className="text-sm fill-muted-foreground"
        >
          Баланс жизни
        </text>
      </svg>

      {/* Индикаторы сфер жизни вокруг центрального круга */}
      {lifeSpheres.map((sphere) => {
        const position = getSpherePosition(sphere.angle);
        const IconComponent = sphere.icon;
        
        return (
          <Button
            key={sphere.id}
            variant="ghost"
            className={`absolute rounded-full glass hover:glass-hover transition-all duration-300 transform hover:scale-110 cursor-pointer flex flex-col items-center justify-center`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${sphereSize}px`,
              height: `${sphereSize}px`,
              backgroundColor: `hsl(var(--${sphere.color}) / 0.1)`,
              border: `2px solid hsl(var(--${sphere.color}))`,
            }}
            onClick={() => navigate(sphere.route)}
            onMouseEnter={() => setHoveredSphere(sphere.id)}
            onMouseLeave={() => setHoveredSphere(null)}
            title={`${sphere.name}: ${sphere.value}/100`}
          >
            <IconComponent 
              className={`w-6 h-6 mb-1`}
              style={{ color: `hsl(var(--${sphere.color}))` }}
            />
            <span 
              className="text-xs font-bold"
              style={{ color: `hsl(var(--${sphere.color}))` }}
            >
              {sphere.value}
            </span>
          </Button>
        );
      })}

      {/* Подписи для наведенной сферы */}
      {hoveredSphere && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass p-3 rounded-lg z-10">
          <p className="text-sm font-medium text-foreground">
            {lifeSpheres.find(s => s.id === hoveredSphere)?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {lifeSpheres.find(s => s.id === hoveredSphere)?.value}/100
          </p>
        </div>
      )}
    </div>
  );
};

export default CircularBalanceIndicator;