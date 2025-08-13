import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProtectedTimeBlock {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  type: 'rest' | 'family' | 'work' | 'personal';
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface AddProtectedBlockDialogProps {
  onSave: (block: Omit<ProtectedTimeBlock, 'id'>) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const AddProtectedBlockDialog: React.FC<AddProtectedBlockDialogProps> = ({ onSave, onClose, isOpen }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState<'rest' | 'family' | 'work' | 'personal'>('personal');
  const [color, setColor] = useState('#3B82F6'); // Синий по умолчанию
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('ежедневно');

  const handleSave = () => {
    if (!title.trim() || !start || !end) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      alert('Время начала должно быть раньше времени окончания.');
      return;
    }

    onSave({
      title,
      start: startDate,
      end: endDate,
      type,
      color,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined
    });
    
    // Сброс формы
    setTitle('');
    setStart('');
    setEnd('');
    setType('personal');
    setColor('#3B82F6');
    setIsRecurring(false);
    setRecurrencePattern('ежедневно');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить защищенный блок времени</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Название *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Введите название блока"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Начало *
            </Label>
            <Input
              id="start"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              Окончание *
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Тип
            </Label>
            <Select onValueChange={(value) => setType(value as any)} value={type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Личное</SelectItem>
                <SelectItem value="family">Семья</SelectItem>
                <SelectItem value="work">Работа</SelectItem>
                <SelectItem value="rest">Отдых</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Цвет
            </Label>
            <div className="col-span-3 flex items-center">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <span className="ml-2">{color}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isRecurring" className="text-right">
              Повторяющийся
            </Label>
            <div className="col-span-3">
              <input
                id="isRecurring"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5"
              />
            </div>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recurrencePattern" className="text-right">
                Повторение
              </Label>
              <Select onValueChange={setRecurrencePattern} value={recurrencePattern}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите паттерн" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ежедневно">Ежедневно</SelectItem>
                  <SelectItem value="по будням">По будням</SelectItem>
                  <SelectItem value="по выходным">По выходным</SelectItem>
                  <SelectItem value="еженедельно">Еженедельно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Добавить блок</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProtectedBlockDialog;