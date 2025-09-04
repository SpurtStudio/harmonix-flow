import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Health: React.FC = () => {
  return (
    <PageWrapper title="Здоровье">
      <Card>
        <CardHeader>
          <CardTitle>Здоровье</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал здоровья временно упрощен для стабильной работы главной страницы с новыми круговыми индикаторами.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default Health;