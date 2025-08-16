import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hobby } from '@/lib/db';

interface EditHobbyDialogProps {
  hobby: Hobby | null;
  onSave: (hobby: Hobby) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const EditHobbyDialog: React.FC<EditHobbyDialogProps> = ({ hobby, onSave, onClose, isOpen }) => {
  const [currentHobby, setCurrentHobby] = useState<Hobby | null>(hobby);
  const [reminderTime, setReminderTime] = useState(hobby?.reminderTime || '');
  const [reminderEnabled, setReminderEnabled] = useState(hobby?.reminderEnabled || false);

  useEffect(() => {
    setCurrentHobby(hobby);
    if (hobby) {
      setReminderTime(hobby.reminderTime || '');
      setReminderEnabled(hobby.reminderEnabled || false);
    }
  }, [hobby]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentHobby(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (currentHobby) {
      const updatedHobby = {
        ...currentHobby,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        reminderEnabled,
      };
      onSave(updatedHobby);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentHobby?.id ? 'Редактировать хобби' : 'Создать хобби'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input
              id="name"
              name="name"
              value={currentHobby?.name || ''}
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
              value={currentHobby?.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Категория
            </Label>
            <Input
              id="category"
              name="category"
              value={currentHobby?.category || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Цель
            </Label>
            <Input
              id="goal"
              name="goal"
              value={currentHobby?.goal || ''}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Например: Научиться играть 3 песни на гитаре"
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
          {currentHobby?.goalProgress !== undefined && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Прогресс</Label>
              <div className="col-span-3">
                <p>{currentHobby.goalProgress}%</p>
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