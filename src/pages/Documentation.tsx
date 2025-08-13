// src/pages/Documentation.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTutorial } from '../context/TutorialContext';
import MermaidChart from '@/components/MermaidChart'; // Импортируем MermaidChart
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuTrigger, 
  NavigationMenuContent, 
  NavigationMenuLink 
} from '@/components/ui/navigation-menu';

const Documentation: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [currentDoc, setCurrentDoc] = useState<string>('basics');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');

  const { startTutorial, stopTutorial, currentStep, nextStep, prevStep, resetTutorial } = useTutorial();

  const TUTORIAL_ID = 'documentation-tutorial';
  const TUTORIAL_STEPS_COUNT = 3; // Example: 3 steps for the tutorial

  useEffect(() => {
    // setTutorialTotalSteps(TUTORIAL_ID, TUTORIAL_STEPS_COUNT); // Удалено, так как туториалы будут вызываться по требованию
  }, []);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`/docs/${currentDoc}.md`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        // Filter content based on search term
        const filteredText = searchTerm
          ? text.split('\n').filter(line => line.toLowerCase().includes(searchTerm.toLowerCase())).join('\n')
          : text;
        setMarkdownContent(filteredText);
      } catch (error) {
        console.error("Error fetching markdown:", error);
        setMarkdownContent("## Ошибка загрузки документации\n\nПожалуйста, попробуйте позже.");
      }
    };

    fetchMarkdown();
  }, [currentDoc, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFeedbackSubmit = () => {
    console.log("Отправлена обратная связь:", feedbackText);
    alert("Спасибо за ваш отзыв! Мы получили ваше сообщение.");
    setFeedbackText('');
  };

  // Структура навигации по документации
  const documentationStructure = [
    {
      title: "Введение",
      items: [
        { id: "basics", title: "Основы системы" },
        { id: "harmony-functions", title: "Функциональность системы" },
        { id: "action-plan", title: "План действий" }
      ]
    },
    {
      title: "Управление целями",
      items: [
        { id: "goals", title: "Управление целями" }
      ]
    }
  ];

  return (
    <div className="flex h-full">
      {/* Боковая навигация */}
      <div className="w-64 border-r bg-background p-4">
        <h2 className="text-lg font-semibold mb-4" id="doc-sections-title">Разделы документации</h2>
        <Input
          type="text"
          placeholder="Поиск по документации..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
          id="search-input"
        />
        
        {/* Навигация по документации */}
        <NavigationMenu orientation="vertical" className="w-full">
          <NavigationMenuList className="flex-col items-start space-y-2">
            {documentationStructure.map((section, index) => (
              <NavigationMenuItem key={index} className="w-full">
                <NavigationMenuTrigger className="w-full justify-start font-semibold">
                  {section.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-full">
                  <ul className="grid w-full gap-1 p-2">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <NavigationMenuLink
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                            currentDoc === item.id ? 'bg-accent text-accent-foreground' : ''
                          }`}
                          onClick={() => setCurrentDoc(item.id)}
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Визуализация схемы данных Mermaid */}
        <div className="mt-8 p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Схема данных системы "Гармония"</h3>
          <MermaidChart chart={`erDiagram
    ВИДЕНИЕ ||--o{ ГЛОБАЛЬНАЯ_ЦЕЛЬ : "формирует"
    ГЛОБАЛЬНАЯ_ЦЕЛЬ ||--o{ СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ : "состоит из"
    СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ ||--o{ ПРОЕКТ : "реализуется через"
    СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ ||--o{ ОДИНОКАЯ_ЗАДАЧА : "включает"
    ПРОЕКТ ||--o{ ПОДПРОЕКТ_УРОВЕНЬ1 : "состоит из"
    ПОДПРОЕКТ_УРОВЕНЬ1 ||--o{ ПОДПРОЕКТ_УРОВЕНЬ2 : "состоит из"
    ПОДПРОЕКТ_УРОВЕНЬ2 ||--o{ ЗАДАЧА : "состоит из"
    ПРОЕКТ ||--o{ ЗАДАЧА : "состоит из"
    ЗАДАЧА ||--o{ ПОДЗАДАЧА : "содержит"
    
    ЗАПИСЬ_ДНЕВНИКА }o--|| ВИДЕНИЕ : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ГЛОБАЛЬНАЯ_ЦЕЛЬ : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ПРОЕКТ : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ПОДПРОЕКТ_УРОВЕНЬ1 : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ПОДПРОЕКТ_УРОВЕНЬ2 : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ЗАДАЧА : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА }o--|| ПОДЗАДАЧА : "ссылается на"
    ЗАПИСЬ_ДНЕВНИКА ||--o{ ИДЕЯ : "формирует"
    
    ИДЕЯ }o--|| ВИДЕНИЕ : "влияет на"
    ИДЕЯ }o--|| ГЛОБАЛЬНАЯ_ЦЕЛЬ : "приводит к созданию"
    ИДЕЯ }o--|| СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ : "приводит к созданию"
    ИДЕЯ }o--|| ПРОЕКТ : "приводит к созданию"
    
    ПРИВЫЧКА }o--|| ГЛОБАЛЬНАЯ_ЦЕЛЬ : "поддерживает"
    ПРИВЫЧКА }o--|| СТРАТЕГИЧЕСКАЯ_ЦЕЛЬ : "поддерживает"
    ПРИВЫЧКА }o--|| ПРОЕКТ : "поддерживает"
    ПРИВЫЧКА }o--|| ЗАДАЧА : "поддерживает"`} />
        </div>
      </div>

      {/* Область содержимого документации */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="prose dark:prose-invert max-w-none" id="documentation-content">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>

          {/* Форма обратной связи */}
          <div className="mt-8 p-4 border rounded-lg bg-card" id="feedback-form">
            <h3 className="text-lg font-semibold mb-4">Обратная связь</h3>
            <Textarea
              placeholder="Ваши предложения или замечания..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleFeedbackSubmit}>Отправить отзыв</Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Documentation;