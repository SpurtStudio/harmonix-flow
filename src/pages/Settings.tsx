import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Palette, Globe, Database, Zap, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { startSync, stopSync } from '@/lib/sync';
import { db } from '@/lib/db';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [localMode, setLocalMode] = useState(true);
  const {
    isBeginnerMode,
    toggleBeginnerMode,
    isLowMood,
    setLowMood,
    isPowerSavingMode,
    togglePowerSavingMode,
    hideAnxietyElements,
    toggleHideAnxietyElements,
  } = useUserPreferences();

  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleClearLocalData = async () => {
    if (window.confirm('Вы уверены, что хотите очистить все локальные данные? Это действие необратимо.')) {
      try {
        await db.delete();
        localStorage.clear();
        alert('Все локальные данные успешно очищены. Приложение будет перезагружено.');
        window.location.reload();
      } catch (error) {
        console.error('Ошибка при очистке локальных данных:', error);
        alert('Произошла ошибка при очистке данных. Пожалуйста, попробуйте снова.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground mt-1">
            Персонализация и безопасность приложения
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="privacy">Приватность</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="ai">ИИ-помощник</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Общие настройки</h2>
          <Separator />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appearance */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Внешний вид
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Темная тема</Label>
                    <p className="text-sm text-muted-foreground">
                      Переключить на темный режим
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Язык интерфейса</Label>
                  <Select defaultValue="ru">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select defaultValue="moscow">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moscow">Москва (UTC+3)</SelectItem>
                      <SelectItem value="spb">Санкт-Петербург (UTC+3)</SelectItem>
                      <SelectItem value="ekb">Екатеринбург (UTC+5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Настройки отображения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Режим новичка</Label>
                    <p className="text-sm text-muted-foreground">
                      Включает дополнительные подсказки и упрощенный интерфейс
                    </p>
                  </div>
                  <Switch
                    checked={isBeginnerMode}
                    onCheckedChange={toggleBeginnerMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Режим низкого настроения</Label>
                    <p className="text-sm text-muted-foreground">
                      Активирует более спокойную цветовую схему и скрывает тревожные элементы
                    </p>
                  </div>
                  <Switch
                    checked={isLowMood}
                    onCheckedChange={setLowMood}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Режим энергосбережения</Label>
                    <p className="text-sm text-muted-foreground">
                      Отключает анимации для экономии заряда батареи
                    </p>
                  </div>
                  <Switch
                    checked={isPowerSavingMode}
                    onCheckedChange={togglePowerSavingMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Скрыть тревожные элементы</Label>
                    <p className="text-sm text-muted-foreground">
                      Скрывает индикаторы прогресса и счетчики задач
                    </p>
                  </div>
                  <Switch
                    checked={hideAnxietyElements}
                    onCheckedChange={toggleHideAnxietyElements}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Персональная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input placeholder="Ваше имя" defaultValue="Пользователь" />
                </div>
                
                <div className="space-y-2">
                  <Label>Возраст</Label>
                  <Input type="number" placeholder="25" defaultValue="25" />
                </div>

                <div className="space-y-2">
                  <Label>Целевой возраст (для индикатора времени)</Label>
                  <Input type="number" placeholder="75" defaultValue="75" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Показывать индикатор времени</Label>
                    <p className="text-sm text-muted-foreground">
                      Позитивная визуализация жизненного пути
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Приватность и безопасность</h2>
          <Separator />
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Приватность и безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${localMode ? 'bg-success' : 'bg-primary'}`}></div>
                  <div>
                    <div className="font-medium">
                      {localMode ? 'Локальный режим' : 'Облачный режим'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {localMode
                        ? 'Все данные хранятся на вашем устройстве'
                        : 'Данные синхронизируются с облаком'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localMode}
                  onCheckedChange={setLocalMode}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Разрешения</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Доступ к микрофону</Label>
                    <p className="text-sm text-muted-foreground">
                      Для голосовых записей в дневнике
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    Разрешено
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Доступ к камере</Label>
                    <p className="text-sm text-muted-foreground">
                      Для добавления фото в записи
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/30">
                    Не запрошено
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Локальное распознавание речи</Label>
                    <p className="text-sm text-muted-foreground">
                      Whisper для обработки голоса на устройстве
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-border/30">
                <Button variant="outline" className="w-full">
                  Экспорт всех данных
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Уведомления</h2>
          <Separator />
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Включить уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Общий переключатель для всех уведомлений
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              {notifications && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Напоминания о задачах</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомления о предстоящих задачах
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ежедневные обзоры</Label>
                      <p className="text-sm text-muted-foreground">
                        Напоминание записать в дневник
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Мотивационные сообщения</Label>
                      <p className="text-sm text-muted-foreground">
                        Персонализированные сообщения поддержки
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Интеграция с мессенджерами</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Настроить Telegram
                      </Button>
                      <Button variant="outline" size="sm">
                        Настроить WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">ИИ-помощник</h2>
          <Separator />
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                ИИ-помощник
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Включить ИИ-рекомендации</Label>
                  <p className="text-sm text-muted-foreground">
                    Умные предложения для планирования
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Режим обработки</Label>
                <Select defaultValue="local">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Только локально (базовые функции)</SelectItem>
                    <SelectItem value="cloud">Облачный ИИ (премиум)</SelectItem>
                    <SelectItem value="hybrid">Гибридный режим</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Голосовой ввод</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Локальный Whisper</span>
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    Активен
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Text-to-Speech</Label>
                  <p className="text-sm text-muted-foreground">
                    Озвучивание рекомендаций и планов
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Детализация ИИ-анализа</Label>
                <Select defaultValue="balanced">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Минимальная</SelectItem>
                    <SelectItem value="balanced">Сбалансированная</SelectItem>
                    <SelectItem value="detailed">Детальная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Управление данными</h2>
          <Separator />
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Управление данными
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">2.4 МБ</div>
                  <p className="text-sm text-muted-foreground">Локальные данные</p>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">156</div>
                  <p className="text-sm text-muted-foreground">Записей в дневнике</p>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-border/30">
                  <div className="text-2xl font-bold text-foreground">23</div>
                  <p className="text-sm text-muted-foreground">Активных цели</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Синхронизация</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Автоматическое резервное копирование</Label>
                    <p className="text-sm text-muted-foreground">
                      Ежедневное сохранение данных локально
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Облачная синхронизация</Label>
                    <p className="text-sm text-muted-foreground">
                      Требует премиум-подписку
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/30">
                    Недоступно
                  </Badge>
                </div>

                <Button onClick={startSync} className="w-full">
                  Начать синхронизацию (заглушка)
                </Button>
              </div>

              <div className="pt-4 border-t border-border/30 space-y-3">
                <Button variant="outline" className="w-full">
                  Создать резервную копию
                </Button>
                <Button variant="outline" className="w-full">
                  Импорт данных
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleClearLocalData}>
                  Очистить все данные
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}