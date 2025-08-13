import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProtectedTimeBlock {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'rest' | 'family' | 'work' | 'personal';
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface EditProtectedBlockDialogProps {
  block: ProtectedTimeBlock;
  onSave: (block: ProtectedTimeBlock) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const EditProtectedBlockDialog: React.FC<EditProtectedBlockDialogProps> = ({ block, onSave, onDelete, onClose, isOpen }) => {
  const [title, setTitle] = useState(block.title);
  const [start, setStart] = useState(block.start.toISOString().slice(0, 16));
  const [end, setEnd] = useState(block.end.toISOString().slice(0, 16));
  const [type, setType] = useState(block.type);
  const [color, setColor] = useState(block.color || '#3B82F6');
  const [isRecurring, setIsRecurring] = useState(block.isRecurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(block.recurrencePattern || 'ежедневно');

  useEffect(() => {
    setTitle(block.title);
    setStart(block.start.toISOString().slice(0, 16));
    setEnd(block.end.toISOString().slice(0, 16));
    setType(block.type);
    setColor(block.color || '#3B82F6');
    setIsRecurring(block.isRecurring || false);
    setRecurrencePattern(block.recurrencePattern || 'ежедневно');
  }, [block]);

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
      ...block,
      title,
      start: startDate,
      end: endDate,
      type,
      color,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined
    });
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот защищенный блок?')) {
      onDelete(block.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать защищенный блок времени</DialogTitle>
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
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Удалить
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProtectedBlockDialog;