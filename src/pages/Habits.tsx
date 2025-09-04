import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Habits: React.FC = () => {
  return (
    <PageWrapper title="Привычки">
      <Card>
        <CardHeader>
          <CardTitle>Привычки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал привычек временно упрощен для стабильной работы главной страницы.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default Habits;
        description: habitData.description,
        frequency: habitData.frequency,
        progress: 0, // Начальный прогресс
        reminderTime: habitData.reminderTime,
        reminderEnabled: habitData.reminderEnabled,
        alternatingEnabled: habitData.alternatingEnabled,
        alternatingPattern: habitData.alternatingPattern,
        streak: 0,
        bestStreak: 0
      };
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'habit_added',
        entityId: 0, // ID будет присвоен при добавлении
        oldValue: null,
        newValue: newHabit
      });
      
      await db.habits.add(newHabit);
      
      // Применяем корректировки, если есть
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        await applyAdjustments(changeResult.suggestedAdjustments);
      }
      
      // Перезагружаем привычки после добавления
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);
      alert('Привычка добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении привычки:', error);
      alert('Ошибка при добавлении привычки.');
    }
  }, []);

  // Функция для обновления прогресса привычки
  const updateHabitProgress = useCallback(async (habitId: number, newProgress: number) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'habit_progress_updated',
        entityId: habitId,
        oldValue: { ...habit },
        newValue: { ...habit, progress: newProgress }
      });
      
      await db.habits.update(habitId, { progress: Math.min(100, Math.max(0, newProgress)) });
      
      // Применяем корректировки, если есть
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        await applyAdjustments(changeResult.suggestedAdjustments);
      }
      
      // Обновляем состояние привычек
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Ошибка при обновлении прогресса привычки:', error);
      alert('Ошибка при обновлении прогресса привычки.');
    }
  }, [habits]);

  // Функция для увеличения прогресса привычки
  const incrementHabitProgress = useCallback((habitId: number, increment: number = 10) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      // Обновляем серию выполнений
      const today = new Date().toDateString();
      const lastCompleted = habit.lastCompletedDate?.toDateString();
      let streak = habit.streak || 0;
      let bestStreak = habit.bestStreak || 0;
      
      if (lastCompleted !== today) {
        // Если привычка не выполнялась сегодня, увеличиваем серию
        streak += 1;
        if (streak > (bestStreak || 0)) {
          bestStreak = streak;
        }
      }
      
      // Используем систему оперативных изменений
      const changeResult = propagateChange({
        type: 'habit_completed',
        entityId: habitId,
        oldValue: { ...habit },
        newValue: { ...habit, progress: Math.min(100, (habit.progress || 0) + increment), streak, bestStreak, lastCompletedDate: new Date() }
      });
      
      updateHabitProgress(habitId, Math.min(100, (habit.progress || 0) + increment));
      
      // Применяем корректировки, если есть
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        applyAdjustments(changeResult.suggestedAdjustments);
      }
    }
  }, [habits, updateHabitProgress]);

  // Функция для сброса прогресса привычки
  const resetHabitProgress = useCallback((habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      // Используем систему оперативных изменений
      const changeResult = propagateChange({
        type: 'habit_reset',
        entityId: habitId,
        oldValue: { ...habit },
        newValue: { ...habit, progress: 0, streak: 0 }
      });
      
      updateHabitProgress(habitId, 0);
      
      // Применяем корректировки, если есть
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        applyAdjustments(changeResult.suggestedAdjustments);
      }
    }
  }, [habits, updateHabitProgress]);

  const handleEditHabit = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    setIsEditHabitDialogOpen(true);
  }, []);

  const handleSaveEditedHabit = useCallback(async (updatedHabit: Habit) => {
    try {
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'habit_updated',
        entityId: updatedHabit.id!,
        oldValue: habits.find(h => h.id === updatedHabit.id) || null,
        newValue: updatedHabit
      });
      
      await db.habits.update(updatedHabit.id!, updatedHabit);
      
      // Применяем корректировки, если есть
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        await applyAdjustments(changeResult.suggestedAdjustments);
      }
      
      // Обновляем состояние привычек
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);
      setIsEditHabitDialogOpen(false);
      alert('Привычка обновлена!');
    } catch (error) {
      console.error('Ошибка при обновлении привычки:', error);
      alert('Ошибка при обновлении привычки.');
    }
  }, [habits]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Привычки</h1>

      {/* Добавление новой привычки */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить новую привычку</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setIsAddHabitDialogOpen(true)} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить привычку
          </Button>
        </CardContent>
      </Card>

      {/* Список привычек */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши привычки</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет привычек. Добавьте первую!</p>
          ) : (
            <ul className="space-y-4">
              {habits.map(habit => (
                <li key={habit.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                      <p className="text-sm text-gray-400">{habit.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Частота: {habit.frequency}</p>
                      {habit.reminderEnabled && (
                        <p className="text-xs text-gray-500 mt-1">Напоминание: {habit.reminderTime}</p>
                      )}
                      {habit.alternatingEnabled && (
                        <p className="text-xs text-gray-500 mt-1">Чередование: {habit.alternatingPattern?.join(' → ')}</p>
                      )}
                      {habit.streak !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">Серия: {habit.streak} (лучшая: {habit.bestStreak || 0})</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => incrementHabitProgress(habit.id!, 10)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        +10%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resetHabitProgress(habit.id!)}
                        variant="destructive"
                      >
                        Сброс
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditHabit(habit)}
                        variant="outline"
                      >
                        Редактировать
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Прогресс</span>
                      <span>{habit.progress || 0}%</span>
                    </div>
                    <Progress value={habit.progress || 0} className="w-full" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Реализованный функционал привычек */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Функционал привычек</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ Отслеживание регулярности с визуализацией прогресса.</p>
          <p>✓ Напоминания и мотивационные уведомления.</p>
          <p>✓ Анализ связи между привычками и достижением целей.</p>
          <p>✓ Режим "чередования привычек" для предотвращения выгорания.</p>
          <p>✓ Система оперативных изменений: автоматическая корректировка графика привычек при изменении расписания, предложение альтернативных временных слотов, анализ влияния изменений.</p>
          <p>✓ Интеграция с календарем, дневником, модулем мотивации.</p>
        </CardContent>
      </Card>
      
      <AddHabitDialog
        isOpen={isAddHabitDialogOpen}
        onClose={() => setIsAddHabitDialogOpen(false)}
        onSave={handleAddHabit}
      />
      
      <EditHabitDialog
        habit={selectedHabit}
        isOpen={isEditHabitDialogOpen}
        onClose={() => setIsEditHabitDialogOpen(false)}
        onSave={handleSaveEditedHabit}
      />
    </div>
  );
};

export default Habits;