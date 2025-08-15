import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus } from 'lucide-react';

const Goals: React.FC = () => {
  const [vision, setVision] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Цели (OKR++) & Видение</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ваше Видение и Цели</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Опишите ваше видение на 10+ лет..."
            value={vision}
            onChange={(e) => setVision(e.target.value)}
          />
          <Button onClick={() => setIsAddingGoal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить цель
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новую цель</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Название цели"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <Textarea 
              placeholder="Описание цели"
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
            />
            <Button onClick={() => setIsAddingGoal(false)}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;