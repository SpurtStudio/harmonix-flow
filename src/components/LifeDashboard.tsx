import React from 'react';
import { PageWrapper } from './PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpcomingTasks } from './UpcomingTasks';
import { ProgressOverview } from './ProgressOverview';
import { Sparkles, Target, Book } from 'lucide-react';

interface LifeDashboardProps {
  userName?: string;
}

export const LifeDashboard = React.memo(({ userName = "Друг" }: LifeDashboardProps) => {
  const currentTime = new Date().getHours();
  const getGreeting = () => {
    if (currentTime < 12) return "Доброе утро";
    if (currentTime < 18) return "Добрый день";
    return "Добрый вечер";
  };

  return (
    <PageWrapper title={`${getGreeting()}, ${userName}!`}>
      {/* Приветствие */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="relative">
          <Sparkles className="w-8 h-8 text-harmony-spirit mx-auto mb-4 animate-float" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Добро пожаловать в вашу систему управления личной эффективностью "Гармония". 
          Создавайте баланс между всеми сферами жизни.
        </p>
      </div>

      {/* Основной контент в 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Правая колонка */}
        <div className="space-y-6">
          <Card className="card-glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Book className="w-5 h-5 text-harmony-spirit" />
              <h3 className="font-space font-medium text-foreground">
                Дневник мыслей
              </h3>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start glass hover:glass-hover">
                <Sparkles className="w-4 h-4 mr-2" />
                Быстрая запись
              </Button>
              <p className="text-sm text-muted-foreground">
                Поделитесь своими мыслями о дне. ИИ поможет найти связи с вашими целями.
              </p>
            </div>
          </Card>
        </div>

        {/* Левая колонка */}
        <div className="space-y-6">
          <Card className="card-glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-harmony-growth" />
              <h3 className="text-lg font-space font-medium text-foreground">
                Предстоящие задачи
              </h3>
            </div>
            <UpcomingTasks />
          </Card>

          <Card className="card-glass p-6">
            <h3 className="text-lg font-space font-medium text-foreground mb-4">
              Прогресс целей
            </h3>
            <ProgressOverview />
          </Card>
        </div>
      </div>

      {/* Индикатор времени (позитивный) */}
      <Card className="card-glass p-6 text-center animate-glow">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Сегодня у вас есть возможность создать что-то прекрасное
          </p>
          <div className="flex items-center justify-center gap-2 text-harmony-spirit">
            <span className="text-2xl font-space font-bold">24</span>
            <span className="text-sm">часа возможностей</span>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
});