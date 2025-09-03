import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLifeBalanceData } from '@/hooks/useLifeBalanceData';
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

// Маппинг сфер жизни с иконками и цветами
const sphereMapping = [
  { id: 'work', name: 'Работа', route: '/work', color: 'harmony-work', angle: 0, icon: Briefcase },
  { id: 'health', name: 'Здоровье', route: '/health', color: 'harmony-health', angle: 45, icon: Heart },
  { id: 'relationships', name: 'Отношения', route: '/family-friends', color: 'harmony-relationships', angle: 90, icon: Users2 },
  { id: 'growth', name: 'Развитие', route: '/development', color: 'harmony-growth', angle: 135, icon: GraduationCap },
  { id: 'hobby', name: 'Хобби', route: '/hobbies', color: 'harmony-hobbies', angle: 180, icon: Paintbrush },
  { id: 'rest', name: 'Отдых', route: '/rest', color: 'harmony-rest', angle: 225, icon: Bed },
  { id: 'finance', name: 'Финансы', route: '/finance', color: 'harmony-finance', angle: 270, icon: Landmark },
  { id: 'spirit', name: 'Духовность', route: '/spirituality', color: 'harmony-spirit', angle: 315, icon: Sparkles }
];

const CircularBalanceIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSphere, setHoveredSphere] = useState<string | null>(null);
  const { lifeSpheres, averageBalance, loading } = useLifeBalanceData();

  // Объединяем данные из хука с визуальной информацией
  const enrichedSpheres = sphereMapping.map(mapping => {
    const data = lifeSpheres.find(sphere => sphere.id === mapping.id);
    return {
      ...mapping,
      value: data?.value || 0
    };
  });
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-[500px]">Загрузка...</div>;
  }
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
          {averageBalance}
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
      {enrichedSpheres.map((sphere) => {
        const position = getSpherePosition(sphere.angle);
        const IconComponent = sphere.icon;
        
        return (
          <Button
            key={sphere.id}
            variant="ghost"
            className={`absolute rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer flex flex-col items-center justify-center border-2`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${sphereSize}px`,
              height: `${sphereSize}px`,
              backgroundColor: `hsl(var(--${sphere.color}))`,
              borderColor: `hsl(var(--${sphere.color}))`,
              color: 'white'
            }}
            onClick={() => navigate(sphere.route)}
            onMouseEnter={() => setHoveredSphere(sphere.id)}
            onMouseLeave={() => setHoveredSphere(null)}
            title={`${sphere.name}: ${sphere.value}/100`}
          >
            <IconComponent 
              className="w-5 h-5 mb-1 text-white"
            />
            <span className="text-xs font-bold text-white">
              {sphere.value}
            </span>
          </Button>
        );
      })}

      {/* Подписи для наведенной сферы */}
      {hoveredSphere && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass p-3 rounded-lg z-10">
          <p className="text-sm font-medium text-foreground">
            {enrichedSpheres.find(s => s.id === hoveredSphere)?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {enrichedSpheres.find(s => s.id === hoveredSphere)?.value}/100
          </p>
        </div>
      )}
    </div>
  );
};

export default CircularBalanceIndicator;