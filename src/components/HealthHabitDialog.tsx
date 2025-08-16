import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { db, Habit } from '../lib/db';

interface HealthHabitDialogProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id'> | Habit) => void;
}

export const HealthHabitDialog: React.FC<HealthHabitDialogProps> = ({ habit, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [alternatingEnabled, setAlternatingEnabled] = useState(false);
  const [alternatingPattern, setAlternatingPattern] = useState<string[]>(['work', 'rest']);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setReminderTime(habit.reminderTime || '');
      setReminderEnabled(habit.reminderEnabled || false);
      setAlternatingEnabled(habit.alternatingEnabled || false);
      setAlternatingPattern(habit.alternatingPattern || ['work', 'rest']);
    } else {
      // Сброс значений при создании новой привычки
      setName('');
      setDescription('');
      setFrequency('daily');
      setReminderTime('');
      setReminderEnabled(false);
      setAlternatingEnabled(false);
      setAlternatingPattern(['work', 'rest']);
    }
  }, [habit, isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      const habitData = {
        name,
        description,
        frequency,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        reminderEnabled,
        alternatingEnabled,
        alternatingPattern: alternatingEnabled ? alternatingPattern : undefined,
        progress: habit?.progress || 0,
        streak: habit?.streak || 0,
        bestStreak: habit?.bestStreak || 0
      };

      if (habit && habit.id) {
        // Редактирование существующей привычки
        onSave({ ...habitData, id: habit.id });
      } else {
        // Создание новой привычки
        onSave(habitData);
      }
      
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habit?.id ? 'Редактировать привычку здоровья' : 'Добавить привычку здоровья'}</DialogTitle>
          <DialogDescription>
            {habit?.id
              ? 'Измените информацию о привычке здоровья.'
              : 'Заполните информацию о новой привычке здоровья.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Например, Утренняя зарядка"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Опишите привычку..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Частота
            </Label>
            <Select onValueChange={setFrequency} value={frequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите частоту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Ежедневно</SelectItem>
                <SelectItem value="weekly">Еженедельно</SelectItem>
                <SelectItem value="monthly">Ежемесячно</SelectItem>
              </SelectContent>
            </Select>
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