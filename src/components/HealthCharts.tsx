import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { db, HealthIndicator } from '../lib/db';

// Компонент для отображения линейного графика
const LineChart: React.FC<{ data: { date: string; value: number }[]; title: string }> = ({ data, title }) => {
  if (data.length === 0) return <div>Нет данных для отображения</div>;

  // Определяем минимальное и максимальное значения для масштабирования
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Избегаем деления на ноль

  return (
    <div className="w-full h-64 relative">
      <h3 className="text-center mb-2">{title}</h3>
      <div className="absolute inset-0 flex items-end">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 90 + 10; // Процент высоты (10-100%)
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center mx-px"
              style={{ height: '100%' }}
            >
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {point.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { LineChart, PieChart };

// Компонент для отображения круговой диаграммы
const PieChart: React.FC<{ data: { name: string; value: number }[]; title: string }> = ({ data, title }) => {
  if (data.length === 0) return <div>Нет данных для отображения</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-center mb-2">{title}</h3>
      <div className="relative w-48 h-48">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const strokeColor = `hsl(${index * 60}, 70%, 50%)`; // Разные цвета для сегментов

          // Создаем SVG path для сегмента круговой диаграммы
          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;

          startAngle += angle;

          return (
            <svg key={index} viewBox="0 0 100 100" className="absolute inset-0">
              <path d={pathData} fill={strokeColor} />
            </svg>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-gray-500">Всего</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const color = `hsl(${index * 60}, 70%, 50%)`;
          return (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></div>
              <span className="text-sm">{item.name}: {item.value} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HealthCharts: React.FC = () => {
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
      
      // Установим первый показатель по умолчанию
      if (loadedIndicators.length > 0 && !selectedIndicator) {
        setSelectedIndicator(loadedIndicators[0].name);
      }
    } catch (error) {
      console.error('Ошибка при загрузке показателей здоровья:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получаем уникальные названия показателей
  const indicatorNames = Array.from(new Set(indicators.map(i => i.name)));

  // Фильтруем данные по выбранному показателю и временному диапазону
  const filteredData = indicators.filter(i => i.name === selectedIndicator);
  
  // Ограничиваем данные по временному диапазону
  const timeFilteredData = filteredData.filter(indicator => {
    const now = new Date();
    const indicatorDate = new Date(indicator.timestamp);
    
    switch (timeRange) {
      case 'week':
        return (now.getTime() - indicatorDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      case 'month':
        return (now.getTime() - indicatorDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      case 'year':
        return (now.getTime() - indicatorDate.getTime()) / (1000 * 60 * 60 * 24) <= 365;
      default:
        return true;
    }
  });

  // Подготавливаем данные для линейного графика
  const lineChartData = timeFilteredData
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(indicator => ({
      date: new Date(indicator.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      value: indicator.value
    }));

  // Подготавливаем данные для круговой диаграммы (например, распределение по диапазонам значений)
  const pieChartData = (() => {
    if (timeFilteredData.length === 0) return [];
    
    const values = timeFilteredData.map(i => i.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Определяем диапазоны
    const low = timeFilteredData.filter(i => i.value < min + range * 0.33).length;
    const medium = timeFilteredData.filter(i => i.value >= min + range * 0.33 && i.value < min + range * 0.66).length;
    const high = timeFilteredData.filter(i => i.value >= min + range * 0.66).length;
    
    return [
      { name: 'Низкий', value: low },
      { name: 'Средний', value: medium },
      { name: 'Высокий', value: high }
    ];
  })();

  if (loading) {
    return <div className="p-4">Загрузка графиков...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Визуализация данных о здоровье</CardTitle>
      </CardHeader>
      <CardContent>
        {indicators.length === 0 ? (
          <p className="text-gray-500">Нет данных для визуализации.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">Показатель</label>
                <Select onValueChange={setSelectedIndicator} value={selectedIndicator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите показатель" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicatorNames.map(name => (
                      <SelectItem key={name} value={name}>
                        {name === 'weight' && 'Вес'}
                        {name === 'height' && 'Рост'}
                        {name === 'bloodPressureSystolic' && 'Артериальное давление (систолическое)'}
                        {name === 'bloodPressureDiastolic' && 'Артериальное давление (диастолическое)'}
                        {name === 'heartRate' && 'Пульс'}
                        {name === 'stressLevel' && 'Уровень стресса'}
                        {name === 'sleepHours' && 'Сон'}
                        {name === 'waterIntake' && 'Потребление воды'}
                        {name === 'steps' && 'Шаги'}
                        {name === 'calories' && 'Калории'}
                        {!['weight', 'height', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate', 'stressLevel', 'sleepHours', 'waterIntake', 'steps', 'calories'].includes(name) && name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">Временной диапазон</label>
                <Select onValueChange={setTimeRange} value={timeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите диапазон" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                    <SelectItem value="all">Все время</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedIndicator && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <LineChart 
                      data={lineChartData} 
                      title={`Динамика: ${selectedIndicator === 'weight' ? 'Вес' : 
                        selectedIndicator === 'height' ? 'Рост' : 
                        selectedIndicator === 'bloodPressureSystolic' ? 'Артериальное давление (систолическое)' : 
                        selectedIndicator === 'bloodPressureDiastolic' ? 'Артериальное давление (диастолическое)' : 
                        selectedIndicator === 'heartRate' ? 'Пульс' : 
                        selectedIndicator === 'stressLevel' ? 'Уровень стресса' : 
                        selectedIndicator === 'sleepHours' ? 'Сон' : 
                        selectedIndicator === 'waterIntake' ? 'Потребление воды' : 
                        selectedIndicator === 'steps' ? 'Шаги' : 
                        selectedIndicator === 'calories' ? 'Калории' : selectedIndicator}`} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <PieChart 
                      data={pieChartData} 
                      title={`Распределение: ${selectedIndicator === 'weight' ? 'Вес' : 
                        selectedIndicator === 'height' ? 'Рост' : 
                        selectedIndicator === 'bloodPressureSystolic' ? 'Артериальное давление (систолическое)' : 
                        selectedIndicator === 'bloodPressureDiastolic' ? 'Артериальное давление (диастолическое)' : 
                        selectedIndicator === 'heartRate' ? 'Пульс' : 
                        selectedIndicator === 'stressLevel' ? 'Уровень стресса' : 
                        selectedIndicator === 'sleepHours' ? 'Сон' : 
                        selectedIndicator === 'waterIntake' ? 'Потребление воды' : 
                        selectedIndicator === 'steps' ? 'Шаги' : 
                        selectedIndicator === 'calories' ? 'Калории' : selectedIndicator}`} 
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};