import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Habit } from '../lib/db';
import { HealthHabitDialog } from './HealthHabitDialog';

interface HealthHabitsListProps {
  habits: Habit[];
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: number | string) => void;
  onIncrementProgress: (habitId: number | string, increment: number) => void;
  onResetProgress: (habitId: number | string) => void;
}

export const HealthHabitsList: React.FC<HealthHabitsListProps> = ({
  habits,
  onEditHabit,
  onDeleteHabit,
  onIncrementProgress,
  onResetProgress
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedHabit, setSelectedHabit] = React.useState<Habit | null>(null);

  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedHabit(null);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Привычки здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={handleAddNew}>Добавить привычку</Button>
        </div>
        
        {habits.length === 0 ? (
          <p className="text-gray-500">У вас пока нет привычек здоровья. Добавьте первую!</p>
        ) : (
          <ul className="space-y-4">
            {habits.map(habit => (
              <li key={habit.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                    <p className="text-sm text-gray-400">{habit.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Частота: {habit.frequency}</p>
                    {habit.reminderEnabled && (
                      <p className="text-xs text-gray-500 mt-1">Напоминание: {habit.reminderTime}</p>
                    )}
                    {habit.alternatingEnabled && (
                      <p className="text-xs text-gray-500 mt-1">Чередование: {habit.alternatingPattern?.join(' → ')}</p>
                    )}
                    {habit.streak !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">Серия: {habit.streak} (лучшая: {habit.bestStreak || 0})</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => habit.id && onIncrementProgress(habit.id, 10)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      +10%
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => habit.id && onResetProgress(habit.id)}
                      variant="destructive"
                    >
                      Сброс
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => habit.id && handleEdit(habit)}
                      variant="outline"
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => habit.id && onDeleteHabit(habit.id)}
                      variant="destructive"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Прогресс</span>
                    <span>{habit.progress || 0}%</span>
                  </div>
                  <Progress value={habit.progress || 0} className="w-full" />
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <HealthHabitDialog
          habit={selectedHabit}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={onEditHabit}
        />
      </CardContent>
    </Card>
  );
};
