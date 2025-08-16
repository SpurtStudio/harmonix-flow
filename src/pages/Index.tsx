import React, { useState, useEffect, useCallback } from 'react';
import { LifeBalanceRadar } from '../components/LifeBalanceRadar';
import { ProgressOverview } from '../components/ProgressOverview';
import { QuickActions } from '../components/QuickActions';
import { TodaysFocus } from '../components/TodaysFocus';
import { UpcomingTasks } from '../components/UpcomingTasks';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { getLifeBalanceRecommendations } from '../lib/ai';
import { Link } from 'react-router-dom';
import { useLifeBalanceData } from '@/hooks/useLifeBalanceData';
import { EnergyLevelIndicator } from '@/components/EnergyLevelIndicator';
import { ChangePropagationSystem } from '@/components/ChangePropagationSystem';
import { InteractiveDocumentation } from '@/components/InteractiveDocumentation';

const Index: React.FC = () => {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setIsWelcomeModalOpen(true);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsWelcomeModalOpen(open);
    if (!open) {
      localStorage.setItem('hasSeenWelcomeModal', 'true');
    }
  };
  const { isBeginnerMode } = useUserPreferences();
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);
  const { lifeSpheres, averageBalance, loading: lifeBalanceLoading } = useLifeBalanceData();

  const handleGetAIRecommendations = useCallback(async () => {
    setIsGeneratingRecommendation(true);
    // Преобразуем данные из хука в формат, ожидаемый функцией getLifeBalanceRecommendations
    const balanceData: Record<string, number> = {};
    lifeSpheres.forEach(sphere => {
      balanceData[sphere.id] = sphere.value;
    });
    const recommendation = await getLifeBalanceRecommendations(balanceData);
    setAiRecommendation(recommendation);
    setIsGeneratingRecommendation(false);
  }, [lifeSpheres]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Центр Жизни (Life Dashboard)
      </h1>

      {/* Секция баланса жизни */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Визуализация баланса жизни</CardTitle>
          </CardHeader>
          <CardContent>
            {lifeBalanceLoading ? (
              <p>Загрузка данных баланса жизни...</p>
            ) : (
              <>
                <LifeBalanceRadar />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Индикатор общего баланса жизни: <span className="font-semibold text-green-600">{averageBalance}%</span>.
                  <br />
                  <Button
                    variant="link"
                    onClick={handleGetAIRecommendations}
                    disabled={isGeneratingRecommendation}
                    className="p-0 h-auto text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    {isGeneratingRecommendation ? 'Получение рекомендаций...' : 'Получить рекомендации ИИ'}
                  </Button>
                </p>
                {aiRecommendation && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {aiRecommendation}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Виджеты */}
        <Card>
          <CardHeader>
            <CardTitle>Предстоящее</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingTasks />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Фокус дня</CardTitle>
          </CardHeader>
          <CardContent>
            <TodaysFocus />
          </CardContent>
        </Card>

        {/* Расширенные виджеты, скрытые в режиме новичка */}
        {!isBeginnerMode && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Обзор прогресса</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressOverview />
              </CardContent>
            </Card>

            {/* Состояние энергии */}
            <EnergyLevelIndicator />
          </>
        )}
      </div>

      {/* Система оперативных изменений */}
      {!isBeginnerMode && (
        <ChangePropagationSystem />
      )}

      {/* Интерактивная документация */}
      <InteractiveDocumentation />
    {/* Модальное окно приветствия */}
    <Dialog open={isWelcomeModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добро пожаловать в Гармонию!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <p className="text-gray-700 dark:text-gray-300">
            Мы рады приветствовать вас в системе управления личной эффективностью.
            Начните свой путь к сбалансированной жизни!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default Index;
