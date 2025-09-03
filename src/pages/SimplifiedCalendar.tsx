import React from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimplifiedCalendar: React.FC = () => {
  return (
    <PageWrapper title="Календарь">
      <Card>
        <CardHeader>
          <CardTitle>Умный календарь</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Модуль календаря временно упрощен. Здесь будет интегрированный календарь с умным планированием и балансировкой задач.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default SimplifiedCalendar;