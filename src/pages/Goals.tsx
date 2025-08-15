// src/pages/Goals.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import HelpTooltip from '../components/HelpTooltip';
import { db, Vision, GlobalGoal, StrategicGoal } from '../lib/db'; // Импорт db и интерфейсов
import { Link } from 'react-router-dom'; // Для навигации
import { getLifeBalanceRecommendations } from '../lib/ai'; // Для ИИ-анализа
import { useChangePropagation } from '../hooks/use-change-propagation'; // Для системы оперативных изменений
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress'; // Для визуализации прогресса
import { Badge } from '../components/ui/badge'; // Для отображения тегов

const Goals: React.FC = () => {
  const [visions, setVisions] = useState<Vision[]>([]);
  const [globalGoals, setGlobalGoals] = useState<GlobalGoal[]>([]);
  const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingGoals, setIsAnalyzingGoals] = useState(false);
  const [balanceAnalysis, setBalanceAnalysis] = useState<string | null>(null);
  const [isAnalyzingBalance, setIsAnalyzingBalance] = useState(false);
  const [lifeSphereBalances, setLifeSphereBalances] = useState<Record<string, number>>({});
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [changeHistory, setChangeHistory] = useState<any[]>([]);

  // Состояния для формы добавления цели
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'vision' | 'global' | 'strategic'>('vision');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalLifeSphere, setNewGoalLifeSphere] = useState('work');
  const [newGoalPriority, setNewGoalPriority] = useState(5);
  const [newGoalKrs, setNewGoalKrs] = useState(['']);
  const [newGoalBalanceScore, setNewGoalBalanceScore] = useState(5); // Для видения
  const [newGoalProgress, setNewGoalProgress] = useState(0); // Для глобальных целей
  const [newGoalImpactOnBalance, setNewGoalImpactOnBalance] = useState(5); // Для стратегических целей
  const [newGoalImageUrl, setNewGoalImageUrl] = useState(''); // Для видения

  const { propagateChange, applyAdjustments } = useChangePropagation();

  const calculateLifeSphereBalances = useCallback(() => {
    const balances: Record<string, number> = {};
    const sphereCounts: Record<string, number> = {};
    const totalGoals = globalGoals.length;
    
    // Подсчитываем количество целей по каждой сфере
    globalGoals.forEach(goal => {
      sphereCounts[goal.lifeSphere] = (sphereCounts[goal.lifeSphere] || 0) + 1;
    });
    
    // Вычисляем баланс для каждой сферы (в процентах от общего количества целей)
    Object.keys(sphereCounts).forEach(sphere => {
      balances[sphere] = Math.round((sphereCounts[sphere] / totalGoals) * 100);
    });
    
    setLifeSphereBalances(balances);
  }, [globalGoals]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const loadedVisions = await db.visions.toArray();
        const loadedGlobalGoals = await db.globalGoals.toArray();
        const loadedStrategicGoals = await db.strategicGoals.toArray();
        setVisions(loadedVisions);
        setGlobalGoals(loadedGlobalGoals);
        setStrategicGoals(loadedStrategicGoals);
        
        // Вычисляем баланс по сферам жизни после загрузки целей
        calculateLifeSphereBalances();
      } catch (error) {
        console.error('Ошибка при загрузке целей:', error);
      }
    };
    loadGoals();
  }, [calculateLifeSphereBalances]);

  const handleAddGoal = useCallback(async () => {
    try {
      let newGoalId;
      
      switch (newGoalType) {
        case 'vision':
          newGoalId = await db.visions.add({
            name: newGoalName,
            description: newGoalDescription,
            balanceScore: newGoalBalanceScore,
            imageUrl: newGoalImageUrl || undefined,
          });
          // Перезагружаем цели после добавления
          const loadedVisions = await db.visions.toArray();
          setVisions(loadedVisions);
          break;
          
        case 'global':
          newGoalId = await db.globalGoals.add({
            name: newGoalName,
            smartFormulation: newGoalDescription,
            progress: newGoalProgress,
            lifeSphere: newGoalLifeSphere,
          });
          // Перезагружаем цели после добавления
          const loadedGlobalGoals = await db.globalGoals.toArray();
          setGlobalGoals(loadedGlobalGoals);
          break;
          
        case 'strategic':
          newGoalId = await db.strategicGoals.add({
            name: newGoalName,
            krs: newGoalKrs.filter(kr => kr.trim() !== ''), // Убираем пустые KR
            priority: newGoalPriority,
            impactOnBalance: newGoalImpactOnBalance,
          });
          // Перезагружаем цели после добавления
          const loadedStrategicGoals = await db.strategicGoals.toArray();
          setStrategicGoals(loadedStrategicGoals);
          break;
      }
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'goal_added',
        entityId: newGoalId,
        oldValue: null,
        newValue: {
          type: newGoalType,
          name: newGoalName,
          description: newGoalDescription,
          lifeSphere: newGoalLifeSphere,
          priority: newGoalPriority,
          krs: newGoalKrs,
          balanceScore: newGoalBalanceScore,
          progress: newGoalProgress,
          impactOnBalance: newGoalImpactOnBalance,
          imageUrl: newGoalImageUrl
        }
      });
      
      console.log('Анализ влияния изменений:', changeResult);
      
      // Сбрасываем форму
      resetForm();
      setIsAddGoalDialogOpen(false);
      
      alert(`Цель типа "${newGoalType}" успешно добавлена!`);
    } catch (error) {
      console.error('Ошибка при добавлении цели:', error);
      alert('Ошибка при добавлении цели.');
    }
  }, [newGoalType, newGoalName, newGoalDescription, newGoalLifeSphere, newGoalPriority, newGoalKrs, newGoalBalanceScore, newGoalProgress, newGoalImpactOnBalance, newGoalImageUrl, propagateChange]);

  const handleAnalyzeGoals = useCallback(async () => {
    setIsAnalyzingGoals(true);
    try {
      // Передаем реальные данные целей для анализа ИИ
      const goalData: Record<string, number> = {
        visionCount: visions.length,
        globalGoalCount: globalGoals.length,
        strategicGoalCount: strategicGoals.length,
        avgPriority: strategicGoals.length > 0 ? strategicGoals.reduce((sum, goal) => sum + goal.priority, 0) / strategicGoals.length : 0,
      };
      
      // Добавляем данные по сферам жизни
      globalGoals.forEach(goal => {
        const sphereCount = goalData[`lifeSphere_${goal.lifeSphere}`] || 0;
        goalData[`lifeSphere_${goal.lifeSphere}`] = sphereCount + 1;
      });
      
      const analysis = await getLifeBalanceRecommendations(goalData);
      setAiAnalysisResult(analysis);
    } catch (error) {
      console.error('Ошибка при ИИ-анализе целей:', error);
      setAiAnalysisResult('Ошибка при получении ИИ-рекомендаций.');
    } finally {
      setIsAnalyzingGoals(false);
    }
  }, [visions, globalGoals, strategicGoals]);

  const handleAnalyzeBalance = useCallback(async () => {
    setIsAnalyzingBalance(true);
    try {
      // Вычисляем баланс по сферам
      calculateLifeSphereBalances();
      
      // Анализ баланса по сферам жизни
      const lifeSpheres: Record<string, number> = {};
      globalGoals.forEach(goal => {
        const sphereCount = lifeSpheres[goal.lifeSphere] || 0;
        lifeSpheres[goal.lifeSphere] = sphereCount + 1;
      });
      
      const analysis = await getLifeBalanceRecommendations(lifeSpheres);
      setBalanceAnalysis(analysis);
    } catch (error) {
      console.error('Ошибка при анализе баланса:', error);
      setBalanceAnalysis('Ошибка при анализе баланса по сферам жизни.');
    } finally {
      setIsAnalyzingBalance(false);
    }
  }, [globalGoals, calculateLifeSphereBalances]);

  const handleWhatIfScenario = useCallback(async () => {
    // Режим "Что-если" - имитация изменения приоритета стратегической цели
    if (strategicGoals.length === 0) {
      alert('Нет стратегических целей для анализа.');
      return;
    }
    
    const randomGoal = strategicGoals[Math.floor(Math.random() * strategicGoals.length)];
    const newPriority = Math.min(10, randomGoal.priority + 2); // Увеличиваем приоритет
    
    const changeResult = await propagateChange({
      type: 'goal_priority_changed',
      entityId: randomGoal.id!,
      oldValue: randomGoal.priority,
      newValue: newPriority
    });
    
    console.log('Анализ сценария "Что-если":', changeResult);
    alert(`Проанализирован сценарий: увеличение приоритета цели "${randomGoal.name}" с ${randomGoal.priority} до ${newPriority}. Проверьте консоль для деталей.`);
  }, [strategicGoals, propagateChange]);

  const loadChangeHistory = useCallback(async () => {
    try {
      const history = await db.changeHistory.toArray();
      // Сортируем по времени в обратном порядке (новые первыми)
      const sortedHistory = history.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setChangeHistory(sortedHistory);
    } catch (error) {
      console.error('Ошибка при загрузке истории изменений:', error);
      alert('Ошибка при загрузке истории изменений.');
    }
  }, []);

  const handleViewHistory = useCallback(async () => {
    await loadChangeHistory();
    setIsViewingHistory(true);
  }, [loadChangeHistory]);

  const handleRollbackChanges = useCallback(async () => {
    try {
      // В реальной реализации здесь будет восстановление предыдущего состояния целей
      // Например, можно хранить историю изменений в отдельной таблице базы данных
      // и восстанавливать состояние из неё
      
      // Пока просто показываем сообщение
      alert('Функция отката изменений будет реализована в следующих версиях.');
    } catch (error) {
      console.error('Ошибка при откате изменений:', error);
      alert('Ошибка при откате изменений.');
    }
  }, []);

  const addKrField = () => {
    setNewGoalKrs([...newGoalKrs, '']);
  };

  const updateKrField = (index: number, value: string) => {
    const updatedKrs = [...newGoalKrs];
    updatedKrs[index] = value;
    setNewGoalKrs(updatedKrs);
  };

  const removeKrField = (index: number) => {
    const updatedKrs = [...newGoalKrs];
    updatedKrs.splice(index, 1);
    setNewGoalKrs(updatedKrs);
  };

  // Функция для сброса формы
  const resetForm = () => {
    setNewGoalName('');
    setNewGoalDescription('');
    setNewGoalKrs(['']);
    setNewGoalImageUrl('');
    setNewGoalBalanceScore(5);
    setNewGoalProgress(0);
    setNewGoalImpactOnBalance(5);
    setNewGoalPriority(5);
    setNewGoalLifeSphere('work');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Цели (OKR++) & Видение</h1>

      {/* Иерархическое отображение целей */}
      <Card>
        <CardHeader>
          <HelpTooltip content="Здесь вы можете определить свое долгосрочное видение и глобальные, стратегические цели.">
            <CardTitle>Ваше Видение и Цели</CardTitle>
          </HelpTooltip>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">Видение (10+ лет):</p>
          <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
            {visions.length === 0 ? (
              <li>Нет видений. Добавьте первое!</li>
            ) : (
              visions.map(vision => (
                <li key={vision.id}>
                  <strong>{vision.name}:</strong> {vision.description} (Баланс: {vision.balanceScore})
                </li>
              ))
            )}
          </ul>

          <p className="text-lg font-semibold">Глобальные цели (3-5 лет):</p>
          <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
            {globalGoals.length === 0 ? (
              <li>Нет глобальных целей.</li>
            ) : (
              globalGoals.map(goal => (
                <li key={goal.id}>
                  <strong>{goal.name}:</strong> {goal.smartFormulation} (Прогресс: {goal.progress}%, Сфера: {goal.lifeSphere})
                </li>
              ))
            )}
          </ul>

          <p className="text-lg font-semibold">Стратегические цели (1 год):</p>
          <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
            {strategicGoals.length === 0 ? (
              <li>Нет стратегических целей.</li>
            ) : (
              strategicGoals.map(goal => (
                <li key={goal.id}>
                  <strong>{goal.name}:</strong> KRs: {goal.krs.join(', ')} (Приоритет: {goal.priority})
                </li>
              ))
            )}
          </ul>

          <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4">
                Добавить новую цель
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить новую цель</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalType">Тип цели</Label>
                  <Select value={newGoalType} onValueChange={(value: 'vision' | 'global' | 'strategic') => setNewGoalType(value)}>
                    <SelectTrigger id="goalType">
                      <SelectValue placeholder="Выберите тип цели" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vision">Видение</SelectItem>
                      <SelectItem value="global">Глобальная цель</SelectItem>
                      <SelectItem value="strategic">Стратегическая цель</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="goalName">Название</Label>
                  <Input
                    id="goalName"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Введите название цели"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goalDescription">Описание</Label>
                  <Textarea
                    id="goalDescription"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    placeholder="Введите описание цели"
                    className="min-h-[100px]"
                  />
                </div>
                
                {newGoalType === 'vision' && (
                  <>
                    <div>
                      <Label htmlFor="goalBalanceScore">Оценка баланса (1-10)</Label>
                      <Input
                        id="goalBalanceScore"
                        type="number"
                        min="1"
                        max="10"
                        value={newGoalBalanceScore}
                        onChange={(e) => setNewGoalBalanceScore(parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="goalImageUrl">URL изображения (опционально)</Label>
                      <Input
                        id="goalImageUrl"
                        value={newGoalImageUrl}
                        onChange={(e) => setNewGoalImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </>
                )}
                
                {newGoalType === 'global' && (
                  <>
                    <div>
                      <Label htmlFor="goalLifeSphere">Сфера жизни</Label>
                      <Select value={newGoalLifeSphere} onValueChange={setNewGoalLifeSphere}>
                        <SelectTrigger id="goalLifeSphere">
                          <SelectValue placeholder="Выберите сферу жизни" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Работа</SelectItem>
                          <SelectItem value="health">Здоровье</SelectItem>
                          <SelectItem value="family">Семья/Друзья</SelectItem>
                          <SelectItem value="development">Развитие</SelectItem>
                          <SelectItem value="hobbies">Хобби</SelectItem>
                          <SelectItem value="rest">Отдых</SelectItem>
                          <SelectItem value="finance">Финансы</SelectItem>
                          <SelectItem value="spirituality">Духовность</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="goalProgress">Прогресс (0-100%)</Label>
                      <Input
                        id="goalProgress"
                        type="number"
                        min="0"
                        max="100"
                        value={newGoalProgress}
                        onChange={(e) => setNewGoalProgress(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </>
                )}
                
                {newGoalType === 'strategic' && (
                  <>
                    <div>
                      <Label>Ключевые результаты (KRs)</Label>
                      {newGoalKrs.map((kr, index) => (
                        <div key={index} className="flex items-center mt-2">
                          <Input
                            value={kr}
                            onChange={(e) => updateKrField(index, e.target.value)}
                            placeholder={`Ключевой результат ${index + 1}`}
                          />
                          {newGoalKrs.length > 1 && (
                            <Button
                              variant="outline"
                              className="ml-2"
                              onClick={() => removeKrField(index)}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" className="mt-2" onClick={addKrField}>
                        Добавить KR
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="goalPriority">Приоритет (1-10)</Label>
                      <Input
                        id="goalPriority"
                        type="number"
                        min="1"
                        max="10"
                        value={newGoalPriority}
                        onChange={(e) => setNewGoalPriority(parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="goalImpactOnBalance">Влияние на баланс (1-10)</Label>
                      <Input
                        id="goalImpactOnBalance"
                        type="number"
                        min="1"
                        max="10"
                        value={newGoalImpactOnBalance}
                        onChange={(e) => setNewGoalImpactOnBalance(parseInt(e.target.value) || 5)}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setIsAddGoalDialogOpen(false);
                  }}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddGoal}>Добавить цель</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Анализатор баланса и ИИ-анализ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Анализатор баланса по сферам жизни</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Визуализация баланса по сферам */}
              {Object.keys(lifeSphereBalances).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(lifeSphereBalances).map(([sphere, balance]) => (
                    <div key={sphere} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {sphere === 'work' && 'Работа'}
                          {sphere === 'health' && 'Здоровье'}
                          {sphere === 'family' && 'Семья/Друзья'}
                          {sphere === 'development' && 'Развитие'}
                          {sphere === 'hobbies' && 'Хобби'}
                          {sphere === 'rest' && 'Отдых'}
                          {sphere === 'finance' && 'Финансы'}
                          {sphere === 'spirituality' && 'Духовность'}
                        </span>
                        <span className="text-sm text-gray-500">{balance}%</span>
                      </div>
                      <Progress value={balance} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Нет данных для отображения баланса.</p>
              )}
              
              {/* Рекомендации ИИ */}
              <div className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {balanceAnalysis || 'Анализ влияния целей на баланс по сферам жизни.'}
                </p>
              </div>
              
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleAnalyzeBalance}
                disabled={isAnalyzingBalance}
              >
                {isAnalyzingBalance ? 'Анализ...' : 'Оценить влияние'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ИИ-анализ реалистичности целей</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {aiAnalysisResult || 'ИИ-рекомендации по корректировке целей.'}
            </p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={handleAnalyzeGoals} 
              disabled={isAnalyzingGoals}
            >
              {isAnalyzingGoals ? 'Анализ...' : 'Запросить ИИ-анализ'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Система оперативных изменений */}
      <Card>
        <CardHeader>
          <HelpTooltip content="Моделируйте и управляйте изменениями в ваших целях, отслеживая их влияние.">
            <CardTitle>Система оперативных изменений для целей</CardTitle>
          </HelpTooltip>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Моделируйте изменения в ваших целях и отслеживайте их влияние.
          </p>
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={handleWhatIfScenario}
          >
            Режим "Что-если"
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRollbackChanges}
          >
            Откатить изменения
          </Button>
        </CardContent>
      </Card>

      {/* История изменений и интерактивная документация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>История изменений и прогресса</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Журнал всех корректировок целей и их влияния на систему.
            </p>
            <Button variant="outline" className="mt-2" onClick={handleViewHistory}>Просмотреть историю</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Интерактивная документация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Пошаговое руководство по постановке целей и шаблон SMART.
            </p>
            <Link to="/documentation" className="text-blue-500 cursor-pointer hover:underline">
              <Button variant="outline" className="mt-2">Открыть руководство</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Диалог истории изменений */}
      <Dialog open={isViewingHistory} onOpenChange={setIsViewingHistory}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История изменений целей</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {changeHistory.length > 0 ? (
              <div className="space-y-3">
                {changeHistory.map((change, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {change.changeType === 'goal_added'