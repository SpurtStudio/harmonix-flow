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
}

interface EditHabitDialogProps {
  habit: Habit | null;
  onSave: (habit: Habit) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const EditHabitDialog: React.FC<EditHabitDialogProps> = ({ habit, onSave, onClose }) => {
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(habit);

  useEffect(() => {
    setCurrentHabit(habit);
  }, [habit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentHabit(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (currentHabit) {
      onSave(currentHabit);
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