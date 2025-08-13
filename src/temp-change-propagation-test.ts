// src/temp-change-propagation-test.ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useChangePropagation } from './hooks/use-change-propagation';

const TestComponent: React.FC = () => {
  const { analyzeChange, applyAdjustments, lastChange, impactAnalysis, isAnalyzing } = useChangePropagation();

  const handleTaskMove = () => {
    analyzeChange({
      type: 'task_moved',
      entityId: 123,
      oldValue: '2025-01-01',
      newValue: '2025-01-05'
    });
  };

  const handleGoalUpdate = () => {
    analyzeChange({
      type: 'goal_updated',
      entityId: 456,
      oldValue: 'Старая формулировка цели',
      newValue: 'Новая формулировка цели'
    });
  };

  const handleApply = () => {
    if (impactAnalysis) {
      applyAdjustments(impactAnalysis.suggestedAdjustments);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Тест Системы Оперативных Изменений</h1>
      <div className="space-x-4 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleTaskMove}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Анализ...' : 'Имитировать перенос задачи'}
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleGoalUpdate}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Анализ...' : 'Имитировать обновление цели'}
        </button>
      </div>

      {lastChange && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold">Последнее изменение:</h2>
          <pre>{JSON.stringify(lastChange, null, 2)}</pre>
        </div>
      )}

      {impactAnalysis && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold">Анализ влияния:</h2>
          <p>Затронутые сущности: {impactAnalysis.affectedEntities.join(', ')}</p>
          <p>Предлагаемые корректировки: {impactAnalysis.suggestedAdjustments.join('; ')}</p>
          <p>Оценка влияния: {impactAnalysis.impactScore}</p>
          <p>Психологическое влияние: {impactAnalysis.psychologicalImpact}</p>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
            onClick={handleApply}
            disabled={isAnalyzing}
          >
            Применить корректировки
          </button>
        </div>
      )}

      {isAnalyzing && <p className="text-blue-500">Выполняется анализ влияния...</p>}
    </div>
  );
};

// Для запуска этого компонента, вам нужно будет временно изменить src/main.tsx
// или создать отдельный тестовый HTML-файл.
// Например, временно замените содержимое App в src/main.tsx на TestComponent:
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <TestComponent />
//   </React.StrictMode>,
// );