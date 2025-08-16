import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { db, HealthIndicator } from '../lib/db';
import { queryAI } from '../lib/api';

export const AIHealthAnalysis: React.FC = () => {
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const loadIndicators = async () => {
    try {
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
    } catch (error) {
      console.error('Ошибка при загрузке показателей:', error);
      alert('Ошибка при загрузке показателей');
    }
  };

  const analyzeWithAI = async (prompt: string) => {
    try {
      setIsAnalyzing(true);
      
      // Подготовка данных для анализа
      const dataForAnalysis = {
        indicators: indicators.map(i => ({
          name: i.name,
          value: i.value,
          unit: i.unit,
          timestamp: i.timestamp
        })),
        prompt: prompt
      };
      
      // Запрос к AI
      const aiResponse = await queryAI('analyzeHealthData', dataForAnalysis);
      
      if (aiResponse && aiResponse.response) {
        setAiAnalysis(aiResponse.response);
      } else {
        setAiAnalysis('Не удалось получить анализ от ИИ. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка при анализе данных ИИ:', error);
      setAiAnalysis('Произошла ошибка при анализе данных. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAnalysis = async () => {
    const prompt = "Проанализируйте данные о здоровье пользователя и дайте персонализированные рекомендации по улучшению состояния здоровья. Обратите внимание на возможные проблемы и риски, а также предложите конкретные действия для их устранения.";
    await analyzeWithAI(prompt);
  };

  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) {
      alert('Пожалуйста, введите запрос для анализа.');
      return;
    }
    await analyzeWithAI(customPrompt);
  };

  const handleCreateHealthGoal = async () => {
    if (!aiAnalysis) {
      alert('Сначала выполните анализ ИИ.');
      return;
    }
    
    try {
      // В реальной реализации здесь будет код для создания цели в системе
      console.log('Создание цели из анализа ИИ:', aiAnalysis);
      alert(`Цель создана на основе анализа ИИ: ${aiAnalysis.substring(0, 50)}...`);
    } catch (error) {
      console.error('Ошибка при создании цели:', error);
      alert('Ошибка при создании цели.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-анализ здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadIndicators} variant="outline">
              Загрузить данные
            </Button>
            <Button onClick={handleQuickAnalysis} disabled={isAnalyzing || indicators.length === 0}>
              {isAnalyzing ? 'Анализ...' : 'Быстрый анализ'}
            </Button>
          </div>
          
          {indicators.length > 0 && (
            <div className="text-sm text-gray-500">
              Загружено {indicators.length} показателей здоровья
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="customPrompt" className="block text-sm font-medium">
              Пользовательский запрос
            </label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Введите свой запрос для ИИ-анализа..."
              rows={3}
            />
            <Button 
              onClick={handleCustomAnalysis} 
              disabled={isAnalyzing || !customPrompt.trim() || indicators.length === 0}
              className="w-full"
            >
              {isAnalyzing ? 'Анализ...' : 'Анализ по запросу'}
            </Button>
          </div>
          
          {aiAnalysis && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Результаты ИИ-анализа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{aiAnalysis}</pre>
                </div>
                <div className="mt-4">
                  <Button onClick={handleCreateHealthGoal} variant="outline">
                    Создать цель из анализа
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
