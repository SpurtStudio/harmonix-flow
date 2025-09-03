import React from 'react';
import CircularBalanceIndicator from './CircularBalanceIndicator';
import CircularFocusIndicator from './CircularFocusIndicator';
import { Card } from '@/components/ui/card';
import HelpTooltip from './HelpTooltip';

interface PersistentCircularLayoutProps {
  children: React.ReactNode;
}

export const PersistentCircularLayout: React.FC<PersistentCircularLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full p-6 space-y-8">
      {/* Persistent Circular Balance Indicator */}
      <Card className="card-glass p-8 mb-8">
        <div className="text-center mb-6">
          <HelpTooltip content="Центральный индикатор баланса с кликабельными сферами жизни вокруг.">
            <h2 className="text-2xl font-space font-semibold text-foreground mb-2">
              Индикатор баланса жизни
            </h2>
          </HelpTooltip>
          <p className="text-muted-foreground">
            Нажмите на любую сферу для перехода к детальному просмотру
          </p>
        </div>
        <CircularBalanceIndicator />
      </Card>

      {/* Persistent Focus Indicator */}
      <Card className="card-glass p-6 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-space font-semibold text-foreground mb-2">
            Фокус дня
          </h2>
          <p className="text-muted-foreground">
            Ваш прогресс и приоритеты на сегодня
          </p>
        </div>
        <CircularFocusIndicator />
      </Card>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};