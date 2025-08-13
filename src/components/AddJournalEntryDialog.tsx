import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AddJournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<import('@/lib/db').JournalEntry, 'id'>) => void | Promise<void>;
}

const AddJournalEntryDialog: React.FC<AddJournalEntryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16)); // Default to current date/time

  const handleSave = () => {
    onSave({
      timestamp: new Date(timestamp),
      text,
      psychologicalState: 0, // Default values
      emotionalState: 0,
      physicalState: 0,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить новую запись в дневник</DialogTitle>
          <DialogDescription>
            Введите текст вашей записи в дневник здесь. Нажмите сохранить, когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text" className="text-right">
              Содержание
            </Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timestamp" className="text-right">
              Дата и время
            </Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddJournalEntryDialog;