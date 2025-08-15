import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LifeSphere {
  id: string;
  name: string;
  route: string;
  value: number;
  color: string;
  angle: number;
}

const lifeSpheres: LifeSphere[] = [
  { id: 'work', name: 'Работа', route: '/work', value: 7, color: 'harmony-work', angle: 0 },
  { id: 'health', name: 'Здоровье', route: '/health', value: 8, color: 'harmony-health', angle: 45 },
  { id: 'relationships', name: 'Отношения', route: '/family-friends', value: 6, color: 'harmony-relationships', angle: 90 },
  { id: 'development', name: 'Развитие', route: '/development', value: 7, color: 'harmony-growth', angle: 135 },
  { id: 'hobbies', name: 'Хобби', route: '/hobbies', value: 5, color: 'harmony-hobbies', angle: 180 },
  { id: 'rest', name: 'Отдых', route: '/rest', value: 6, color: 'harmony-rest', angle: 225 },
  { id: 'finance', name: 'Финансы', route: '/finance', value: 7, color: 'harmony-finance', angle: 270 },
  { id: 'spirituality', name: 'Духовность', route: '/spirituality', value: 8, color: 'harmony-spirit', angle: 315 }
];

const CircularBalanceIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSphere, setHoveredSphere] = useState<string | null>(null);
  
  const totalBalance = Math.round(lifeSpheres.reduce((sum, sphere) => sum + sphere.value, 0) / lifeSpheres.length);
  const centerRadius = 120;
  const sphereRadius = 180;
  const sphereSize = 50;

  const getSpherePosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const x = centerRadius + sphereRadius * Math.cos(radian);
    const y = centerRadius + sphereRadius * Math.sin(radian);
    return { x: x - sphereSize / 2, y: y - sphereSize / 2 };
  };

  const createSegmentPath = (startAngle: number, endAngle: number, value: number) => {
    const maxRadius = 100;
    const radius = (value / 10) * maxRadius + 20;
    const startRadian = (startAngle * Math.PI) / 180;
    const endRadian = (endAngle * Math.PI) / 180;
    
    const x1 = centerRadius + radius * Math.cos(startRadian);
    const y1 = centerRadius + radius * Math.sin(startRadian);
    const x2 = centerRadius + radius * Math.cos(endRadian);
    const y2 = centerRadius + radius * Math.sin(endRadian);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerRadius} ${centerRadius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative w-full flex justify-center items-center min-h-[500px]">
      <svg width="480" height="480" className="relative">
        {/* Центральная окружность баланса - утолщенная в 5 раз */}
        <circle
          cx={centerRadius}
          cy={centerRadius}
          r="80"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="20"
          className="opacity-20"
        />
        
        {/* Сегменты баланса */}
        {lifeSpheres.map((sphere, index) => {
          const startAngle = sphere.angle - 22.5;
          const endAngle = sphere.angle + 22.5;
          const segmentPath = createSegmentPath(startAngle, endAngle, sphere.value);
          
          return (
            <path
              key={sphere.id}
              d={segmentPath}
              fill={`hsl(var(--${sphere.color}))`}
              className={`opacity-70 transition-all duration-300 ${
                hoveredSphere === sphere.id ? 'opacity-100' : ''
              }`}
            />
          );
        })}

        {/* Центральный индикатор общего баланса */}
        <circle
          cx={centerRadius}
          cy={centerRadius}
          r="60"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        <text
          x={centerRadius}
          y={centerRadius - 10}
          textAnchor="middle"
          className="text-3xl font-space font-bold fill-foreground"
        >
          {totalBalance}
        </text>
        
        <text
          x={centerRadius}
          y={centerRadius + 15}
          textAnchor="middle"
          className="text-sm fill-muted-foreground"
        >
          Баланс жизни
        </text>
      </svg>

      {/* Индикаторы сфер жизни */}
      {lifeSpheres.map((sphere) => {
        const position = getSpherePosition(sphere.angle);
        return (
          <Button
            key={sphere.id}
            variant="ghost"
            size="icon"
            className={`absolute w-12 h-12 rounded-full glass hover:glass-hover sphere-${sphere.id} transition-all duration-300 transform hover:scale-110`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onClick={() => navigate(sphere.route)}
            onMouseEnter={() => setHoveredSphere(sphere.id)}
            onMouseLeave={() => setHoveredSphere(null)}
            title={`${sphere.name}: ${sphere.value}/10`}
          >
            <div className="w-6 h-6 rounded-full bg-current opacity-80" />
          </Button>
        );
      })}

      {/* Подписи для наведенной сферы */}
      {hoveredSphere && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass p-3 rounded-lg">
          <p className="text-sm font-medium text-foreground">
            {lifeSpheres.find(s => s.id === hoveredSphere)?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {lifeSpheres.find(s => s.id === hoveredSphere)?.value}/10
          </p>
        </div>
      )}
    </div>
  );
};

export default CircularBalanceIndicator;