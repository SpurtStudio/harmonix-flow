import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimplifiedHealth: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Здоровье</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Здоровье</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал здоровья временно упрощен для стабильной работы главной страницы.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedHealth;