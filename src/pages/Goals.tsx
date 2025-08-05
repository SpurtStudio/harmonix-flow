import React, { useState } from 'react';
import { Target, Plus, ChevronRight, Lightbulb, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockGoals = [
  {
    id: 1,
    title: 'Освоить новую технологию',
    category: 'Развитие',
    progress: 75,
    deadline: '2024-03-15',
    type: 'quarterly',
    objectives: [
      { title: 'Изучить основы', progress: 100 },
      { title: 'Создать проект', progress: 80 },
      { title: 'Получить сертификат', progress: 45 }
    ]
  },
  {
    id: 2,
    title: 'Улучшить физическую форму',
    category: 'Здоровье',
    progress: 60,
    deadline: '2024-06-01',
    type: 'quarterly',
    objectives: [
      { title: 'Тренировки 3 раза в неделю', progress: 70 },
      { title: 'Сбросить 5 кг', progress: 50 },
      { title: 'Пробежать 10 км', progress: 60 }
    ]
  },
  {
    id: 3,
    title: 'Запустить побочный проект',
    category: 'Карьера',
    progress: 30,
    deadline: '2024-12-31',
    type: 'yearly',
    objectives: [
      { title: 'Исследование рынка', progress: 100 },
      { title: 'MVP разработка', progress: 20 },
      { title: 'Первые клиенты', progress: 0 }
    ]
  }
];

const categoryColors = {
  'Развитие': 'bg-primary/20 text-primary border-primary/30',
  'Здоровье': 'bg-success/20 text-success border-success/30',
  'Карьера': 'bg-secondary/20 text-secondary border-secondary/30',
  'Отношения': 'bg-accent/20 text-accent-foreground border-accent/30'
};

export default function Goals() {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Цели и OKR</h1>
          <p className="text-muted-foreground mt-1">
            Многоуровневая система достижения целей
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Новая цель
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="quarterly">Квартальные</TabsTrigger>
          <TabsTrigger value="yearly">Годовые</TabsTrigger>
          <TabsTrigger value="vision">Видение</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Активные цели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">8</div>
                <p className="text-sm text-muted-foreground">В процессе выполнения</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-surface/80 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-success" />
                  Завершенные
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">12</div>
                <p className="text-sm text-muted-foreground">В этом квартале</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-surface/80 border-secondary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Средний прогресс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">68%</div>
                <p className="text-sm text-muted-foreground">По всем целям</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Текущие цели</h2>
              {mockGoals.map((goal) => (
                <Card 
                  key={goal.id} 
                  className={`backdrop-blur-xl bg-surface/80 border-primary/20 cursor-pointer transition-all hover:shadow-lg ${
                    selectedGoal === goal.id ? 'ring-2 ring-primary/50' : ''
                  }`}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={categoryColors[goal.category as keyof typeof categoryColors]}
                      >
                        {goal.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Прогресс</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>До: {goal.deadline}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Goal Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Детали цели</h2>
              {selectedGoal ? (
                <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
                  <CardHeader>
                    <CardTitle>
                      {mockGoals.find(g => g.id === selectedGoal)?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Ключевые результаты (OKR):</h4>
                      {mockGoals.find(g => g.id === selectedGoal)?.objectives.map((obj, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{obj.title}</span>
                            <span className="font-medium">{obj.progress}%</span>
                          </div>
                          <Progress value={obj.progress} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border/30">
                      <Button variant="outline" className="w-full">
                        Редактировать цель
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="backdrop-blur-xl bg-surface/80 border-border/30">
                  <CardContent className="flex items-center justify-center h-64 text-center">
                    <div className="space-y-2">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        Выберите цель для просмотра деталей
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quarterly">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Target className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Квартальные цели будут добавлены в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Star className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Годовые цели будут добавлены в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Модуль видения жизни будет добавлен в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}