import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { db, HealthIndicator } from '../lib/db';

interface HealthIndicatorFormProps {
  onAddIndicator: (indicator: Omit<HealthIndicator, 'id'>) => void;
}

export const HealthIndicatorForm: React.FC<HealthIndicatorFormProps> = ({ onAddIndicator }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !value || !unit) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    const indicator: Omit<HealthIndicator, 'id'> = {
      name,
      value: parseFloat(value),
      unit,
      timestamp: new Date()
    };
    
    onAddIndicator(indicator);
    
    // Сброс формы
    setName('');
    setValue('');
    setUnit('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить показатель здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название показателя</Label>
            <Select onValueChange={setName} value={name}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите показатель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Вес (кг)</SelectItem>
                <SelectItem value="height">Рост (см)</SelectItem>
                <SelectItem value="bloodPressureSystolic">Артериальное давление (систолическое)</SelectItem>
                <SelectItem value="bloodPressureDiastolic">Артериальное давление (диастолическое)</SelectItem>
                <SelectItem value="heartRate">Пульс (уд/мин)</SelectItem>
                <SelectItem value="stressLevel">Уровень стресса (1-10)</SelectItem>
                <SelectItem value="sleepHours">Сон (часы)</SelectItem>
                <SelectItem value="waterIntake">Потребление воды (л)</SelectItem>
                <SelectItem value="steps">Шаги</SelectItem>
                <SelectItem value="calories">Калории</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Значение</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Единица измерения</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Введите единицу измерения"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Добавить показатель
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};