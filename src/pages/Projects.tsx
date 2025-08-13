// src/pages/Projects.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { db, Project } from '../lib/db'; // Импорт db и интерфейса Project
import { Link } from 'react-router-dom'; // Для навигации
import { useChangePropagation } from '../hooks/use-change-propagation'; // Для системы оперативных изменений
import { analyzeLocalData } from '../lib/ai'; // Для ИИ-анализа

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<'Active' | 'On Hold' | 'Completed' | 'Cancelled'>('Active');
  const [newProjectResourceEstimation, setNewProjectResourceEstimation] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  // Состояния для видов отображения
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('list');
  
  // Состояния для системы оперативных изменений
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { propagateChange, applyAdjustments } = useChangePropagation();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const loadedProjects = await db.projects.toArray();
        setProjects(loadedProjects);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
      }
    };
    loadProjects();
  }, []);

  const handleAddProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      alert('Название проекта не может быть пустым.');
      return;
    }
    try {
      const newProjectId = await db.projects.add({
        name: newProjectName,
        description: newProjectDescription,
        status: newProjectStatus,
        resourceEstimation: newProjectResourceEstimation,
      });
      
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectStatus('Active');
      setNewProjectResourceEstimation('Medium');
      
      // Перезагружаем проекты после добавления
      const loadedProjects = await db.projects.toArray();
      setProjects(loadedProjects);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'project_added',
        entityId: newProjectId,
        oldValue: null,
        newValue: {
          name: newProjectName,
          description: newProjectDescription,
          status: newProjectStatus,
          resourceEstimation: newProjectResourceEstimation,
        }
      });
      
      console.log('Анализ влияния добавления проекта:', changeResult);
      alert('Проект добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении проекта:', error);
      alert('Ошибка при добавлении проекта.');
    }
  }, [newProjectName, newProjectDescription, newProjectStatus, newProjectResourceEstimation, propagateChange]);

  const handleProjectStatusChange = useCallback(async (projectId: number, newStatus: 'Active' | 'On Hold' | 'Completed' | 'Cancelled') => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      await db.projects.update(projectId, { status: newStatus });
      
      // Перезагружаем проекты после изменения
      const loadedProjects = await db.projects.toArray();
      setProjects(loadedProjects);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'project_status_changed',
        entityId: projectId,
        oldValue: project.status,
        newValue: newStatus
      });
      
      console.log('Анализ влияния изменения статуса проекта:', changeResult);
      setImpactAnalysis(changeResult);
    } catch (error) {
      console.error('Ошибка при изменении статуса проекта:', error);
      alert('Ошибка при изменении статуса проекта.');
    }
  }, [projects, propagateChange]);

  const handleAnalyzeProjectImpact = useCallback(async (projectId: number) => {
    setIsAnalyzing(true);
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        setIsAnalyzing(false);
        return;
      }
      
      // Получаем все данные для анализа
      const allData = {
        projects: projects,
        // В реальной реализации здесь будут данные из других таблиц
      };
      
      // Используем ИИ для анализа данных
      const aiAnalysis = await analyzeLocalData(allData);
      console.log('ИИ-анализ проекта:', aiAnalysis);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'project_impact_analysis',
        entityId: projectId,
        oldValue: null,
        newValue: aiAnalysis
      });
      
      setImpactAnalysis(changeResult);
    } catch (error) {
      console.error('Ошибка при анализе влияния проекта:', error);
      alert('Ошибка при анализе влияния проекта.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [projects, propagateChange]);

  const handleApplyAdjustments = useCallback(async () => {
    if (!impactAnalysis || !impactAnalysis.suggestedAdjustments) return;
    
    try {
      const result = await applyAdjustments(impactAnalysis.suggestedAdjustments);
      console.log('Результат применения корректировок:', result);
      alert('Корректировки применены!');
      setImpactAnalysis(null);
    } catch (error) {
      console.error('Ошибка при применении корректировок:', error);
      alert('Ошибка при применении корректировок.');
    }
  }, [impactAnalysis, applyAdjustments]);

  // Компонент для отображения проекта в виде списка
  const ProjectListItem = ({ project }: { project: Project }) => (
    <li key={project.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <p className="text-sm text-gray-400">{project.description}</p>
          <p className="text-xs text-gray-500">Статус: {project.status}</p>
          <p className="text-xs text-gray-500">Ресурсы: {project.resourceEstimation}</p>
        </div>
        <div className="flex space-x-2">
          <Select 
            value={project.status} 
            onValueChange={(value: 'Active' | 'On Hold' | 'Completed' | 'Cancelled') => 
              handleProjectStatusChange(project.id!, value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Активный</SelectItem>
              <SelectItem value="On Hold">На паузе</SelectItem>
              <SelectItem value="Completed">Завершен</SelectItem>
              <SelectItem value="Cancelled">Отменен</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAnalyzeProjectImpact(project.id!)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Анализ...' : 'Анализ'}
          </Button>
        </div>
      </div>
    </li>
  );

  // Компонент для отображения проекта в виде карточки (Канбан)
  const ProjectCard = ({ project }: { project: Project }) => (
    <div key={project.id} className="p-3 border rounded-md bg-gray-700 border-gray-600 w-64">
      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
      <p className="text-sm text-gray-400">{project.description}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Статус: {project.status}</span>
        <span className="text-xs text-gray-500">Ресурсы: {project.resourceEstimation}</span>
      </div>
      <div className="mt-2 flex space-x-2">
        <Select 
          value={project.status} 
          onValueChange={(value: 'Active' | 'On Hold' | 'Completed' | 'Cancelled') => 
            handleProjectStatusChange(project.id!, value)
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Активный</SelectItem>
            <SelectItem value="On Hold">На паузе</SelectItem>
            <SelectItem value="Completed">Завершен</SelectItem>
            <SelectItem value="Cancelled">Отменен</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAnalyzeProjectImpact(project.id!)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Анализ...' : 'Анализ'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Проекты</h1>

      {/* Добавление нового проекта */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить новый проект</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название проекта"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Input
            placeholder="Описание проекта (опционально)"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectStatus">Статус проекта</Label>
              <Select 
                value={newProjectStatus} 
                onValueChange={(value: 'Active' | 'On Hold' | 'Completed' | 'Cancelled') => 
                  setNewProjectStatus(value)
                }
              >
                <SelectTrigger id="projectStatus">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Активный</SelectItem>
                  <SelectItem value="On Hold">На паузе</SelectItem>
                  <SelectItem value="Completed">Завершен</SelectItem>
                  <SelectItem value="Cancelled">Отменен</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="projectResources">Оценка ресурсов</Label>
              <Select 
                value={newProjectResourceEstimation} 
                onValueChange={(value: 'Low' | 'Medium' | 'High') => 
                  setNewProjectResourceEstimation(value)
                }
              >
                <SelectTrigger id="projectResources">
                  <SelectValue placeholder="Ресурсы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Низкая</SelectItem>
                  <SelectItem value="Medium">Средняя</SelectItem>
                  <SelectItem value="High">Высокая</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleAddProject} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить проект
          </Button>
        </CardContent>
      </Card>

      {/* Виды отображения */}
      <Card>
        <CardHeader>
          <CardTitle>Виды отображения</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            Список
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'outline'} 
            onClick={() => setViewMode('kanban')}
          >
            Канбан
          </Button>
          <Button 
            variant={viewMode === 'gantt' ? 'default' : 'outline'} 
            onClick={() => setViewMode('gantt')}
          >
            Гант
          </Button>
        </CardContent>
      </Card>

      {/* Список проектов */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши проекты</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет проектов. Добавьте первый!</p>
          ) : (
            <div>
              {viewMode === 'list' && (
                <ul className="space-y-2">
                  {projects.map(project => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </ul>
              )}
              
              {viewMode === 'kanban' && (
                <div className="flex flex-wrap gap-4">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
              
              {viewMode === 'gantt' && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">Диаграмма Ганта в разработке. В реальной реализации здесь будет визуализация сроков проектов.</p>
                  <ul className="space-y-2">
                    {projects.map(project => (
                      <li key={project.id} className="p-2 border rounded-md bg-gray-700 border-gray-600">
                        <div className="flex justify-between">
                          <span className="text-white">{project.name}</span>
                          <span className="text-gray-400 text-sm">{project.status}</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Система оперативных изменений */}
      {impactAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Анализ влияния изменений</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Влияние на: {impactAnalysis.affectedEntities?.join(', ') || 'Не определено'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Оценка влияния: {impactAnalysis.impactScore || 'Не определена'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Психологическое влияние: {impactAnalysis.psychologicalImpact || 'Не определено'}
            </p>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Предложенные корректировки:</h4>
              <ul className="list-disc list-inside ml-4 text-sm text-gray-600 dark:text-gray-400">
                {impactAnalysis.suggestedAdjustments?.map((adjustment: string, index: number) => (
                  <li key={index}>{adjustment}</li>
                )) || <li>Нет предложенных корректировок</li>}
              </ul>
            </div>
            <Button onClick={handleApplyAdjustments} className="mt-2">
              Применить корректировки
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Дополнительный функционал */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительный функционал</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Управление ресурсами, связь с целями и задачами, интеграция с календарем.
          </p>
          <div className="flex space-x-2">
            <Link to="/calendar" className="text-blue-500 cursor-pointer hover:underline">
              <Button variant="outline">Перейти в Календарь</Button>
            </Link>
            <Link to="/goals" className="text-blue-500 cursor-pointer hover:underline">
              <Button variant="outline">Связать с Целями</Button>
            </Link>
            <Link to="/tasks" className="text-blue-500 cursor-pointer hover:underline">
              <Button variant="outline">Управление Задачами</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;