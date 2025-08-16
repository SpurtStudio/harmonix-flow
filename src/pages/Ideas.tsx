// src/pages/Ideas.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { db, Idea, GlobalGoal, Project, Task, JournalEntry } from '../lib/db'; // Импорт db и интерфейсов
import { useChangePropagation } from '../hooks/use-change-propagation'; // Для системы оперативных изменений
import { analyzeLocalData } from '../lib/ai'; // Для ИИ-анализа

const Ideas: React.FC = () => {
  const { propagateChange } = useChangePropagation();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goals, setGoals] = useState<GlobalGoal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newIdeaName, setNewIdeaName] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [newIdeaCategory, setNewIdeaCategory] = useState('');
  const [newIdeaLinkedGoalIds, setNewIdeaLinkedGoalIds] = useState<number[]>([]);
  const [newIdeaLinkedProjectIds, setNewIdeaLinkedProjectIds] = useState<number[]>([]);
  const [newIdeaLinkedTaskIds, setNewIdeaLinkedTaskIds] = useState<number[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isIdeaDetailOpen, setIsIdeaDetailOpen] = useState(false);
  const [cartesianSquare, setCartesianSquare] = useState({
    define: '',
    imagine: '',
    plan: '',
    act: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const loadedIdeas = await db.ideas.toArray();
        setIdeas(loadedIdeas);
      } catch (error) {
        console.error('Ошибка при загрузке идей:', error);
      }
    };
    
    const loadGoals = async () => {
      try {
        const loadedGoals = await db.globalGoals.toArray();
        setGoals(loadedGoals);
      } catch (error) {
        console.error('Ошибка при загрузке целей:', error);
      }
    };
    
    const loadProjects = async () => {
      try {
        const loadedProjects = await db.projects.toArray();
        setProjects(loadedProjects);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
      }
    };
    
    const loadTasks = async () => {
      try {
        const loadedTasks = await db.tasks.toArray();
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };
    
    const loadJournalEntries = async () => {
      try {
        const loadedEntries = await db.journalEntries.toArray();
        setJournalEntries(loadedEntries);
      } catch (error) {
        console.error('Ошибка при загрузке записей дневника:', error);
      }
    };
    
    loadIdeas();
    loadGoals();
    loadProjects();
    loadTasks();
    loadJournalEntries();
  }, []);

  const handleAddIdea = useCallback(async () => {
    if (!newIdeaName.trim()) {
      alert('Название идеи не может быть пустым.');
      return;
    }
    try {
      const newIdeaId = await db.ideas.add({
        name: newIdeaName,
        description: newIdeaDescription,
        tags: newIdeaTags,
        category: newIdeaCategory,
        linkedGoalIds: newIdeaLinkedGoalIds,
        linkedProjectIds: newIdeaLinkedProjectIds,
        linkedTaskIds: newIdeaLinkedTaskIds,
        status: 'active', // Начальный статус
      });
      
      setNewIdeaName('');
      setNewIdeaDescription('');
      setNewIdeaTags([]);
      setNewIdeaCategory('');
      setNewIdeaLinkedGoalIds([]);
      setNewIdeaLinkedProjectIds([]);
      setNewIdeaLinkedTaskIds([]);
      
      // Перезагружаем идеи после добавления
      const loadedIdeas = await db.ideas.toArray();
      setIdeas(loadedIdeas);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'idea_added',
        entityId: newIdeaId,
        oldValue: null,
        newValue: {
          name: newIdeaName,
          description: newIdeaDescription,
          tags: newIdeaTags,
          category: newIdeaCategory,
          linkedGoalIds: newIdeaLinkedGoalIds,
          linkedProjectIds: newIdeaLinkedProjectIds,
          linkedTaskIds: newIdeaLinkedTaskIds,
          status: 'active'
        }
      });
      
      console.log('Анализ влияния добавления идеи:', changeResult);
      alert('Идея добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении идеи:', error);
      alert('Ошибка при добавлении идеи.');
    }
  }, [newIdeaName, newIdeaDescription, newIdeaTags, newIdeaCategory, newIdeaLinkedGoalIds, newIdeaLinkedProjectIds, newIdeaLinkedTaskIds, propagateChange]);

  const handleIdeaStatusChange = useCallback(async (ideaId: number, newStatus: Idea['status']) => {
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) return;
      
      await db.ideas.update(ideaId, { status: newStatus });
      
      // Перезагружаем идеи после изменения
      const loadedIdeas = await db.ideas.toArray();
      setIdeas(loadedIdeas);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'idea_status_changed',
        entityId: ideaId,
        oldValue: idea.status,
        newValue: newStatus
      });
      
      console.log('Анализ влияния изменения статуса идеи:', changeResult);
    } catch (error) {
      console.error('Ошибка при изменении статуса идеи:', error);
      alert('Ошибка при изменении статуса идеи.');
    }
  }, [ideas, propagateChange]);

  const handleOpenIdeaDetail = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsIdeaDetailOpen(true);
    // Инициализируем квадрат Декарта данными идеи, если они есть
    if (idea.analysisResult) {
      try {
        const parsedResult = JSON.parse(idea.analysisResult);
        setCartesianSquare(parsedResult.cartesianSquare || {
          define: '',
          imagine: '',
          plan: '',
          act: ''
        });
        setAnalysisResult(parsedResult.analysis || null);
      } catch (e) {
        console.error('Ошибка при парсинге результата анализа:', e);
        setCartesianSquare({
          define: '',
          imagine: '',
          plan: '',
          act: ''
        });
        setAnalysisResult(null);
      }
    } else {
      setCartesianSquare({
        define: '',
        imagine: '',
        plan: '',
        act: ''
      });
      setAnalysisResult(null);
    }
  };

  const handleCloseIdeaDetail = () => {
    setIsIdeaDetailOpen(false);
    setSelectedIdea(null);
    setCartesianSquare({
      define: '',
      imagine: '',
      plan: '',
      act: ''
    });
    setAnalysisResult(null);
  };

  const handleCartesianSquareChange = (field: keyof typeof cartesianSquare, value: string) => {
    setCartesianSquare(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyzeIdea = async () => {
    if (!selectedIdea) return;
    
    setIsAnalyzing(true);
    try {
      // Сохраняем данные квадрата Декарта в идею
      const analysisData = {
        cartesianSquare,
        analysis: 'Анализ выполнен через квадрат Декарта'
      };
      
      await db.ideas.update(selectedIdea.id!, {
        analysisResult: JSON.stringify(analysisData)
      });
      
      // Обновляем локальное состояние
      const updatedIdeas = ideas.map(idea => 
        idea.id === selectedIdea.id 
          ? { ...idea, analysisResult: JSON.stringify(analysisData) } 
          : idea
      );
      setIdeas(updatedIdeas);
      
      setAnalysisResult('Анализ выполнен через квадрат Декарта');
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'idea_analyzed',
        entityId: selectedIdea.id!,
        oldValue: null,
        newValue: analysisData
      });
      
      console.log('Анализ влияния анализа идеи:', changeResult);
    } catch (error) {
      console.error('Ошибка при анализе идеи:', error);
      alert('Ошибка при анализе идеи.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvertToTask = async () => {
    if (!selectedIdea) return;
    
    try {
      // Создаем задачу из идеи
      const newTaskId = await db.tasks.add({
        name: selectedIdea.name,
        description: selectedIdea.description,
        priority: 'NotUrgent-Important', // Начальный приоритет
        context: {}, // Начальный контекст
        status: 'Pending', // Начальный статус
        category: selectedIdea.category || 'Без категории'
      });
      
      // Обновляем статус идеи
      await db.ideas.update(selectedIdea.id!, { status: 'realized' });
      
      // Перезагружаем данные
      const loadedIdeas = await db.ideas.toArray();
      setIdeas(loadedIdeas);
      const loadedTasks = await db.tasks.toArray();
      setTasks(loadedTasks);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'idea_converted_to_task',
        entityId: selectedIdea.id!,
        oldValue: selectedIdea.status,
        newValue: 'realized'
      });
      
      console.log('Анализ влияния преобразования идеи в задачу:', changeResult);
      alert('Идея преобразована в задачу!');
      handleCloseIdeaDetail();
    } catch (error) {
      console.error('Ошибка при преобразовании идеи в задачу:', error);
      alert('Ошибка при преобразовании идеи в задачу.');
    }
  };

  const handleConvertToProject = async () => {
    if (!selectedIdea) return;
    
    try {
      // Создаем проект из идеи
      const newProjectId = await db.projects.add({
        name: selectedIdea.name,
        description: selectedIdea.description,
        status: 'Active', // Начальный статус
        resourceEstimation: 'Medium' // Начальная оценка ресурсов
      });
      
      // Обновляем статус идеи
      await db.ideas.update(selectedIdea.id!, { status: 'realized' });
      
      // Перезагружаем данные
      const loadedIdeas = await db.ideas.toArray();
      setIdeas(loadedIdeas);
      const loadedProjects = await db.projects.toArray();
      setProjects(loadedProjects);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'idea_converted_to_project',
        entityId: selectedIdea.id!,
        oldValue: selectedIdea.status,
        newValue: 'realized'
      });
      
      console.log('Анализ влияния преобразования идеи в проект:', changeResult);
      alert('Идея преобразована в проект!');
      handleCloseIdeaDetail();
    } catch (error) {
      console.error('Ошибка при преобразовании идеи в проект:', error);
      alert('Ошибка при преобразовании идеи в проект.');
    }
  };

  // Компонент для отображения идеи в списке
  const IdeaListItem = ({ idea }: { idea: Idea }) => (
    <li key={idea.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-white cursor-pointer hover:underline"
            onClick={() => handleOpenIdeaDetail(idea)}
          >
            {idea.name}
          </h3>
          <p className="text-sm text-gray-400">{idea.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
              Статус: {idea.status}
            </span>
            {idea.category && (
              <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                Категория: {idea.category}
              </span>
            )}
            {idea.tags && idea.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Select
            value={idea.status}
            onValueChange={(value: Idea['status']) =>
              handleIdeaStatusChange(idea.id!, value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активная</SelectItem>
              <SelectItem value="dormant">Спящая</SelectItem>
              <SelectItem value="realized">Реализованная</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {idea.analysisResult && (
        <div className="mt-2 text-xs text-gray-500">
          Проанализирована
        </div>
      )}
    </li>
  );

  // Компонент для отображения деталей идеи
  const IdeaDetailModal = () => {
    if (!selectedIdea) return null;
    
    return (
      <Dialog open={isIdeaDetailOpen} onOpenChange={setIsIdeaDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIdea.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-300">Описание</h3>
              <p className="text-gray-400">{selectedIdea.description || 'Нет описания'}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                Статус: {selectedIdea.status}
              </span>
              {selectedIdea.category && (
                <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                  Категория: {selectedIdea.category}
                </span>
              )}
              {selectedIdea.tags && selectedIdea.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Связи с целями, проектами и задачами */}
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Связи</h3>
              <Tabs defaultValue="goals">
                <TabsList>
                  <TabsTrigger value="goals">Цели</TabsTrigger>
                  <TabsTrigger value="projects">Проекты</TabsTrigger>
                  <TabsTrigger value="tasks">Задачи</TabsTrigger>
                  <TabsTrigger value="journal">Дневник</TabsTrigger>
                </TabsList>
                <TabsContent value="goals">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIdea.linkedGoalIds && selectedIdea.linkedGoalIds.length > 0 ? (
                      goals
                        .filter(goal => selectedIdea.linkedGoalIds?.includes(goal.id!))
                        .map(goal => (
                          <div key={goal.id} className="p-2 bg-gray-700 rounded">
                            <p className="text-white">{goal.name}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Нет связанных целей</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="projects">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIdea.linkedProjectIds && selectedIdea.linkedProjectIds.length > 0 ? (
                      projects
                        .filter(project => selectedIdea.linkedProjectIds?.includes(project.id!))
                        .map(project => (
                          <div key={project.id} className="p-2 bg-gray-700 rounded">
                            <p className="text-white">{project.name}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Нет связанных проектов</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIdea.linkedTaskIds && selectedIdea.linkedTaskIds.length > 0 ? (
                      tasks
                        .filter(task => selectedIdea.linkedTaskIds?.includes(task.id!))
                        .map(task => (
                          <div key={task.id} className="p-2 bg-gray-700 rounded">
                            <p className="text-white">{task.name}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Нет связанных задач</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="journal">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIdea.sourceJournalEntryId ? (
                      journalEntries
                        .filter(entry => entry.id === selectedIdea.sourceJournalEntryId)
                        .map(entry => (
                          <div key={entry.id} className="p-2 bg-gray-700 rounded">
                            <p className="text-white">{entry.text.substring(0, 100)}...</p>
                            <p className="text-gray-400 text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Нет связанной записи дневника</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Квадрат Декарта */}
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Квадрат Декарта</h3>
              <Accordion type="single" collapsible>
                <AccordionItem value="define">
                  <AccordionTrigger>1. Определить</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      placeholder="Что я рассматриваю?"
                      value={cartesianSquare.define}
                      onChange={(e) => handleCartesianSquareChange('define', e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="imagine">
                  <AccordionTrigger>2. Представить</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      placeholder="Что будет, если это произойдет? Что будет, если это не произойдет?"
                      value={cartesianSquare.imagine}
                      onChange={(e) => handleCartesianSquareChange('imagine', e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="plan">
                  <AccordionTrigger>3. Планировать</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      placeholder="Что я могу сделать? Что я должен сделать?"
                      value={cartesianSquare.plan}
                      onChange={(e) => handleCartesianSquareChange('plan', e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="act">
                  <AccordionTrigger>4. Действовать</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      placeholder="Какие шаги я предпринимаю?"
                      value={cartesianSquare.act}
                      onChange={(e) => handleCartesianSquareChange('act', e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button 
                onClick={handleAnalyzeIdea} 
                disabled={isAnalyzing}
                className="mt-2"
              >
                {isAnalyzing ? 'Анализ...' : 'Анализировать'}
              </Button>
              {analysisResult && (
                <div className="mt-2 p-2 bg-gray-700 rounded">
                  <p className="text-white">{analysisResult}</p>
                </div>
              )}
            </div>
            
            {/* Преобразование в действия */}
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Преобразовать в действие</h3>
              <div className="flex space-x-2">
                <Button onClick={handleConvertToTask} variant="outline">
                  В задачу
                </Button>
                <Button onClick={handleConvertToProject} variant="outline">
                  В проект
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Обработчик добавления нового тега
  const handleAddTag = () => {
    if (newTagInput.trim() && !newIdeaTags.includes(newTagInput.trim())) {
      setNewIdeaTags([...newIdeaTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  // Обработчик удаления тега
  const handleRemoveTag = (tagToRemove: string) => {
    setNewIdeaTags(newIdeaTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Идеи & Инкубатор</h1>

      {/* Быстрый захват идей */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрый захват идеи</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название идеи"
            value={newIdeaName}
            onChange={(e) => setNewIdeaName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Textarea
            placeholder="Описание идеи (опционально)"
            value={newIdeaDescription}
            onChange={(e) => setNewIdeaDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 min-h-[80px]"
          />
          
          {/* Теги */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Теги</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newIdeaTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs flex items-center">
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-red-500 hover:text-red-300"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Добавить тег"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              />
              <Button onClick={handleAddTag} variant="outline">
                Добавить
              </Button>
            </div>
          </div>
          
          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
            <Input
              placeholder="Категория идеи"
              value={newIdeaCategory}
              onChange={(e) => setNewIdeaCategory(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
            />
          </div>
          
          {/* Связи с целями */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Связать с целями</label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={newIdeaLinkedGoalIds.includes(goal.id!)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewIdeaLinkedGoalIds([...newIdeaLinkedGoalIds, goal.id!]);
                      } else {
                        setNewIdeaLinkedGoalIds(newIdeaLinkedGoalIds.filter(id => id !== goal.id));
                      }
                    }}
                  />
                  <label htmlFor={`goal-${goal.id}`} className="text-sm text-white">
                    {goal.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Связи с проектами */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Связать с проектами</label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded">
              {projects.map(project => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={newIdeaLinkedProjectIds.includes(project.id!)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewIdeaLinkedProjectIds([...newIdeaLinkedProjectIds, project.id!]);
                      } else {
                        setNewIdeaLinkedProjectIds(newIdeaLinkedProjectIds.filter(id => id !== project.id));
                      }
                    }}
                  />
                  <label htmlFor={`project-${project.id}`} className="text-sm text-white">
                    {project.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Связи с задачами */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Связать с задачами</label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={newIdeaLinkedTaskIds.includes(task.id!)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewIdeaLinkedTaskIds([...newIdeaLinkedTaskIds, task.id!]);
                      } else {
                        setNewIdeaLinkedTaskIds(newIdeaLinkedTaskIds.filter(id => id !== task.id));
                      }
                    }}
                  />
                  <label htmlFor={`task-${task.id}`} className="text-sm text-white">
                    {task.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleAddIdea} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить идею
          </Button>
        </CardContent>
      </Card>

      {/* Список идей */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши идеи</CardTitle>
        </CardHeader>
        <CardContent>
          {ideas.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет идей. Добавьте первую!</p>
          ) : (
            <ul className="space-y-2">
              {ideas.map(idea => (
                <IdeaListItem key={idea.id} idea={idea} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно деталей идеи */}
      {isIdeaDetailOpen && <IdeaDetailModal />}
    </div>
  );
};

export default Ideas;