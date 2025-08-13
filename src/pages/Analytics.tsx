import React from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LifeBalanceRadar } from '@/components/LifeBalanceRadar';
import { useProductivityData } from '@/hooks/useProductivityData';
import { useAIInsights } from '@/hooks/useAIInsights';

const impactColors = {
  high: 'bg-primary/20 text-primary border-primary/30',
  medium: 'bg-secondary/20 text-secondary border-secondary/30',
  positive: 'bg-success/20 text-success border-success/30'
};

export default function Analytics() {
  const { data: productivityData, loading: productivityLoading } = useProductivityData();
  const { insights, loading: insightsLoading } = useAIInsights();

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
                <div className="text-3xl font-bold text-foreground">{productivityData.energyLevel}</div>
                <p className="text-sm text-muted-foreground">из 10</p>
                <Progress value={productivityData.energyLevel * 10} className="mt-2 h-2" />
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
                <div className="text-3xl font-bold text-foreground">{productivityData.goalCompletion}%</div>
                <p className="text-sm text-muted-foreground">завершено</p>
                <Progress value={productivityData.goalCompletion} className="mt-2 h-2" />
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
                <div className="text-3xl font-bold text-foreground">{productivityData.deepWorkHours}ч</div>
                <p className="text-sm text-muted-foreground">глубокой работы</p>
                <Progress value={productivityData.deepWorkHours * 10} className="mt-2 h-2" />
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
                <div className="text-3xl font-bold text-foreground">+{productivityData.growthPercentage}%</div>
                <p className="text-sm text-muted-foreground">за месяц</p>
                <Progress value={productivityData.growthPercentage * 5} className="mt-2 h-2" />
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
              {productivityLoading ? (
                <div>Загрузка данных о продуктивности...</div>
              ) : (
                <div className="space-y-4">
                  {productivityData.byDay.map((data) => (
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
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle>Ключевые инсайты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <div>Загрузка ИИ-инсайтов...</div>
              ) : (
                <div className="space-y-4">
                  {insights && insights.aiInsights && insights.aiInsights.length > 0 ? (
                    insights.aiInsights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/30">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">Персонализированный инсайт</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={impactColors['high']}
                        >
                          AI
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Нет персонализированных инсайтов.
                        Начните использовать приложение, чтобы получить рекомендации.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Анализ по приоритетам (Матрица Эйзенхауэра) */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Матрица Эйзенхауэра
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                      <h4 className="font-medium text-red-600 dark:text-red-400">Срочные и важные</h4>
                      <p className="text-2xl font-bold">{productivityData.urgentImportant}</p>
                      <p className="text-sm text-muted-foreground">задач выполнено</p>
                    </div>
                    <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Не срочные, но важные</h4>
                      <p className="text-2xl font-bold">{productivityData.notUrgentImportant}</p>
                      <p className="text-sm text-muted-foreground">задач выполнено</p>
                    </div>
                    <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <h4 className="font-medium text-blue-600 dark:text-blue-400">Срочные, но не важные</h4>
                      <p className="text-2xl font-bold">{productivityData.urgentNotImportant}</p>
                      <p className="text-sm text-muted-foreground">задач выполнено</p>
                    </div>
                    <div className="p-4 bg-gray-500/20 rounded-lg border border-gray-500/30">
                      <h4 className="font-medium text-gray-600 dark:text-gray-400">Не срочные и не важные</h4>
                      <p className="text-2xl font-bold">{productivityData.notUrgentNotImportant}</p>
                      <p className="text-sm text-muted-foreground">задач выполнено</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Фокус на важных задачах: {productivityData.focusOnImportantTasks}% времени
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Анализ по сферам жизни */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Активность по сферам жизни
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(productivityData.bySphere).length > 0 ? (
                    Object.entries(productivityData.bySphere).map(([sphere, count]) => (
                      <div key={sphere}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{sphere}</span>
                          <span className="text-sm font-medium">{count} задач</span>
                        </div>
                        <Progress value={Math.min(count * 10, 100)} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет данных по сферам жизни</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Анализ временных затрат */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Временные затраты по дням недели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productivityData.byDay.map((data) => (
                  <div key={data.day} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">{data.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={data.value} className="flex-1 h-3" />
                        <span className="text-sm font-medium w-12">
                          {Math.round((data.value / 100) * 8 * 10) / 10}ч
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Эффективность планирования */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Эффективность планирования
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.min(100, Math.round((productivityData.urgentImportant + productivityData.notUrgentImportant + productivityData.urgentNotImportant + productivityData.notUrgentNotImportant) / 10 * 100))}%
                  </div>
                  <p className="text-sm text-muted-foreground">Запланировано</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.min(100, Math.round((productivityData.urgentImportant + productivityData.notUrgentImportant) / Math.max(1, productivityData.urgentImportant + productivityData.notUrgentImportant + productivityData.urgentNotImportant + productivityData.notUrgentNotImportant) * 100))}%
                  </div>
                  <p className="text-sm text-muted-foreground">Выполнено</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">+{productivityData.growthPercentage}%</div>
                  <p className="text-sm text-muted-foreground">Рост за месяц</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Рекомендация: {productivityData.planningRecommendation}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Радар баланса жизни */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Баланс жизни (радар)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <LifeBalanceRadar />
              </CardContent>
            </Card>
            
            {/* Детализация по сферам */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Детализация по сферам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(productivityData.bySphere).length > 0 ? (
                    Object.entries(productivityData.bySphere).map(([sphere, count]) => (
                      <div key={sphere}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{sphere}</span>
                          <span className="text-sm font-medium">{count} задач</span>
                        </div>
                        <Progress value={Math.min(count * 10, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {count > 5 ? 'Высокая активность' : count > 2 ? 'Средняя активность' : 'Низкая активность'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет данных по сферам жизни</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Рекомендации по балансу */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Рекомендации по улучшению баланса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights && insights.lifeBalanceRecommendations && insights.lifeBalanceRecommendations.length > 0 ? (
                  insights.lifeBalanceRecommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <h4 className="font-medium">Рекомендация по балансу жизни</h4>
                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Нет персонализированных рекомендаций по балансу жизни.
                      Начните использовать приложение, чтобы получить рекомендации.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Персонализированные инсайты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div>Загрузка персонализированных инсайтов...</div>
              ) : (
                <div className="space-y-4">
                  {insights && insights.aiInsights && insights.aiInsights.length > 0 ? (
                    insights.aiInsights.map((insight: string, index: number) => (
                      <div key={index} className="p-4 rounded-lg border border-border/30">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h4 className="font-medium text-foreground">Персонализированный инсайт</h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-foreground mb-1">Инсайты не найдены</h3>
                      <p className="text-sm text-muted-foreground">
                        Начните использовать приложение, чтобы получить персонализированные рекомендации
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}