import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<import('@/lib/db').Task, 'id' | 'status'>) => void | Promise<void>;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [contextPlace, setContextPlace] = useState('');
  const [contextTool, setContextTool] = useState('');
  const [contextEnergy, setContextEnergy] = useState('');

  const handleSave = () => {
    onSave({
      name,
      description,
      priority: priority as 'Urgent-Important' | 'NotUrgent-Important' | 'Urgent-NotImportant' | 'NotUrgent-NotImportant',
      context: {
        place: contextPlace,
        tool: contextTool,
        energy: contextEnergy,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить новую задачу</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Приоритет
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Высокий">Высокий</SelectItem>
                <SelectItem value="Средний">Средний</SelectItem>
                <SelectItem value="Низкий">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contextPlace" className="text-right">
              Место
            </Label>
            <Input id="contextPlace" value={contextPlace} onChange={(e) => setContextPlace(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contextTool" className="text-right">
              Инструмент
            </Label>
            <Input id="contextTool" value={contextTool} onChange={(e) => setContextTool(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contextEnergy" className="text-right">
              Энергия
            </Label>
            <Input id="contextEnergy" value={contextEnergy} onChange={(e) => setContextEnergy(e.target.value)} className="col-span-3" />
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

export default AddTaskDialog;