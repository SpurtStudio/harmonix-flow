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

const Goals: React.FC = () => {
  const [visions, setVisions] = useState<Vision[]>([]);
  const [globalGoals, setGlobalGoals] = useState<GlobalGoal[]>([]);
  const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingGoals, setIsAnalyzingGoals] = useState(false);
  const [balanceAnalysis, setBalanceAnalysis] = useState<string | null>(null);
  const [isAnalyzingBalance, setIsAnalyzingBalance] = useState(false);
  
  // Состояния для формы добавления цели
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'vision' | 'global' | 'strategic'>('vision');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalLifeSphere, setNewGoalLifeSphere] = useState('work');
  const [newGoalPriority, setNewGoalPriority] = useState(5);
  const [newGoalKrs, setNewGoalKrs] = useState(['']);

  const { propagateChange, applyAdjustments } = useChangePropagation();

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const loadedVisions = await db.visions.toArray();
        const loadedGlobalGoals = await db.globalGoals.toArray();
        const loadedStrategicGoals = await db.strategicGoals.toArray();
        setVisions(loadedVisions);
        setGlobalGoals(loadedGlobalGoals);
        setStrategicGoals(loadedStrategicGoals);
      } catch (error) {
        console.error('Ошибка при загрузке целей:', error);
      }
    };
    loadGoals();
  }, []);

  const handleAddGoal = useCallback(async () => {
    try {
      let newGoalId;
      
      switch (newGoalType) {
        case 'vision':
          newGoalId = await db.visions.add({
            name: newGoalName,
            description: newGoalDescription,
            balanceScore: 8, // По умолчанию
          });
          // Перезагружаем цели после добавления
          const loadedVisions = await db.visions.toArray();
          setVisions(loadedVisions);
          break;
          
        case 'global':
          newGoalId = await db.globalGoals.add({
            name: newGoalName,
            smartFormulation: newGoalDescription,
            progress: 0, // Начальный прогресс
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
            impactOnBalance: 5, // По умолчанию
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
          krs: newGoalKrs
        }
      });
      
      console.log('Анализ влияния изменений:', changeResult);
      
      // Сбрасываем форму
      setNewGoalName('');
      setNewGoalDescription('');
      setNewGoalKrs(['']);
      setIsAddGoalDialogOpen(false);
      
      alert(`Цель типа "${newGoalType}" успешно добавлена!`);
    } catch (error) {
      console.error('Ошибка при добавлении цели:', error);
      alert('Ошибка при добавлении цели.');
    }
  }, [newGoalType, newGoalName, newGoalDescription, newGoalLifeSphere, newGoalPriority, newGoalKrs, propagateChange]);

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
  }, [globalGoals]);

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
            <DialogContent className="max-w-md">
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
                  />
                </div>
                
                {newGoalType === 'global' && (
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
                )}
                
                {newGoalType === 'strategic' && (
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
                )}
                
                {newGoalType === 'strategic' && (
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
                )}
                
                <Button onClick={handleAddGoal}>Добавить цель</Button>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {balanceAnalysis || 'Анализ влияния целей на баланс по сферам жизни.'}
            </p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={handleAnalyzeBalance}
              disabled={isAnalyzingBalance}
            >
              {isAnalyzingBalance ? 'Анализ...' : 'Оценить влияние'}
            </Button>
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
            <Button variant="outline" className="mt-2">Просмотреть историю</Button>
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
    </div>
  );
};

export default Goals;