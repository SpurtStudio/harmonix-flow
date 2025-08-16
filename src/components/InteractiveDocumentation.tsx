import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HelpTooltip from '@/components/HelpTooltip';
import { Link } from 'react-router-dom';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  tooltip: string;
}

export const InteractiveDocumentation: React.FC = () => {
  const [sections, setSections] = useState<DocumentationSection[]>([
    {
      id: 'life-balance',
      title: 'Баланс жизни',
      content: 'Визуализация баланса жизни показывает ваш прогресс по 8 ключевым сферам: Работа, Здоровье, Отношения, Развитие, Хобби, Отдых, Финансы, Духовность.',
      tooltip: 'Наведите на элементы диаграммы для получения подробной информации по каждой сфере жизни'
    },
    {
      id: 'energy-level',
      title: 'Уровень энергии',
      content: 'Состояние энергии рассчитывается на основе данных из вашего дневника и привычек. Следите за этим показателем для оптимизации своей продуктивности.',
      tooltip: 'Уровень энергии влияет на рекомендации по планированию задач'
    },
    {
      id: 'change-system',
      title: 'Система изменений',
      content: 'Система оперативных изменений анализирует влияние ваших действий на другие элементы системы и предлагает корректировки.',
      tooltip: 'Используйте режим "Что-если" для моделирования изменений'
    },
    {
      id: 'ai-recommendations',
      title: 'Рекомендации ИИ',
      content: 'Искусственный интеллект анализирует ваши данные и предлагает персонализированные рекомендации для улучшения баланса жизни.',
      tooltip: 'Рекомендации ИИ обновляются при каждом изменении данных'
    }
  ]);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Функция для обработки наведения на элементы интерфейса
  const handleElementHover = (elementId: string) => {
    const section = sections.find(s => s.id === elementId);
    if (section) {
      setActiveSection(elementId);
    }
  };

  // Добавляем обработчики событий для элементов интерфейса
  useEffect(() => {
    // В реальной реализации здесь будут добавлены обработчики событий
    // для элементов интерфейса, при наведении на которые будет отображаться
    // соответствующая документация
    
    // Пример:
    // const elements = document.querySelectorAll('[data-doc-id]');
    // elements.forEach(element => {
    //   element.addEventListener('mouseenter', (e) => {
    //     const docId = (e.target as HTMLElement).getAttribute('data-doc-id');
    //     if (docId) handleElementHover(docId);
    //   });
    // });
    
    // Для демонстрации сразу активируем первую секцию
    setActiveSection('life-balance');
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Контекстная справка
          <HelpTooltip content="Наведите курсор на элементы интерфейса для получения контекстной помощи" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSection ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                {sections.find(s => s.id === activeSection)?.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {sections.find(s => s.id === activeSection)?.content}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Подсказка: {sections.find(s => s.id === activeSection)?.tooltip}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Наведите курсор на элементы интерфейса для получения контекстной помощи
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="outline"
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="text-xs"
              >
                {section.title}
              </Button>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Подробнее в <Link to="/documentation" className="text-blue-500 cursor-pointer hover:underline">полном руководстве</Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};