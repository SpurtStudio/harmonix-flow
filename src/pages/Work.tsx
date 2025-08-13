import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import HelpTooltip from '@/components/HelpTooltip';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto';
import { db } from '@/lib/db';

// Функция для расчета метрик работы на основе данных из базы
const calculateWorkMetrics = async () => {
  try {
    // Получаем все глобальные цели, связанные с работой
    const workGoals = await db.globalGoals
      .filter(goal => goal.lifeSphere === 'Работа')
      .toArray();
    
    // Получаем все стратегические цели, связанные с рабочими глобальными целями
    const workStrategicGoalIds = workGoals
      .map(goal => goal.strategicGoalIds || [])
      .flat();
    
    const workStrategicGoals = await db.strategicGoals
      .where('id')
      .anyOf(workStrategicGoalIds)
      .toArray();
    
    // Получаем все проекты, связанные с рабочими стратегическими целями
    const workProjectIds = workStrategicGoals
      .map(goal => goal.projectIds || [])
      .flat();
    
    const workProjects = await db.projects
      .where('id')
      .anyOf(workProjectIds)
      .toArray();
    
    // Получаем все задачи, связанные с рабочими проектами
    const workTaskIds = workProjects
      .map(project => project.taskIds || [])
      .flat();
    
    const workTasks = await db.tasks
      .where('id')
      .anyOf(workTaskIds)
      .toArray();
    
    // Рассчитываем метрики
    // 1. Производительность (прогресс по задачам)
    const completedTasks = workTasks.filter(task => task.status === 'completed').length;
    const totalTasks = workTasks.length;
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 2. Выполнение задач (выполненные/всего)
    const taskCompletion = `${completedTasks}/${totalTasks}`;
    
    // 3. Вовлеченность (средний приоритет задач)
    const priorityValues: Record<string, number> = {
      'critical-urgent': 4,
      'important-not-urgent': 3,
      'not-important-urgent': 2,
      'not-important-not-urgent': 1
    };
    
    const totalPriorityScore = workTasks.reduce((sum, task) => {
      return sum + (priorityValues[task.priority] || 0);
    }, 0);
    
    const avgPriorityScore = workTasks.length > 0 ? totalPriorityScore / workTasks.length : 0;
    const engagement = Math.round((avgPriorityScore / 4) * 100); // Нормализуем до 100%
    
    // 4. Обратная связь (средняя оценка из журнала)
    // Для упрощения используем фиксированное значение
    const feedback = '4.2/5';
    
    return [
      { title: 'Производительность', value: `${productivity}%`, target: 90, trend: 'neutral' },
      { title: 'Выполнение задач', value: taskCompletion, target: 95, trend: 'neutral' },
      { title: 'Вовлеченность', value: `${engagement}%`, target: 85, trend: 'neutral' },
      { title: 'Обратная связь', value: feedback, target: 4.5, trend: 'neutral' },
    ];
  } catch (error) {
    console.error('Ошибка расчета метрик работы:', error);
    // Резервные данные при ошибке
    return [
      { title: 'Производительность', value: '0%', target: 90, trend: 'neutral' },
      { title: 'Выполнение задач', value: '0/0', target: 95, trend: 'neutral' },
      { title: 'Вовлеченность', value: '0%', target: 85, trend: 'neutral' },
      { title: 'Обратная связь', value: '0/5', target: 4.5, trend: 'neutral' },
    ];
  }
};

const WorkMetricsDashboard = () => {
  const [metrics, setMetrics] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await calculateWorkMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Ошибка загрузки метрик:', error);
        // Резервные данные при ошибке
        setMetrics([
          { title: 'Производительность', value: '0%', target: 90, trend: 'neutral' },
          { title: 'Выполнение задач', value: '0/0', target: 95, trend: 'neutral' },
          { title: 'Вовлеченность', value: '0%', target: 85, trend: 'neutral' },
          { title: 'Обратная связь', value: '0/5', target: 4.5, trend: 'neutral' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="h-6 bg-gray-200 rounded w-3/4"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              {metric.title}
              <HelpTooltip content={`Целевой показатель: ${metric.target}${metric.title === 'Обратная связь' ? '' : '%'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <Progress
              value={
                metric.title === 'Обратная связь' || metric.title === 'Выполнение задач'
                  ? (() => {
                      const [current, target] = metric.value.split('/').map(Number);
                      if (target === 0) return 0;
                      return (current / target) * 100;
                    })()
                  : parseFloat(metric.value)
              }
              className="mt-2"
            />
            
            {/* Add trend indicator */}
            {metric.trend !== 'neutral' && (
              <div className="mt-1 text-xs flex items-center">
                {metric.trend === 'up' ? (
                  <span className="text-green-500">↑ Улучшение</span>
                ) : (
                  <span className="text-red-500">↓ Снижение</span>
                )}
                <span className="ml-2 text-muted-foreground">
                  {metric.trend === 'up' ? '+' : ''}{metric.change}% за неделю
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const CareerProgressPanel = () => {
  const [chartData, setChartData] = React.useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      borderDash?: number[];
    }[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadChartData = async () => {
      try {
        // Загрузка реальных данных карьерного роста из базы данных
        // Для упрощения используем фиктивные данные
        const data = {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          datasets: [
            { 
              label: 'Уровень навыков', 
              data: [65, 67, 70, 72, 75, 78], 
              borderColor: 'rgb(59, 130, 246)' 
            },
            { 
              label: 'Целевые показатели', 
              data: [60, 65, 70, 75, 80, 85], 
              borderColor: 'rgb(34, 197, 94)', 
              borderDash: [5,5] 
            }
          ]
        };
        setChartData(data);
      } catch (error) {
        console.error('Ошибка загрузки данных карьеры:', error);
        // Резервные данные при ошибке
        setChartData({
          labels: [],
          datasets: [
            { label: 'Уровень навыков', data: [], borderColor: 'rgb(59, 130, 246)' },
            { label: 'Целевые показатели', data: [], borderColor: 'rgb(34, 197, 94)', borderDash: [5,5] }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Прогресс карьерного роста',
      },
    },
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          Прогресс карьеры
          <HelpTooltip content="Отслеживание вашего профессионального роста по сравнению с поставленными целями" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData && chartData.labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-center py-10 text-gray-500">Нет данных для отображения</p>
        )}
      </CardContent>
    </Card>
  );
};

const WorkLifeBalanceWidget = () => {
  const [balanceData, setBalanceData] = React.useState({
    workloadIndex: 0,
    recoveryScore: 0,
    workHours: 0,
    leisureHours: 0,
    overtimeHours: 0,
    stressLevel: 0,
    energyLevel: 0
  });
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const calculateBalance = async () => {
      try {
        // Загрузка данных для расчета баланса из базы данных
        // Для упрощения используем фиктивные данные
        const data = {
          workloadIndex: 75,
          recoveryScore: 60,
          workHours: 9,
          leisureHours: 3,
          overtimeHours: 1,
          stressLevel: 4,
          energyLevel: 5
        };
        setBalanceData(data);
      } catch (error) {
        console.error('Ошибка расчета баланса:', error);
        setBalanceData({
          workloadIndex: 50,
          recoveryScore: 50,
          workHours: 8,
          leisureHours: 2,
          overtimeHours: 1,
          stressLevel: 3,
          energyLevel: 6
        });
      } finally {
        setLoading(false);
      }
    };
    
    calculateBalance();
  }, []);
  
  const getWorkloadStatus = (value: number) => {
    if (value < 40) return 'Низкая';
    if (value < 70) return 'Оптимальная';
    if (value < 90) return 'Высокая';
    return 'Критическая';
  };
  
  const getRecoveryStatus = (value: number) => {
    if (value < 30) return 'Недостаточное';
    if (value < 60) return 'Удовлетворительное';
    if (value < 80) return 'Хорошее';
    return 'Отличное';
  };
  
  const getBalanceQuality = (workload: number, recovery: number) => {
    const diff = Math.abs(workload - recovery);
    if (diff < 20) return 'Сбалансированный';
    if (workload > recovery) return 'Переработка';
    return 'Недогрузка';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Баланс работа/отдых
          <HelpTooltip content="Анализ соотношения рабочего времени и отдыха, а также их влияния на ваше самочувствие" />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Индекс нагрузки</span>
            <span className={`font-bold ${
              balanceData.workloadIndex > 80 ? 'text-red-500' :
              balanceData.workloadIndex > 60 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {getWorkloadStatus(balanceData.workloadIndex)}
            </span>
          </div>
          <Progress value={balanceData.workloadIndex} className="h-3" />
          <div className="text-sm text-muted-foreground mt-2 grid grid-cols-2 gap-2">
            <div>Рабочие часы: <span className="font-medium">{balanceData.workHours}ч</span></div>
            <div>Переработка: <span className="font-medium">{balanceData.overtimeHours}ч</span></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Эффективность отдыха</span>
            <span className={`font-bold ${
              balanceData.recoveryScore < 40 ? 'text-red-500' :
              balanceData.recoveryScore < 60 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {getRecoveryStatus(balanceData.recoveryScore)}
            </span>
          </div>
          <Progress value={balanceData.recoveryScore} className="h-3" />
          <div className="text-sm text-muted-foreground mt-2 grid grid-cols-2 gap-2">
            <div>Отдых: <span className="font-medium">{balanceData.leisureHours}ч</span></div>
            <div>Энергия: <span className="font-medium">{balanceData.energyLevel}/10</span></div>
          </div>
        </div>
        
        <div className="md:col-span-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Качество баланса</span>
            <span className="font-bold text-blue-600">
              {getBalanceQuality(balanceData.workloadIndex, balanceData.recoveryScore)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Уровень стресса:</span>
                <span className="font-medium">{balanceData.stressLevel}/10</span>
              </div>
              <Progress value={balanceData.stressLevel * 10} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Связь с отдыхом:</span>
                <span className="font-medium">
                  {balanceData.leisureHours > 3 ? 'Сильная' : balanceData.leisureHours > 1 ? 'Умеренная' : 'Слабая'}
                </span>
              </div>
              <Progress value={Math.min(100, balanceData.leisureHours * 25)} className="h-2 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkPage = () => {
  const [goals, setGoals] = React.useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = React.useState(true);
  const [careerHistory, setCareerHistory] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка профессиональных целей из базы данных
        const workGoals = await db.globalGoals
          .filter(goal => goal.lifeSphere === 'Работа')
          .toArray();
        
        // Преобразуем данные для отображения
        const goalsData = workGoals.map(goal => ({
          title: goal.name,
          description: goal.smartFormulation,
          progress: goal.progress,
          deadline: null // В реальной реализации можно добавить дедлайн
        }));
        
        setGoals(goalsData);
        
        // Загрузка исторических данных из базы данных
        // Для упрощения используем фиктивные данные
        const historyData = [
          {
            title: 'Повышение до руководителя отдела',
            date: '2023-06-15',
            description: 'Получил повышение благодаря успешному завершению проекта по оптимизации процессов.',
            impact: 'Повышение зарплаты на 20%'
          },
          {
            title: 'Завершение ключевого проекта',
            date: '2023-03-20',
            description: 'Успешно завершил проект по автоматизации отчетности, что сэкономило компании 100 часов в месяц.',
            impact: 'Признание руководства'
          },
          {
            title: 'Получение сертификации',
            date: '2022-11-10',
            description: 'Прошел курс по управлению проектами и получил сертификат PMP.',
            impact: 'Расширение профессиональных навыков'
          }
        ];
        
        setCareerHistory(historyData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setGoalsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Профессиональная сфера</h1>
        <p className="text-muted-foreground">
          Анализ вашей рабочей деятельности, карьерного роста и баланса с личной жизнью
        </p>
      </div>
      
      <WorkMetricsDashboard />
      <CareerProgressPanel />
      <WorkLifeBalanceWidget />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Профессиональные цели с историческим контекстом */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Профессиональные цели
              <HelpTooltip content="Цели, связанные с вашей карьерой и профессиональным развитием" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium h-6 bg-gray-200 rounded w-48 animate-pulse"></h3>
                      <p className="text-sm text-muted-foreground h-4 bg-gray-200 rounded w-64 mt-1 animate-pulse"></p>
                    </div>
                    <Progress value={0} className="w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">Нет активных профессиональных целей</p>
                ) : (
                  goals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="mt-1 text-xs text-blue-600">
                          {goal.deadline && `Дедлайн: ${new Date(goal.deadline).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <Progress value={goal.progress} className="w-full" />
                        <div className="text-sm mt-1">{goal.progress}%</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Исторический контекст карьеры */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Исторический контекст
              <HelpTooltip content="Ключевые события вашей профессиональной истории" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {careerHistory.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">Нет данных в историческом контексте</p>
                ) : (
                  careerHistory.map((item, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.title}</h3>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                        {item.impact}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkPage;
