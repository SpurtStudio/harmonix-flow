// src/pages/Motivation.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Motivation: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Социальные факторы и мотивация</h1>

      {/* Профиль мотивации пользователя */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль мотивации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Здесь будет отображаться ваш профиль мотивации, основанный на ваших целях, привычках и дневнике.
          </p>
          <Button variant="outline" className="mt-2">Настроить профиль</Button>
        </CardContent>
      </Card>

      {/* Система "Доказательств" прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Доказательства прогресса</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Визуализация ваших достижений и прогресса по целям и задачам.
          </p>
          <Button variant="outline" className="mt-2">Посмотреть доказательства</Button>
        </CardContent>
      </Card>

      {/* Техники преодоления прокрастинации */}
      <Card>
        <CardHeader>
          <CardTitle>Преодоление прокрастинации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Инструменты и техники, которые помогут вам бороться с прокрастинацией.
          </p>
          <Button variant="outline" className="mt-2">Изучить техники</Button>
        </CardContent>
      </Card>

      {/* Регулярные опросы */}
      <Card>
        <CardHeader>
          <CardTitle>Регулярные опросы</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Еженедельные опросы об удовлетворенности сферами жизни и общем мировосприятии.
          </p>
          <Button variant="outline" className="mt-2">Пройти опрос</Button>
        </CardContent>
      </Card>

      {/* Заглушки для других функций мотивации */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Дополнительный функционал мотивации (Заглушки)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Социальные триггеры: дележ достижений, нетворкинг.</p>
          <p>Позитивное подкрепление через персонализированные сообщения.</p>
          <p>Система оперативных изменений: автоматическая адаптация мотивационных стратегий при изменениях в планах, предложение специфических техник для преодоления препятствий, анализ влияния изменений на уровень мотивации.</p>
          <p>Интеграция с целями, задачами, дневником, привычками.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Motivation;