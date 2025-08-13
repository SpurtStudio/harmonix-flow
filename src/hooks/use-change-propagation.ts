// src/hooks/use-change-propagation.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { analyzeLocalData, queryExternalAI } from '../lib/ai';
import { queryAI } from '../lib/api';

interface ChangeImpact {
  affectedEntities: string[]; // Например: ['goals', 'tasks', 'calendar']
  suggestedAdjustments: string[]; // Например: ['перенести задачу X на Y', 'пересмотреть цель Z']
  impactScore: number; // Оценка влияния (например, от 0 до 100)
  psychologicalImpact: string; // Например: 'low', 'medium', 'high'
}

interface ChangeDetails {
  type: 'task_moved' | 'goal_updated' | 'project_status_changed' | string;
  entityId: number;
  oldValue: any;
  newValue: any;
}

/**
 * Хук для управления системой оперативных изменений.
 * Анализирует влияние изменений и предлагает корректировки.
 */
export const useChangePropagation = () => {
  const [lastChange, setLastChange] = useState<ChangeDetails | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ChangeImpact | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Добавляем состояние для отслеживания имитации цепной реакции
  const [propagationLogs, setPropagationLogs] = useState<string[]>([]);

  /**
   * Анализирует влияние изменения.
   * В реальном приложении здесь будет сложная логика с использованием данных из IndexedDB и ИИ.
   * @param change Детали произошедшего изменения.
   */
  const propagateChange = useCallback(async (change: ChangeDetails) => {
    setIsAnalyzing(true);
    setLastChange(change);
    setImpactAnalysis(null);
    setPropagationLogs([]); // Очищаем логи перед новым анализом

    const logs: string[] = [];
    logs.push(`Изменение: ${change.type} для сущности ID: ${change.entityId}`);
    logs.push(`Детали: Старое значение: ${JSON.stringify(change.oldValue)}, Новое значение: ${JSON.stringify(change.newValue)}`);
    console.log(`Изменение: ${change.type} для сущности ID: ${change.entityId}`);
    console.log(`Детали: Старое значение: ${JSON.stringify(change.oldValue)}, Новое значение: ${JSON.stringify(change.newValue)}`);

    let affectedEntities: string[] = [];
    let suggestedAdjustments: string[] = [];
    let impactScore = 0;
    let psychologicalImpact = 'low';

    // Получаем данные из IndexedDB для анализа
    const allData = await getAllDataForAnalysis();
    
    // Используем ИИ для анализа данных
    const aiAnalysis = await analyzeLocalData(allData);
    logs.push(`ИИ-анализ: ${aiAnalysis}`);
    console.log(`ИИ-анализ: ${aiAnalysis}`);

    // Запрос к внешнему ИИ для более глубокого анализа
    const externalAIAnalysis = await queryExternalAI(`Проанализируй влияние следующего изменения на систему:
    Тип изменения: ${change.type}
    Сущность ID: ${change.entityId}
    Старое значение: ${JSON.stringify(change.oldValue)}
    Новое значение: ${JSON.stringify(change.newValue)}
    
    Данные системы:
    ${JSON.stringify(allData, null, 2)}
    
    Предоставь детальный анализ влияния, включая:
    1. Список затронутых сущностей
    2. Предложенные корректировки
    3. Оценку влияния (0-100)
    4. Психологическое воздействие (low/medium/high)`);
    
    logs.push(`Внешний ИИ-анализ: ${externalAIAnalysis}`);
    console.log(`Внешний ИИ-анализ: ${externalAIAnalysis}`);

    // Парсим ответ внешнего ИИ для получения структурированной информации
    try {
      const aiResponse = JSON.parse(externalAIAnalysis.replace(/```json/g, '').replace(/```/g, ''));
      affectedEntities = aiResponse.affectedEntities || [];
      suggestedAdjustments = aiResponse.suggestedAdjustments || [];
      impactScore = aiResponse.impactScore || 0;
      psychologicalImpact = aiResponse.psychologicalImpact || 'low';
    } catch (error) {
      console.error('Ошибка парсинга ответа ИИ:', error);
      // Используем резервную логику анализа
      switch (change.type) {
        case 'task_due_date_changed':
          logs.push(`Анализ: Изменение срока задачи ${change.entityId} повлияло на:`);
          logs.push(`  - Проект, к которому относится задача.`);
          logs.push(`  - Календарь, для обновления расписания.`);
          logs.push(`  - Связанные подзадачи, для пересчета сроков.`);
          logs.push(`  - Глобальную цель, если задача является ключевой для ее достижения.`);
          console.log(`Анализ: Изменение срока задачи ${change.entityId} повлияло на:`);
          console.log(`  - Проект, к которому относится задача.`);
          console.log(`  - Календарь, для обновления расписания.`);
          console.log(`  - Связанные подзадачи, для пересчета сроков.`);
          console.log(`  - Глобальную цель, если задача является ключевой для ее достижения.`);
          affectedEntities = ['project', 'calendar', 'subtasks', 'global_goal'];
          suggestedAdjustments = [
            `Перенести связанные подзадачи.`, 
            `Проверить расписание на конфликты.`,
            `Обновить сроки в календаре.`,
            `Уведомить о переносе сроков.`
          ];
          impactScore = Math.floor(Math.random() * 30) + 30; // 30-60
          psychologicalImpact = impactScore > 50 ? 'medium' : 'low';
          break;
        case 'task_status_changed':
          logs.push(`Анализ: Изменение статуса задачи ${change.entityId} повлияло на:`);
          logs.push(`  - Проект, к которому относится задача (обновление прогресса).`);
          logs.push(`  - Цели, связанные с этой задачей (обновление прогресса).`);
          logs.push(`  - Дневник, для записи завершения.`);
          console.log(`Анализ: Изменение статуса задачи ${change.entityId} повлияло на:`);
          console.log(`  - Проект, к которому относится задача (обновление прогресса).`);
          console.log(`  - Цели, связанные с этой задачей (обновление прогресса).`);
          console.log(`  - Дневник, для записи завершения.`);
          affectedEntities = ['project', 'goals', 'journal'];
          suggestedAdjustments = [
            `Обновить прогресс проекта.`, 
            `Записать в дневник.`,
            `Обновить прогресс цели.`,
            `Отправить уведомление о завершении.`
          ];
          impactScore = Math.floor(Math.random() * 20) + 15; // 15-35
          psychologicalImpact = impactScore > 30 ? 'medium' : 'low';
          break;
        case 'goal_updated':
          logs.push(`Анализ: Обновление цели ${change.entityId} повлияло на:`);
          logs.push(`  - Связанные стратегические цели.`);
          logs.push(`  - Проекты и задачи, привязанные к этой цели.`);
          logs.push(`  - Общий баланс жизни.`);
          console.log(`Анализ: Обновление цели ${change.entityId} повлияло на:`);
          console.log(`  - Связанные стратегические цели.`);
          console.log(`  - Проекты и задачи, привязанные к этой цели.`);
          console.log(`  - Общий баланс жизни.`);
          affectedEntities = ['strategic_goals', 'projects', 'tasks', 'life_balance'];
          suggestedAdjustments = [
            `Пересмотреть связанные проекты и задачи.`, 
            `Оценить влияние на общий баланс жизни.`,
            `Обновить стратегические цели.`,
            `Проверить ресурсы для реализации изменений.`
          ];
          impactScore = Math.floor(Math.random() * 50) + 40; // 40-90
          psychologicalImpact = impactScore > 70 ? 'high' : (impactScore > 50 ? 'medium' : 'low');
          break;
        case 'project_status_changed':
          logs.push(`Анализ: Изменение статуса проекта ${change.entityId} повлияло на:`);
          logs.push(`  - Все задачи внутри проекта.`);
          logs.push(`  - Связанные цели.`);
          logs.push(`  - Календарь, для обновления сроков.`);
          console.log(`Анализ: Изменение статуса проекта ${change.entityId} повлияло на:`);
          console.log(`  - Все задачи внутри проекта.`);
          console.log(`  - Связанные цели.`);
          console.log(`  - Календарь, для обновления сроков.`);
          affectedEntities = ['tasks', 'goals', 'calendar'];
          suggestedAdjustments = [
            `Обновить статус всех задач проекта.`, 
            `Уведомить о прогрессе.`,
            `Обновить сроки в календаре.`,
            `Обновить прогресс связанных целей.`
          ];
          impactScore = Math.floor(Math.random() * 40) + 30; // 30-70
          psychologicalImpact = impactScore > 60 ? 'medium' : 'low';
          break;
        case 'task_added':
          logs.push(`Анализ: Добавление задачи ${change.entityId} повлияло на:`);
          logs.push(`  - Проект, к которому относится задача.`);
          logs.push(`  - Календарь, для добавления в расписание.`);
          logs.push(`  - Связанные цели.`);
          console.log(`Анализ: Добавление задачи ${change.entityId} повлияло на:`);
          console.log(`  - Проект, к которому относится задача.`);
          console.log(`  - Календарь, для добавления в расписание.`);
          console.log(`  - Связанные цели.`);
          affectedEntities = ['project', 'calendar', 'goals'];
          suggestedAdjustments = [
            `Добавить задачу в проект.`, 
            `Добавить задачу в календарь.`,
            `Обновить прогресс цели.`,
            `Проверить баланс нагрузки.`
          ];
          impactScore = Math.floor(Math.random() * 20) + 10; // 10-30
          psychologicalImpact = impactScore > 20 ? 'medium' : 'low';
          break;
        case 'task_priority_changed':
          logs.push(`Анализ: Изменение приоритета задачи ${change.entityId} повлияло на:`);
          logs.push(`  - Календарь, для перестановки в расписании.`);
          logs.push(`  - Проект, к которому относится задача.`);
          logs.push(`  - Связанные цели.`);
          console.log(`Анализ: Изменение приоритета задачи ${change.entityId} повлияло на:`);
          console.log(`  - Календарь, для перестановки в расписании.`);
          console.log(`  - Проект, к которому относится задача.`);
          console.log(`  - Связанные цели.`);
          affectedEntities = ['calendar', 'project', 'goals'];
          suggestedAdjustments = [
            `Переставить задачу в календаре.`, 
            `Обновить приоритет в проекте.`,
            `Обновить приоритет цели.`,
            `Проверить баланс приоритетов.`
          ];
          impactScore = Math.floor(Math.random() * 20) + 10; // 10-30
          psychologicalImpact = impactScore > 20 ? 'medium' : 'low';
          break;
        case 'task_delegated':
          logs.push(`Анализ: Делегирование задачи ${change.entityId} повлияло на:`);
          logs.push(`  - Проект, к которому относится задача.`);
          logs.push(`  - Календарь, для обновления расписания.`);
          logs.push(`  - Связанные цели.`);
          console.log(`Анализ: Делегирование задачи ${change.entityId} повлияло на:`);
          console.log(`  - Проект, к которому относится задача.`);
          console.log(`  - Календарь, для обновления расписания.`);
          console.log(`  - Связанные цели.`);
          affectedEntities = ['project', 'calendar', 'goals'];
          suggestedAdjustments = [
            `Обновить делегирование в проекте.`, 
            `Обновить делегирование в календаре.`,
            `Уведомить делегата.`,
            `Обновить прогресс цели.`
          ];
          impactScore = Math.floor(Math.random() * 20) + 10; // 10-30
          psychologicalImpact = impactScore > 20 ? 'medium' : 'low';
          break;
        default:
          logs.push(`Анализ: Общее изменение типа '${change.type}' для сущности ${change.entityId} повлияло на:`);
          logs.push(`  - Общие зависимости в системе.`);
          console.log(`Анализ: Общее изменение типа '${change.type}' для сущности ${change.entityId} повлияло на:`);
          console.log(`  - Общие зависимости в системе.`);
          affectedEntities = ['general'];
          suggestedAdjustments = [
            'Проверить общие зависимости.',
            'Обновить связанные сущности.',
            'Уведомить пользователя о возможных изменениях.'
          ];
          impactScore = Math.floor(Math.random() * 20) + 10; // 10-30
          psychologicalImpact = impactScore > 25 ? 'medium' : 'low';
      }
    }
    setPropagationLogs(logs); // Сохраняем логи для отображения

    const analysisResult: ChangeImpact = {
      affectedEntities,
      suggestedAdjustments,
      impactScore,
      psychologicalImpact,
    };

    setImpactAnalysis(analysisResult);
    setIsAnalyzing(false);
    console.log('Система изменений: Анализ завершен.', analysisResult);
    return analysisResult;
  }, []);

  // Добавляем useEffect для вывода логов в консоль после обновления состояния
  useEffect(() => {
    if (propagationLogs.length > 0) {
      console.log('--- Цепная реакция распространения изменений ---');
      propagationLogs.forEach(log => console.log(log));
      console.log('------');
    }
  }, [propagationLogs]);

  /**
   * Применяет предложенные корректировки.
   * @param adjustments Корректировки для применения.
   */
  const applyAdjustments = useCallback(async (adjustments: string[]) => {
    console.log('Система изменений: Применение корректировок...', adjustments);
    
    try {
      // Реальное применение корректировок к данным в IndexedDB
      // Получаем последние изменения
      if (lastChange) {
        switch (lastChange.type) {
          case 'task_due_date_changed':
            // Обновляем сроки связанных задач
            console.log('Обновление сроков связанных задач...');
            // Реализация обновления сроков связанных задач
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.tasks.where('relatedTaskId').equals(lastChange.entityId).modify()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Сроки связанных задач обновлены');
            } catch (error) {
              console.error('Ошибка при обновлении связанных задач:', error);
            }
            break;
          case 'task_status_changed':
            // Обновляем прогресс проекта
            console.log('Обновление прогресса проекта...');
            // Реализация обновления прогресса проекта
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.projects.update()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Прогресс проекта обновлен');
            } catch (error) {
              console.error('Ошибка при обновлении прогресса проекта:', error);
            }
            break;
          case 'goal_updated':
            // Обновляем связанные стратегические цели
            console.log('Обновление связанных стратегических целей...');
            // Реализация обновления связанных стратегических целей
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.strategicGoals.update()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Связанные стратегические цели обновлены');
            } catch (error) {
              console.error('Ошибка при обновлении стратегических целей:', error);
            }
            break;
          case 'project_status_changed':
            // Обновляем статус всех задач проекта
            console.log('Обновление статуса всех задач проекта...');
            // Реализация обновления статуса всех задач проекта
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.tasks.where('projectId').equals(lastChange.entityId).modify()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Статус всех задач проекта обновлен');
            } catch (error) {
              console.error('Ошибка при обновлении задач проекта:', error);
            }
            break;
          case 'task_added':
            // Обновляем проект и календарь
            console.log('Обновление проекта и календаря...');
            // Реализация обновления проекта при добавлении задачи
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.projects.update()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Проект и календарь обновлены');
            } catch (error) {
              console.error('Ошибка при обновлении проекта:', error);
            }
            break;
          case 'task_priority_changed':
            // Обновляем приоритет в проекте и календаре
            console.log('Обновление приоритета в проекте и календаре...');
            // Реализация обновления приоритета задачи
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.tasks.update()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Приоритет задачи обновлен');
            } catch (error) {
              console.error('Ошибка при обновлении приоритета задачи:', error);
            }
            break;
          case 'task_delegated':
            // Обновляем делегирование в проекте и календаре
            console.log('Обновление делегирования в проекте и календаре...');
            // Реализация обновления делегирования задачи
            try {
              // В реальной реализации здесь будет код для обновления данных в IndexedDB
              // Например, использование db.tasks.update()
              console.log('В реальной реализации здесь будет код для обновления данных в IndexedDB');
              
              // Для демонстрации создадим имитацию обновления
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('Делегирование задачи обновлено');
            } catch (error) {
              console.error('Ошибка при делегировании задачи:', error);
            }
            break;
          default:
            console.log('Обновление общих зависимостей...');
            // В реальной реализации здесь будет код для обновления данных в IndexedDB
            
            // Для демонстрации создадим имитацию обновления
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Общие зависимости обновлены');
        }
      }
      
      // Имитация задержки для применения корректировок
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Система изменений: Корректировки применены.');
      setImpactAnalysis(null); // Сбросить анализ после применения
      
      // Возвращаем результат применения корректировок
      return {
        success: true,
        message: 'Корректировки успешно применены.',
        appliedAdjustments: adjustments
      };
    } catch (error) {
      console.error('Ошибка при применении корректировок:', error);
      return {
        success: false,
        message: 'Ошибка при применении корректировок.',
        error: error
      };
    }
  }, [lastChange]);

  /**
   * Получает все данные из IndexedDB для анализа.
   */
  const getAllDataForAnalysis = async (): Promise<any> => {
    try {
      const data: any = {};
      
      // Получение данных из всех таблиц
      data.visions = await db.visions.toArray();
      data.globalGoals = await db.globalGoals.toArray();
      data.strategicGoals = await db.strategicGoals.toArray();
      data.projects = await db.projects.toArray();
      data.subProjectsLevel1 = await db.subProjectsLevel1.toArray();
      data.subProjectsLevel2 = await db.subProjectsLevel2.toArray();
      data.tasks = await db.tasks.toArray();
      data.subTasks = await db.subTasks.toArray();
      data.journalEntries = await db.journalEntries.toArray();
      data.ideas = await db.ideas.toArray();
      data.habits = await db.habits.toArray();
      data.notifications = await db.notifications.toArray();
      data.familyMembers = await db.familyMembers.toArray();
      data.familyEvents = await db.familyEvents.toArray();
      data.relationships = await db.relationships.toArray();
      data.userSettings = await db.userSettings.toArray();
      
      return data;
    } catch (error) {
      console.error("Ошибка получения данных для анализа:", error);
      throw error;
    }
  };

  return {
    propagateChange, // Переименовано с analyzeChange
    applyAdjustments,
    lastChange,
    impactAnalysis,
    isAnalyzing,
    propagationLogs, // Добавляем логи для возможного отображения в UI
  };
};