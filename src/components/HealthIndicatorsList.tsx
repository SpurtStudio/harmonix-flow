import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { HealthIndicator } from '../lib/db';

interface HealthIndicatorsListProps {
  indicators: HealthIndicator[];
  onDeleteIndicator: (id: number) => void;
}

export const HealthIndicatorsList: React.FC<HealthIndicatorsListProps> = ({ indicators, onDeleteIndicator }) => {
  // Группируем показатели по названию
  const groupedIndicators: Record<string, HealthIndicator[]> = {};
  
  indicators.forEach(indicator => {
    if (!groupedIndicators[indicator.name]) {
      groupedIndicators[indicator.name] = [];
    }
    groupedIndicators[indicator.name].push(indicator);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Показатели здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedIndicators).length === 0 ? (
          <p className="text-gray-500">Нет данных о показателях здоровья.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedIndicators).map(([name, indicators]) => (
              <div key={name} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-2 capitalize">
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
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {indicators.map(indicator => (
                    <div key={indicator.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-2xl font-bold">{indicator.value} <span className="text-sm font-normal">{indicator.unit}</span></p>
                          <p className="text-xs text-gray-500">{new Date(indicator.timestamp).toLocaleString()}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => indicator.id && onDeleteIndicator(indicator.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
