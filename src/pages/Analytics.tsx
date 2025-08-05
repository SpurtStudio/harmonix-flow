import React from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const productivityData = [
  { day: 'Пн', value: 85 },
  { day: 'Вт', value: 72 },
  { day: 'Ср', value: 90 },
  { day: 'Чт', value: 78 },
  { day: 'Пт', value: 95 },
  { day: 'Сб', value: 60 },
  { day: 'Вс', value: 45 }
];

const insights = [
  {
    title: 'Пиковая продуктивность',
    description: 'Ваша продуктивность максимальна в 10:00-12:00',
    impact: 'high',
    category: 'time'
  },
  {
    title: 'Баланс сфер жизни',
    description: 'Сфера "Здоровье" требует больше внимания',
    impact: 'medium',
    category: 'balance'
  },
  {
    title: 'Завершение целей',
    description: 'В среднем вы завершаете цели на 15% быстрее срока',
    impact: 'positive',
    category: 'goals'
  }
];

const impactColors = {
  high: 'bg-primary/20 text-primary border-primary/30',
  medium: 'bg-secondary/20 text-secondary border-secondary/30',
  positive: 'bg-success/20 text-success border-success/30'
};

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground mt-1">
            Инсайты и тренды вашей продуктивности
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="productivity">Продуктивность</TabsTrigger>
          <TabsTrigger value="balance">Баланс жизни</TabsTrigger>
          <TabsTrigger value="insights">Инсайты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Энергия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">8.2</div>
                <p className="text-sm text-muted-foreground">из 10</p>
                <Progress value={82} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-surface/80 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Цели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">75%</div>
                <p className="text-sm text-muted-foreground">завершено</p>
                <Progress value={75} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-surface/80 border-secondary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Фокус
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">6.8ч</div>
                <p className="text-sm text-muted-foreground">глубокой работы</p>
                <Progress value={68} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-surface/80 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                  Рост
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">+12%</div>
                <p className="text-sm text-muted-foreground">за месяц</p>
                <Progress value={60} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Weekly Productivity Chart */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Продуктивность за неделю
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productivityData.map((data) => (
                  <div key={data.day} className="flex items-center gap-4">
                    <div className="w-8 text-sm font-medium">{data.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={data.value} className="flex-1 h-3" />
                        <span className="text-sm font-medium w-12">{data.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle>Ключевые инсайты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/30">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={impactColors[insight.impact as keyof typeof impactColors]}
                  >
                    {insight.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Детальная аналитика продуктивности будет добавлена в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Target className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Аналитика баланса жизни будет добавлена в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  ИИ-инсайты будут добавлены в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}