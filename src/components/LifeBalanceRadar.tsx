import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Heart, 
  Users, 
  BookOpen, 
  Palette, 
  Moon, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';

interface LifeSphere {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  color: string;
  description: string;
}

const lifeSpheres: LifeSphere[] = [
  {
    id: 'work',
    name: 'Работа',
    icon: Briefcase,
    value: 75,
    color: 'harmony-work',
    description: 'Карьера и профессиональное развитие'
  },
  {
    id: 'health',
    name: 'Здоровье',
    icon: Heart,
    value: 60,
    color: 'harmony-health',
    description: 'Физическое и ментальное здоровье'
  },
  {
    id: 'relationships',
    name: 'Отношения',
    icon: Users,
    value: 80,
    color: 'harmony-relationships',
    description: 'Семья, друзья, социальные связи'
  },
  {
    id: 'growth',
    name: 'Развитие',
    icon: BookOpen,
    value: 65,
    color: 'harmony-growth',
    description: 'Обучение и личностный рост'
  },
  {
    id: 'hobby',
    name: 'Хобби',
    icon: Palette,
    value: 45,
    color: 'harmony-hobby',
    description: 'Творчество и увлечения'
  },
  {
    id: 'rest',
    name: 'Отдых',
    icon: Moon,
    value: 55,
    color: 'harmony-rest',
    description: 'Релаксация и восстановление'
  },
  {
    id: 'finance',
    name: 'Финансы',
    icon: DollarSign,
    value: 70,
    color: 'harmony-finance',
    description: 'Финансовое планирование'
  },
  {
    id: 'spirit',
    name: 'Духовность',
    icon: Sparkles,
    value: 50,
    color: 'harmony-spirit',
    description: 'Саморефлексия и смысл жизни'
  }
];

export const LifeBalanceRadar: React.FC = () => {
  const averageBalance = Math.round(
    lifeSpheres.reduce((sum, sphere) => sum + sphere.value, 0) / lifeSpheres.length
  );

  const getBalanceMessage = (balance: number) => {
    if (balance >= 80) return { text: "Отличная гармония!", color: "text-harmony-health" };
    if (balance >= 65) return { text: "Хороший баланс", color: "text-harmony-work" };
    if (balance >= 50) return { text: "Есть к чему стремиться", color: "text-harmony-warning" };
    return { text: "Требует внимания", color: "text-harmony-error" };
  };

  const balanceMessage = getBalanceMessage(averageBalance);

  return (
    <div className="space-y-6">
      {/* Центральный индикатор баланса */}
      <div className="text-center space-y-3">
        <div className="relative w-24 h-24 mx-auto">
          <div className="balance-indicator w-full h-full animate-balance">
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{averageBalance}</div>
                <div className="text-xs text-muted-foreground">баланс</div>
              </div>
            </div>
          </div>
        </div>
        <div className={`text-sm font-medium ${balanceMessage.color}`}>
          {balanceMessage.text}
        </div>
      </div>

      {/* Список сфер жизни */}
      <div className="space-y-3">
        {lifeSpheres.map((sphere) => {
          const IconComponent = sphere.icon;
          return (
            <div key={sphere.id} className="group">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto glass hover:glass-hover"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg sphere-${sphere.id}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{sphere.name}</span>
                      <span className="text-xs text-muted-foreground">{sphere.value}%</span>
                    </div>
                    
                    {/* Прогресс-бар */}
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full bg-${sphere.color} transition-all duration-500 ease-out`}
                        style={{ width: `${sphere.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Рекомендация ИИ */}
      <div className="glass p-4 rounded-xl border-l-4 border-harmony-spirit">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-harmony-spirit mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Рекомендация ИИ</h4>
            <p className="text-xs text-muted-foreground">
              Обратите внимание на сферу "Хобби" - выделите 30 минут сегодня для творчества. 
              Это поможет восстановить баланс и зарядиться энергией.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};