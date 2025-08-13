import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { db, FamilyMember } from '../lib/db';

// Тип для узла генеалогического древа
interface FamilyTreeNode {
  id: string;
  name: string;
  relationship: string;
  photoUrl?: string;
  notes?: string;
  children: FamilyTreeNode[];
}

const FamilyTree: React.FC = () => {
  const [familyTree, setFamilyTree] = useState<FamilyTreeNode[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    parentId: '',
    photoUrl: '',
    notes: ''
  });

  // Загрузка данных о членах семьи
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        const loadedMembers = await db.familyMembers.toArray();
        setFamilyMembers(loadedMembers);
        // Построение генеалогического древа из плоского списка
        buildFamilyTree(loadedMembers);
      } catch (error) {
        console.error('Ошибка при загрузке семейных данных:', error);
      }
    };
    loadFamilyData();
  }, []);

  // Построение генеалогического древа из плоского списка
  const buildFamilyTree = (members: FamilyMember[]) => {
    // В текущей реализации у нас нет явных связей родитель-ребенок,
    // поэтому мы создаем простую структуру с одним корнем
    // В будущем можно расширить модель FamilyMember для хранения связей
    
    const rootNode: FamilyTreeNode = {
      id: 'root',
      name: 'Семейное древо',
      relationship: 'root',
      children: members.map(member => ({
        id: member.id?.toString() || '',
        name: member.name,
        relationship: member.relationship,
        photoUrl: member.photoUrl,
        notes: member.notes,
        children: []
      }))
    };
    
    setFamilyTree([rootNode]);
  };

  // Обработчик открытия диалога добавления члена семьи
  const handleOpenAddDialog = () => {
    setNewMember({
      name: '',
      relationship: '',
      parentId: '',
      photoUrl: '',
      notes: ''
    });
    setIsAddDialogOpen(true);
  };

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик выбора родителя
  const handleParentChange = (value: string) => {
    setNewMember(prev => ({ ...prev, parentId: value }));
  };

  // Обработчик добавления нового члена семьи
  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.relationship.trim()) {
      alert('Имя и отношение не могут быть пустыми.');
      return;
    }
    
    try {
      const memberId = await db.familyMembers.add({
        name: newMember.name,
        relationship: newMember.relationship,
        photoUrl: newMember.photoUrl || undefined,
        notes: newMember.notes || undefined
      });
      
      // Обновление списка членов семьи
      const loadedMembers = await db.familyMembers.toArray();
      setFamilyMembers(loadedMembers);
      buildFamilyTree(loadedMembers);
      
      // Закрытие диалога
      setIsAddDialogOpen(false);
      
      alert('Член семьи добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении члена семьи:', error);
      alert('Ошибка при добавлении члена семьи.');
    }
  };

  // Рекурсивный рендер узлов генеалогического древа
  const renderTreeNode = (node: FamilyTreeNode) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-16 h-16 mb-2">
            <AvatarImage src={node.photoUrl} alt={node.name} />
            <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold">{node.name}</p>
            <p className="text-sm text-gray-500">{node.relationship}</p>
          </div>
        </div>
        
        {node.children.length > 0 && (
          <div className="flex justify-center space-x-8 mt-4">
            {node.children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-8 bg-gray-300"></div>
                {renderTreeNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Генеалогическое древо</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>Добавить члена семьи</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить члена семьи</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                name="name"
                placeholder="Имя"
                value={newMember.name}
                onChange={handleInputChange}
              />
              <Input
                name="relationship"
                placeholder="Отношение (например, 'Мать', 'Друг')"
                value={newMember.relationship}
                onChange={handleInputChange}
              />
              <Select onValueChange={handleParentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родителя (опционально)" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map(member => (
                    <SelectItem key={member.id} value={member.id?.toString() || ''}>
                      {member.name} ({member.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="photoUrl"
                placeholder="URL фото (опционально)"
                value={newMember.photoUrl}
                onChange={handleInputChange}
              />
              <Textarea
                name="notes"
                placeholder="Заметки (опционально)"
                value={newMember.notes}
                onChange={handleInputChange}
              />
              <Button onClick={handleAddMember}>Добавить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {familyTree.length > 0 ? (
          <div className="flex justify-center overflow-x-auto py-4">
            {familyTree.map(node => renderTreeNode(node))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            Пока нет данных для отображения генеалогического древа. Добавьте первого члена семьи!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyTree;