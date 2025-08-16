import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Habit {
  id?: number | string;
  name: string;
  description: string;
  frequency?: string;
  progress?: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
  alternatingEnabled?: boolean;
  alternatingPattern?: string[];
  streak?: number;
  bestStreak?: number;
}

interface EditHabitDialogProps {
  habit: Habit | null;
  onSave: (habit: Habit) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const EditHabitDialog: React.FC<EditHabitDialogProps> = ({ habit, onSave, onClose }) => {
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(habit);
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '');
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminderEnabled || false);
  const [alternatingEnabled, setAlternatingEnabled] = useState(habit?.alternatingEnabled || false);
  const [alternatingPattern, setAlternatingPattern] = useState<string[]>(habit?.alternatingPattern || ['work', 'rest']);

  useEffect(() => {
    setCurrentHabit(habit);
    if (habit) {
      setReminderTime(habit.reminderTime || '');
      setReminderEnabled(habit.reminderEnabled || false);
      setAlternatingEnabled(habit.alternatingEnabled || false);
      setAlternatingPattern(habit.alternatingPattern || ['work', 'rest']);
    }
  }, [habit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentHabit(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (currentHabit) {
      const updatedHabit = {
        ...currentHabit,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        reminderEnabled,
        alternatingEnabled,
        alternatingPattern: alternatingEnabled ? alternatingPattern : undefined
      };
      onSave(updatedHabit);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentHabit?.id ? 'Редактировать привычку' : 'Создать привычку'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input
              id="name"
              name="name"
              value={currentHabit?.name || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание
            </Label>
            <Input
              id="description"
              name="description"
              value={currentHabit?.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder" className="text-right">
              Напоминания
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <input
                id="reminder"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              {reminderEnabled && (
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="ml-2"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alternating" className="text-right">
              Чередование
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <input
                id="alternating"
                type="checkbox"
                checked={alternatingEnabled}
                onChange={(e) => setAlternatingEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              {alternatingEnabled && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Паттерн 1"
                    value={alternatingPattern[0] || ''}
                    onChange={(e) => setAlternatingPattern(prev => [e.target.value, prev[1] || ''])}
                    className="ml-2"
                  />
                  <Input
                    placeholder="Паттерн 2"
                    value={alternatingPattern[1] || ''}
                    onChange={(e) => setAlternatingPattern(prev => [prev[0] || '', e.target.value])}
                    className="ml-2"
                  />
                </div>
              )}
            </div>
          </div>
          {currentHabit?.streak !== undefined && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Серия</Label>
              <div className="col-span-3">
                <p>Текущая: {currentHabit.streak}</p>
                <p>Лучшая: {currentHabit.bestStreak || 0}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};