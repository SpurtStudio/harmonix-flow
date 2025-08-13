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
import { Textarea } from '@/components/ui/textarea';

interface JournalEntry {
  id?: number | string;
  timestamp: Date;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  psychologicalState: number;
  emotionalState: number;
  physicalState: number;
  linkedVisionId?: number;
  linkedGlobalGoalIds?: number[];
  linkedStrategicGoalIds?: number[];
  linkedProjectIds?: number[];
  linkedSubProjectLevel1Ids?: number[];
  linkedSubProjectLevel2Ids?: number[];
  linkedTaskIds?: number[];
  linkedSubTaskIds?: number[];
  formedIdeaIds?: number[];
}

interface ViewEditJournalEntryDialogProps {
  isOpen: boolean;
  journalEntry: JournalEntry;
  onSave: (entry: JournalEntry) => void | Promise<void>;
  onClose: () => void;
}

export const ViewEditJournalEntryDialog: React.FC<ViewEditJournalEntryDialogProps> = ({
  isOpen,
  journalEntry,
  onSave,
  onClose,
}) => {
  const [editedEntry, setEditedEntry] = useState<JournalEntry>(journalEntry);

  useEffect(() => {
    setEditedEntry(journalEntry);
  }, [journalEntry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'timestamp') {
      setEditedEntry((prev) => ({ ...prev, [name]: new Date(value) }));
    } else {
      setEditedEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSave(editedEntry);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Просмотр и редактирование записи дневника</DialogTitle>
          <DialogDescription>
            Внесите изменения в запись дневника здесь. Нажмите сохранить, когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text" className="text-right">
              Содержание
            </Label>
            <Textarea
              id="text"
              name="text"
              value={editedEntry.text}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timestamp" className="text-right">
              Дата
            </Label>
            <Input
              id="timestamp"
              name="timestamp"
              type="datetime-local"
              value={editedEntry.timestamp.toISOString().slice(0, 16)} // Format date for input type="datetime-local"
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};