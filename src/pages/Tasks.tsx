import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Tasks: React.FC = () => {
  return (
    <PageWrapper title="Задачи">
      <Card>
        <CardHeader>
          <CardTitle>Задачи</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал задач временно упрощен для стабильной работы главной страницы.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default Tasks;
  
  // Состояния для делегирования
  const [delegateTo, setDelegateTo] = useState<string>('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await db.tasks.toArray();
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };
    loadTasks();
  }, []);

  const handleAddTask = useCallback(async () => {
    if (!newTaskName.trim()) {
      alert('Название задачи не может быть пустым.');
      return;
    }
    try {
      const newTaskId = await db.tasks.add({
        name: newTaskName,
        description: newTaskDescription,
        priority: newTaskPriority,
        context: newTaskContext,
        status: 'Pending', // Начальный статус
      });
      
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskPriority('NotUrgent-Important');
      setNewTaskContext({
        place: '',
        tool: '',
        energy: ''
      });
      
      // Перезагружаем задачи после добавления
      const loadedTasks = await db.tasks.toArray();
      setTasks(loadedTasks);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'task_added',
        entityId: newTaskId,
        oldValue: null,
        newValue: {
          name: newTaskName,
          description: newTaskDescription,
          priority: newTaskPriority,
          context: newTaskContext,
          status: 'Pending'
        }
      });
      
      console.log('Анализ влияния добавления задачи:', changeResult);
      alert('Задача добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      alert('Ошибка при добавлении задачи.');
    }
  }, [newTaskName, newTaskDescription, newTaskPriority, newTaskContext, propagateChange]);

  const handleTaskStatusChange = useCallback(async (taskId: number, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await db.tasks.update(taskId, { status: newStatus });
      
      // Перезагружаем задачи после изменения
      const loadedTasks = await db.tasks.toArray();
      setTasks(loadedTasks);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'task_status_changed',
        entityId: taskId,
        oldValue: task.status,
        newValue: newStatus
      });
      
      console.log('Анализ влияния изменения статуса задачи:', changeResult);
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
      alert('Ошибка при изменении статуса задачи.');
    }
  }, [tasks, propagateChange]);

  const handleTaskPriorityChange = useCallback(async (taskId: number, newPriority: Task['priority']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await db.tasks.update(taskId, { priority: newPriority });
      
      // Перезагружаем задачи после изменения
      const loadedTasks = await db.tasks.toArray();
      setTasks(loadedTasks);
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'task_priority_changed',
        entityId: taskId,
        oldValue: task.priority,
        newValue: newPriority
      });
      
      console.log('Анализ влияния изменения приоритета задачи:', changeResult);
    } catch (error) {
      console.error('Ошибка при изменении приоритета задачи:', error);
      alert('Ошибка при изменении приоритета задачи.');
    }
  }, [tasks, propagateChange]);

  const handleOpenTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
    
    // Загрузить подзадачи для выбранной задачи
    if (task.subTaskIds && task.subTaskIds.length > 0) {
      try {
        const loadedSubTasks = await db.subTasks.where('id').anyOf(task.subTaskIds).toArray();
        setSubTasks(loadedSubTasks);
      } catch (error) {
        console.error('Ошибка при загрузке подзадач:', error);
      }
    } else {
      setSubTasks([]);
    }
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
    setSubTasks([]); // Сбросить подзадачи
    // Сбросить состояния SMART шаблона, повторяющихся задач и делегирования
    setSmartTemplate({
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: ''
    });
    setRecurringPattern('');
    setDelegateTo('');
    // Сбросить состояния подзадач
    setNewSubTaskName('');
    setNewSubTaskDescription('');
  };

  // Фильтрация и сортировка задач
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          const priorityOrder = ['Urgent-Important', 'NotUrgent-Important', 'Urgent-NotImportant', 'NotUrgent-NotImportant'];
          return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Компонент для отображения задачи в списке
  const TaskListItem = ({ task }: { task: Task }) => (
    <li key={task.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-white cursor-pointer hover:underline"
            onClick={() => handleOpenTaskDetail(task)}
          >
            {task.name}
          </h3>
          <p className="text-sm text-gray-400">{task.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
              {task.priority}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
              {task.status}
            </span>
            {task.context.place && (
              <span className="text-xs px-2 py-1 rounded bg-purple-500 text-white">
                Место: {task.context.place}
              </span>
            )}
            {task.context.tool && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500 text-white">
                Инструмент: {task.context.tool}
              </span>
            )}
            {task.context.energy && (
              <span className="text-xs px-2 py-1 rounded bg-red-500 text-white">
                Энергия: {task.context.energy}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Select
            value={task.status}
            onValueChange={(value: string) =>
              handleTaskStatusChange(task.id!, value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">В ожидании</SelectItem>
              <SelectItem value="In Progress">В процессе</SelectItem>
              <SelectItem value="Completed">Завершена</SelectItem>
              <SelectItem value="Cancelled">Отменена</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={task.priority}
            onValueChange={(value: Task['priority']) =>
              handleTaskPriorityChange(task.id!, value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Urgent-Important">Срочно-Важно</SelectItem>
              <SelectItem value="NotUrgent-Important">Не срочно-Важно</SelectItem>
              <SelectItem value="Urgent-NotImportant">Срочно-Не важно</SelectItem>
              <SelectItem value="NotUrgent-NotImportant">Не срочно-Не важно</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {task.subTaskIds && task.subTaskIds.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Подзадач: {task.subTaskIds.length}
        </div>
      )}
    </li>
  );

  // Компонент для отображения деталей задачи
  const TaskDetailModal = () => {
    if (!selectedTask) return null;
    
    // Функция для добавления подзадачи
    const handleAddSubTask = async () => {
      if (!newSubTaskName.trim()) {
        alert('Название подзадачи не может быть пустым.');
        return;
      }
      
      try {
        // Добавить подзадачу в базу данных
        const newSubTaskId = await db.subTasks.add({
          name: newSubTaskName,
          description: newSubTaskDescription,
          priority: 1, // Временное значение приоритета
          status: 'Pending'
        });
        
        // Обновить список подзадач
        const newSubTask: SubTask = {
          id: newSubTaskId,
          name: newSubTaskName,
          description: newSubTaskDescription,
          priority: 1,
          status: 'Pending'
        };
        setSubTasks([...subTasks, newSubTask]);
        
        // Обновить список ID подзадач в основной задаче
        const updatedSubTaskIds = selectedTask.subTaskIds ? [...selectedTask.subTaskIds, newSubTaskId] : [newSubTaskId];
        await db.tasks.update(selectedTask.id!, { subTaskIds: updatedSubTaskIds });
        
        // Сбросить поля ввода подзадачи
        setNewSubTaskName('');
        setNewSubTaskDescription('');
        
        alert('Подзадача добавлена!');
      } catch (error) {
        console.error('Ошибка при добавлении подзадачи:', error);
        alert('Ошибка при добавлении подзадачи.');
      }
    };
    
    // Функция для изменения статуса подзадачи
    const handleSubTaskStatusChange = async (subTaskId: number, newStatus: string) => {
      try {
        await db.subTasks.update(subTaskId, { status: newStatus });
        
        // Обновить список подзадач
        setSubTasks(subTasks.map(subTask =>
          subTask.id === subTaskId ? { ...subTask, status: newStatus } : subTask
        ));
      } catch (error) {
        console.error('Ошибка при изменении статуса подзадачи:', error);
        alert('Ошибка при изменении статуса подзадачи.');
      }
    };
    
    // Функция для удаления подзадачи
    const handleDeleteSubTask = async (subTaskId: number) => {
      try {
        await db.subTasks.delete(subTaskId);
        
        // Обновить список подзадач
        setSubTasks(subTasks.filter(subTask => subTask.id !== subTaskId));
        
        // Обновить список ID подзадач в основной задаче
        if (selectedTask?.subTaskIds) {
          const updatedSubTaskIds = selectedTask.subTaskIds.filter(id => id !== subTaskId);
          await db.tasks.update(selectedTask.id!, { subTaskIds: updatedSubTaskIds });
        }
        
        alert('Подзадача удалена!');
      } catch (error) {
        console.error('Ошибка при удалении подзадачи:', error);
        alert('Ошибка при удалении подзадачи.');
      }
    };
    
    // Функция для обработки SMART шаблона
    const handleSmartTemplate = async () => {
      try {
        const prompt = `Помоги улучшить постановку задачи "${selectedTask.name}" по критериям SMART:
        Конкретная (Specific): ${smartTemplate.specific}
        Измеримая (Measurable): ${smartTemplate.measurable}
        Достижимая (Achievable): ${smartTemplate.achievable}
        Релевантная (Relevant): ${smartTemplate.relevant}
        Ограниченная по времени (Time-bound): ${smartTemplate.timeBound}
        
        Предложи улучшения для каждого критерия.`;
        
        const aiResponse = await queryAI(prompt);
        alert(`Результат ИИ-анализа SMART:\n${aiResponse.response}`);
      } catch (error) {
        console.error('Ошибка при ИИ-анализе SMART:', error);
        alert('Ошибка при ИИ-анализе SMART.');
      }
    };
    
    // Функция для обработки повторяющихся задач
    const handleRecurringTask = async () => {
      if (!recurringPattern) {
        alert('Пожалуйста, укажите паттерн повторения задачи.');
        return;
      }
      
      try {
        // В реальной реализации здесь будет код для создания повторяющейся задачи
        alert(`Повторяющаяся задача создана с паттерном: ${recurringPattern}`);
      } catch (error) {
        console.error('Ошибка при создании повторяющейся задачи:', error);
        alert('Ошибка при создании повторяющейся задачи.');
      }
    };
    
    // Функция для обработки делегирования
    const handleDelegateTask = async () => {
      if (!delegateTo) {
        alert('Пожалуйста, укажите, кому делегировать задачу.');
        return;
      }
      
      try {
        // Используем систему оперативных изменений для делегирования
        const changeResult = await propagateChange({
          type: 'task_delegated',
          entityId: selectedTask.id!,
          oldValue: null,
          newValue: delegateTo
        });
        
        console.log('Анализ влияния делегирования задачи:', changeResult);
        alert(`Задача делегирована: ${delegateTo}`);
      } catch (error) {
        console.error('Ошибка при делегировании задачи:', error);
        alert('Ошибка при делегировании задачи.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{selectedTask.name}</h2>
            <Button variant="ghost" onClick={handleCloseTaskDetail}>×</Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Описание</Label>
              <p className="text-gray-400">{selectedTask.description || 'Нет описания'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Приоритет</Label>
                <p className="text-gray-400">{selectedTask.priority}</p>
              </div>
              <div>
                <Label className="text-gray-300">Статус</Label>
                <p className="text-gray-400">{selectedTask.status}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Контекст</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div className="bg-gray-700 p-2 rounded">
                  <Label className="text-gray-400 text-sm">Место</Label>
                  <p className="text-white">{selectedTask.context.place || 'Не указано'}</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <Label className="text-gray-400 text-sm">Инструмент</Label>
                  <p className="text-white">{selectedTask.context.tool || 'Не указано'}</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <Label className="text-gray-400 text-sm">Энергия</Label>
                  <p className="text-white">{selectedTask.context.energy || 'Не указано'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Подзадачи</Label>
              <div className="mt-2 space-y-2">
                {subTasks.map(subTask => (
                  <div key={subTask.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={subTask.status === 'Completed'}
                        onChange={(e) => handleSubTaskStatusChange(subTask.id!, e.target.checked ? 'Completed' : 'Pending')}
                        className="rounded text-blue-500"
                      />
                      <span className={subTask.status === 'Completed' ? 'line-through text-gray-500' : 'text-white'}>
                        {subTask.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubTask(subTask.id!)}
                      className="text-red-500 hover:text-red-300"
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
                
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Название подзадачи"
                    value={newSubTaskName}
                    onChange={(e) => setNewSubTaskName(e.target.value)}
                    className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                  />
                  <Button onClick={handleAddSubTask}>
                    Добавить
                  </Button>
                </div>
                
                {newSubTaskName && (
                  <Textarea
                    placeholder="Описание подзадачи (опционально)"
                    value={newSubTaskDescription}
                    onChange={(e) => setNewSubTaskDescription(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 mt-2"
                  />
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Вложения</Label>
              <p className="text-gray-400">Функционал вложений в разработке.</p>
            </div>
            
            <div>
              <Label className="text-gray-300">Шаблон SMART</Label>
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Конкретная (Specific)"
                  value={smartTemplate.specific}
                  onChange={(e) => setSmartTemplate({...smartTemplate, specific: e.target.value})}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Input
                  placeholder="Измеримая (Measurable)"
                  value={smartTemplate.measurable}
                  onChange={(e) => setSmartTemplate({...smartTemplate, measurable: e.target.value})}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Input
                  placeholder="Достижимая (Achievable)"
                  value={smartTemplate.achievable}
                  onChange={(e) => setSmartTemplate({...smartTemplate, achievable: e.target.value})}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Input
                  placeholder="Релевантная (Relevant)"
                  value={smartTemplate.relevant}
                  onChange={(e) => setSmartTemplate({...smartTemplate, relevant: e.target.value})}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Input
                  placeholder="Ограниченная по времени (Time-bound)"
                  value={smartTemplate.timeBound}
                  onChange={(e) => setSmartTemplate({...smartTemplate, timeBound: e.target.value})}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Button onClick={handleSmartTemplate} className="w-full mt-2">
                  Проверить через ИИ
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Повторяющиеся задачи</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="Паттерн повторения (например, ежедневно, еженедельно)"
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Button onClick={handleRecurringTask}>
                  Создать
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Делегирование</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="Кому делегировать"
                  value={delegateTo}
                  onChange={(e) => setDelegateTo(e.target.value)}
                  className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600"
                />
                <Button onClick={handleDelegateTask}>
                  Делегировать
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseTaskDetail}>
              Закрыть
            </Button>
            <Button 
              onClick={async () => {
                try {
                  // В реальной реализации здесь будет код для ИИ-оптимизации
                  const prompt = `Оптимизируй расписание для задачи "${selectedTask.name}" с учетом приоритета "${selectedTask.priority}" и контекста: место - "${selectedTask.context.place}", инструмент - "${selectedTask.context.tool}", энергия - "${selectedTask.context.energy}".`;
                  const aiResponse = await queryAI(prompt);
                  alert(`Результат ИИ-оптимизации:\n${aiResponse.response}`);
                } catch (error) {
                  console.error('Ошибка при ИИ-оптимизации:', error);
                  alert('Ошибка при ИИ-оптимизации.');
                }
              }}
            >
              ИИ-оптимизация
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Вычисление статистики задач
  const taskStatistics = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'Completed').length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    pending: tasks.filter(task => task.status === 'Pending').length,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Задачи (GTD на стероидах)</h1>

      {/* Система "инбокс" для быстрого добавления задач */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрое добавление задачи</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название задачи"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Textarea
            placeholder="Описание задачи (опционально)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taskPriority">Приоритет (Матрица Эйзенхауэра)</Label>
              <Select 
                value={newTaskPriority} 
                onValueChange={(value: 'Urgent-Important' | 'NotUrgent-Important' | 'Urgent-NotImportant' | 'NotUrgent-NotImportant') => 
                  setNewTaskPriority(value)
                }
              >
                <SelectTrigger id="taskPriority">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgent-Important">Срочно-Важно</SelectItem>
                  <SelectItem value="NotUrgent-Important">Не срочно-Важно</SelectItem>
                  <SelectItem value="Urgent-NotImportant">Срочно-Не важно</SelectItem>
                  <SelectItem value="NotUrgent-NotImportant">Не срочно-Не важно</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="taskStatus">Статус</Label>
              <Select 
                value="Pending" 
                disabled
              >
                <SelectTrigger id="taskStatus">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">В ожидании</SelectItem>
                  <SelectItem value="In Progress">В процессе</SelectItem>
                  <SelectItem value="Completed">Завершена</SelectItem>
                  <SelectItem value="Cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="taskPlace">Место</Label>
              <Input
                id="taskPlace"
                placeholder="Где выполнять задачу"
                value={newTaskContext.place}
                onChange={(e) => setNewTaskContext({...newTaskContext, place: e.target.value})}
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="taskTool">Инструмент</Label>
              <Input
                id="taskTool"
                placeholder="Какой инструмент использовать"
                value={newTaskContext.tool}
                onChange={(e) => setNewTaskContext({...newTaskContext, tool: e.target.value})}
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="taskEnergy">Энергия</Label>
              <Select 
                value={newTaskContext.energy} 
                onValueChange={(value: string) => 
                  setNewTaskContext({...newTaskContext, energy: value})
                }
              >
                <SelectTrigger id="taskEnergy">
                  <SelectValue placeholder="Уровень энергии" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">Высокая</SelectItem>
                  <SelectItem value="Medium">Средняя</SelectItem>
                  <SelectItem value="Low">Низкая</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleAddTask} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить задачу
          </Button>
        </CardContent>
      </Card>

      {/* Фильтры и сортировка */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и сортировка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterPriority">Фильтр по приоритету</Label>
              <Select 
                value={filterPriority} 
                onValueChange={(value: string) => setFilterPriority(value)}
              >
                <SelectTrigger id="filterPriority">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="Urgent-Important">Срочно-Важно</SelectItem>
                  <SelectItem value="NotUrgent-Important">Не срочно-Важно</SelectItem>
                  <SelectItem value="Urgent-NotImportant">Срочно-Не важно</SelectItem>
                  <SelectItem value="NotUrgent-NotImportant">Не срочно-Не важно</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filterStatus">Фильтр по статусу</Label>
              <Select 
                value={filterStatus} 
                onValueChange={(value: string) => setFilterStatus(value)}
              >
                <SelectTrigger id="filterStatus">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="Pending">В ожидании</SelectItem>
                  <SelectItem value="In Progress">В процессе</SelectItem>
                  <SelectItem value="Completed">Завершена</SelectItem>
                  <SelectItem value="Cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sortBy">Сортировать по</Label>
              <Select 
                value={sortBy} 
                onValueChange={(value: string) => setSortBy(value)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Названию</SelectItem>
                  <SelectItem value="priority">Приоритету</SelectItem>
                  <SelectItem value="status">Статусу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика выполнения */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика выполнения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500 p-4 rounded-md text-white">
              <p className="text-2xl font-bold">{taskStatistics.total}</p>
              <p>Всего задач</p>
            </div>
            <div className="bg-green-500 p-4 rounded-md text-white">
              <p className="text-2xl font-bold">{taskStatistics.completed}</p>
              <p>Завершено</p>
            </div>
            <div className="bg-yellow-500 p-4 rounded-md text-white">
              <p className="text-2xl font-bold">{taskStatistics.inProgress}</p>
              <p>В процессе</p>
            </div>
            <div className="bg-gray-500 p-4 rounded-md text-white">
              <p className="text-2xl font-bold">{taskStatistics.pending}</p>
              <p>В ожидании</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список задач */}
      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTasks.length > 0 ? (
            <ul className="space-y-2">
              {filteredAndSortedTasks.map(task => (
                <TaskListItem key={task.id} task={task} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Нет задач для отображения.</p>
          )}
        </CardContent>
      </Card>

      {/* Панель ИИ-оптимизации расписания */}
      <Card>
        <CardHeader>
          <CardTitle>ИИ-оптимизация расписания</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">ИИ может помочь оптимизировать ваше расписание, учитывая приоритеты задач, контекст и доступное время.</p>
          <Button 
            onClick={async () => {
              try {
                // В реальной реализации здесь будет код для ИИ-оптимизации
                const prompt = `Оптимизируй расписание для следующих задач:
                ${tasks.map(task => `- ${task.name} (приоритет: ${task.priority}, статус: ${task.status})`).join('\n')}
                
                Учитывай приоритеты задач (Матрица Эйзенхауэра), контекст и доступное время.`;
                const aiResponse = await queryAI(prompt);
                alert(`Результат ИИ-оптимизации:\n${aiResponse.response}`);
              } catch (error) {
                console.error('Ошибка при ИИ-оптимизации:', error);
                alert('Ошибка при ИИ-оптимизации.');
              }
            }}
            className="w-full"
          >
            Оптимизировать расписание
          </Button>
        </CardContent>
      </Card>

      {/* Модальное окно деталей задачи */}
      {isTaskDetailOpen && <TaskDetailModal />}
    </div>
  );
};

export default Tasks;