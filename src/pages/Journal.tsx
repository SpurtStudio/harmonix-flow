import React, { useState } from 'react';
import { BookOpen, Plus, Mic, Image, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockEntries = [
  {
    id: 1,
    date: '2024-01-15',
    title: 'Утренние размышления',
    content: 'Сегодня особенно хороший день для планирования новых проектов. Чувствую прилив энергии и мотивации.',
    mood: 'positive',
    tags: ['планирование', 'мотивация'],
    type: 'text'
  },
  {
    id: 2,
    date: '2024-01-14',
    title: 'Анализ недели',
    content: 'Неделя была продуктивной, но нужно больше времени уделять отдыху и восстановлению.',
    mood: 'neutral',
    tags: ['рефлексия', 'баланс'],
    type: 'text'
  },
  {
    id: 3,
    date: '2024-01-13',
    title: 'Идеи для проекта',
    content: 'Записал голосовую заметку с идеями для нового проекта во время прогулки.',
    mood: 'excited',
    tags: ['идеи', 'проект'],
    type: 'voice'
  }
];

const moodColors = {
  positive: 'bg-success/20 text-success border-success/30',
  neutral: 'bg-accent/20 text-accent-foreground border-accent/30',
  excited: 'bg-primary/20 text-primary border-primary/30',
  thoughtful: 'bg-secondary/20 text-secondary border-secondary/30'
};

export default function Journal() {
  const [isRecording, setIsRecording] = useState(false);
  const [newEntry, setNewEntry] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    // Здесь будет интеграция с локальным Whisper
    setTimeout(() => setIsRecording(false), 3000); // Имитация записи
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дневник</h1>
          <p className="text-muted-foreground mt-1">
            Записывайте мысли, анализируйте прогресс
          </p>
        </div>
      </div>

      <Tabs defaultValue="write" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="write">Написать</TabsTrigger>
          <TabsTrigger value="entries">Записи</TabsTrigger>
          <TabsTrigger value="analysis">Анализ</TabsTrigger>
          <TabsTrigger value="reviews">Обзоры</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Writing Area */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Новая запись
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Заголовок записи" 
                    className="bg-background/50"
                  />
                  
                  <Textarea 
                    placeholder="Что у вас на уме?..." 
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    className="min-h-[300px] bg-background/50"
                  />
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartRecording}
                        className={isRecording ? 'bg-primary/20 border-primary' : ''}
                      >
                        <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-primary animate-pulse' : ''}`} />
                        {isRecording ? 'Запись...' : 'Голос'}
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        Фото
                      </Button>
                    </div>
                    
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tools */}
            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Утренние страницы
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Обзор дня
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Рефлексия
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
                <CardHeader>
                  <CardTitle>Подсказки для записи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    • Что сегодня дало мне энергию?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • За что я благодарен?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Какой урок я извлек?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Что хочу улучшить завтра?
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск записей..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Фильтр по дате
            </Button>
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            {mockEntries.map((entry) => (
              <Card key={entry.id} className="backdrop-blur-xl bg-surface/80 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={moodColors[entry.mood as keyof typeof moodColors]}
                      >
                        {entry.type === 'voice' ? 'Голос' : 'Текст'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{entry.content}</p>
                  <div className="flex items-center gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  ИИ-анализ записей будет добавлен в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardContent className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Периодические обзоры будут добавлены в следующем обновлении
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}