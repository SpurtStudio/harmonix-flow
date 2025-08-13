// src/pages/Development.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { db } from '../lib/db';
import { queryAI } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Skill {
  id: number;
  name: string;
  level: number; // 0-100
  goal: number; // Целевой уровень 0-100
  category: string;
  lastUpdated: Date;
}

interface LearningGoal {
  id: number;
  title: string;
  description: string;
  progress: number; // 0-100
  deadline?: Date;
  skills: string[]; // Связанные навыки
}

interface LearningProject {
  id: number;
  title: string;
  description: string;
  progress: number; // 0-100
  startDate: Date;
  endDate?: Date;
  goals: number[]; // Связанные цели
}

const Development: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [learningProjects, setLearningProjects] = useState<LearningProject[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });
  const [newProject, setNewProject] = useState({ title: '', description: '', startDate: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  // Загрузка данных при монтировании
  useEffect(() => {
    loadDevelopmentData();
  }, []);

  const loadDevelopmentData = async () => {
    try {
      const loadedSkills = await db.skills.toArray();
      setSkills(loadedSkills);

      const loadedGoals = await db.learningGoals.toArray();
      setLearningGoals(loadedGoals);

      const loadedProjects = await db.learningProjects.toArray();
      setLearningProjects(loadedProjects);
    } catch (error) {
      console.error('Ошибка при загрузке данных развития:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные развития",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;

    try {
      const skill: any = {
        name: newSkill.name,
        level: 0,
        goal: 80,
        category: newSkill.category || 'Общее',
        lastUpdated: new Date(),
      };

      const id = await db.skills.add(skill);
      setSkills([...skills, { ...skill, id }]);
      setNewSkill({ name: '', category: '' });

      toast({
        title: "Навык добавлен",
        description: `Навык "${skill.name}" успешно добавлен`,
      });
    } catch (error) {
      console.error('Ошибка при добавлении навыка:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить навык",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSkillLevel = async (id: number, level: number) => {
    try {
      await db.skills.update(id, { level, lastUpdated: new Date() });
      setSkills(skills.map(skill => skill.id === id ? { ...skill, level, lastUpdated: new Date() } : skill));

      toast({
        title: "Уровень навыка обновлен",
        description: `Уровень навыка обновлен до ${level}%`,
      });
    } catch (error) {
      console.error('Ошибка при обновлении уровня навыка:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить уровень навыка",
        variant: "destructive",
      });
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      const goal: any = {
        title: newGoal.title,
        description: newGoal.description,
        progress: 0,
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
        skills: [],
      };

      const id = await db.learningGoals.add(goal);
      setLearningGoals([...learningGoals, { ...goal, id }]);
      setNewGoal({ title: '', description: '', deadline: '' });

      toast({
        title: "Цель добавлена",
        description: `Цель "${goal.title}" успешно добавлена`,
      });
    } catch (error) {
      console.error('Ошибка при добавлении цели:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить цель",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoalProgress = async (id: number, progress: number) => {
    try {
      await db.learningGoals.update(id, { progress });
      setLearningGoals(learningGoals.map(goal => goal.id === id ? { ...goal, progress } : goal));

      toast({
        title: "Прогресс цели обновлен",
        description: `Прогресс цели обновлен до ${progress}%`,
      });
    } catch (error) {
      console.error('Ошибка при обновлении прогресса цели:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить прогресс цели",
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim()) return;

    try {
      const project: any = {
        title: newProject.title,
        description: newProject.description,
        progress: 0,
        startDate: new Date(newProject.startDate),
        goals: [],
      };

      const id = await db.learningProjects.add(project);
      setLearningProjects([...learningProjects, { ...project, id }]);
      setNewProject({ title: '', description: '', startDate: new Date().toISOString().split('T')[0] });

      toast({
        title: "Проект добавлен",
        description: `Проект "${project.title}" успешно добавлен`,
      });
    } catch (error) {
      console.error('Ошибка при добавлении проекта:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить проект",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProjectProgress = async (id: number, progress: number) => {
    try {
      await db.learningProjects.update(id, { progress });
      setLearningProjects(learningProjects.map(project => project.id === id ? { ...project, progress } : project));

      toast({
        title: "Прогресс проекта обновлен",
        description: `Прогресс проекта обновлен до ${progress}%`,
      });
    } catch (error) {
      console.error('Ошибка при обновлении прогресса проекта:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить прогресс проекта",
        variant: "destructive",
      });
    }
  };

  const getRecommendations = async () => {
    try {
      const prompt = `На основе следующих данных о развитии, предложи рекомендации:
      Навыки: ${skills.map(s => `${s.name} (${s.level}/${s.goal}%)`).join(', ')}
      Цели: ${learningGoals.map(g => `${g.title} (${g.progress}%)`).join(', ')}
      Проекты: ${learningProjects.map(p => `${p.title} (${p.progress}%)`).join(', ')}
      
      Предложи конкретные рекомендации по улучшению прогресса в развитии, балансу навыков и достижению целей.`;

      const response = await queryAI(prompt);
      
      toast({
        title: "Рекомендации ИИ",
        description: response.response,
      });
    } catch (error) {
      console.error('Ошибка при получении рекомендаций:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить рекомендации",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Развитие</h1>
        <Button onClick={getRecommendations}>Получить рекомендации ИИ</Button>
      </div>

      {/* Визуализация прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Общий прогресс развития</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Навыки', value: skills.length > 0 ? skills.reduce((acc, skill) => acc + skill.level, 0) / skills.length : 0 },
                  { name: 'Цели', value: learningGoals.length > 0 ? learningGoals.reduce((acc, goal) => acc + goal.progress, 0) / learningGoals.length : 0 },
                  { name: 'Проекты', value: learningProjects.length > 0 ? learningProjects.reduce((acc, project) => acc + project.progress, 0) / learningProjects.length : 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Навыки */}
        <Card>
          <CardHeader>
            <CardTitle>Навыки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Название навыка"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              />
              <Input
                placeholder="Категория"
                value={newSkill.category}
                onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
              />
              <Button onClick={handleAddSkill} className="w-full">Добавить навык</Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {skills.map((skill) => (
                <div key={skill.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <span className="text-sm text-gray-500">{skill.category}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Уровень: {skill.level}%</span>
                      <span>Цель: {skill.goal}%</span>
                    </div>
                    <Progress value={skill.level} className="w-full" />
                  </div>
                  <div className="flex space-x-2">
                    {[25, 50, 75, 100].map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateSkillLevel(skill.id, level)}
                      >
                        {level}%
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Цели обучения */}
        <Card>
          <CardHeader>
            <CardTitle>Цели обучения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Название цели"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              />
              <Textarea
                placeholder="Описание цели"
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              />
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
              <Button onClick={handleAddGoal} className="w-full">Добавить цель</Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {learningGoals.map((goal) => (
                <div key={goal.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    {goal.deadline && (
                      <span className="text-sm text-gray-500">
                        До: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Прогресс: {goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="w-full" />
                  </div>
                  <div className="flex space-x-2">
                    {[25, 50, 75, 100].map((progress) => (
                      <Button
                        key={progress}
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateGoalProgress(goal.id, progress)}
                      >
                        {progress}%
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Проекты обучения */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Проекты обучения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Название проекта"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <Textarea
                placeholder="Описание проекта"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <div className="space-y-2">
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
                <Button onClick={handleAddProject} className="w-full">Добавить проект</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">
                        Начало: {new Date(project.startDate).toLocaleDateString()}
                      </p>
                      {project.endDate && (
                        <p className="text-sm text-gray-500">
                          Окончание: {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Прогресс: {project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="w-full" />
                    </div>
                    <div className="flex space-x-2">
                      {[25, 50, 75, 100].map((progress) => (
                        <Button
                          key={progress}
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateProjectProgress(project.id, progress)}
                        >
                          {progress}%
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Development;