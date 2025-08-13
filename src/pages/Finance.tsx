// src/pages/Finance.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import HelpTooltip from '../components/HelpTooltip';
import { db, FinancialGoal, FinancialTransaction, FinancialCategory } from '../lib/db';
import { useChangePropagation } from '../hooks/use-change-propagation';
import { getLifeBalanceRecommendations } from '../lib/ai';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';

const Finance: React.FC = () => {
  // Состояния для финансовых целей
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    priority: 5,
    category: '',
    status: 'active' as 'active' | 'completed' | 'on hold'
  });

  // Состояния для транзакций
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    projectId: undefined as number | undefined
  });

  // Состояния для категорий
  const [financialCategories, setFinancialCategories] = useState<FinancialCategory[]>([]);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6',
    budget: undefined as number | undefined
  });

  // Состояния для анализа
  const [balanceAnalysis, setBalanceAnalysis] = useState<string | null>(null);
  const [isAnalyzingBalance, setIsAnalyzingBalance] = useState(false);
  const [financialOverview, setFinancialOverview] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    savingsRate: 0
  });

  // Состояния для фильтров
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { propagateChange, applyAdjustments } = useChangePropagation();

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загрузка финансовых целей
        const loadedGoals = await db.financialGoals.toArray();
        setFinancialGoals(loadedGoals);

        // Загрузка транзакций
        const loadedTransactions = await db.financialTransactions.toArray();
        setFinancialTransactions(loadedTransactions);

        // Загрузка категорий
        const loadedCategories = await db.financialCategories.toArray();
        setFinancialCategories(loadedCategories);

        // Расчет финансового обзора
        calculateFinancialOverview(loadedTransactions);
      } catch (error) {
        console.error('Ошибка при загрузке финансовых данных:', error);
      }
    };
    loadData();
  }, []);

  // Расчет финансового обзора
  const calculateFinancialOverview = (transactions: FinancialTransaction[]) => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    
    setFinancialOverview({
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate
    });
  };

  // Обработчики для целей
  const handleAddGoal = useCallback(async () => {
    if (!newGoal.name.trim() || !newGoal.category.trim()) {
      alert('Название и категория цели не могут быть пустыми.');
      return;
    }
    
    try {
      const goalId = await db.financialGoals.add({
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        currentAmount: newGoal.currentAmount,
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
        priority: newGoal.priority,
        category: newGoal.category,
        status: newGoal.status
      });
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'financial_goal_added',
        entityId: goalId,
        oldValue: null,
        newValue: newGoal
      });
      
      console.log('Анализ влияния изменений:', changeResult);
      
      // Обновление списка целей
      const loadedGoals = await db.financialGoals.toArray();
      setFinancialGoals(loadedGoals);
      
      // Сброс формы
      setNewGoal({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        priority: 5,
        category: '',
        status: 'active'
      });
      setIsAddGoalDialogOpen(false);
      
      alert('Финансовая цель добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении финансовой цели:', error);
      alert('Ошибка при добавлении финансовой цели.');
    }
  }, [newGoal, propagateChange]);

  // Обработчики для транзакций
  const handleAddTransaction = useCallback(async () => {
    if (!newTransaction.category.trim()) {
      alert('Категория транзакции не может быть пустой.');
      return;
    }
    
    try {
      const transactionId = await db.financialTransactions.add({
        date: new Date(newTransaction.date),
        amount: newTransaction.type === 'income' ? newTransaction.amount : -Math.abs(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        description: newTransaction.description || undefined,
        projectId: newTransaction.projectId
      });
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'financial_transaction_added',
        entityId: transactionId,
        oldValue: null,
        newValue: newTransaction
      });
      
      console.log('Анализ влияния изменений:', changeResult);
      
      // Обновление списка транзакций
      const loadedTransactions = await db.financialTransactions.toArray();
      setFinancialTransactions(loadedTransactions);
      
      // Пересчет финансового обзора
      calculateFinancialOverview(loadedTransactions);
      
      // Сброс формы
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'expense',
        category: '',
        description: '',
        projectId: undefined
      });
      setIsAddTransactionDialogOpen(false);
      
      alert('Транзакция добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении транзакции:', error);
      alert('Ошибка при добавлении транзакции.');
    }
  }, [newTransaction, propagateChange]);

  // Обработчики для категорий
  const handleAddCategory = useCallback(async () => {
    if (!newCategory.name.trim()) {
      alert('Название категории не может быть пустым.');
      return;
    }
    
    try {
      const categoryId = await db.financialCategories.add({
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color,
        budget: newCategory.budget
      });
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'financial_category_added',
        entityId: categoryId,
        oldValue: null,
        newValue: newCategory
      });
      
      console.log('Анализ влияния изменений:', changeResult);
      
      // Обновление списка категорий
      const loadedCategories = await db.financialCategories.toArray();
      setFinancialCategories(loadedCategories);
      
      // Сброс формы
      setNewCategory({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        budget: undefined
      });
      setIsAddCategoryDialogOpen(false);
      
      alert('Категория добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      alert('Ошибка при добавлении категории.');
    }
  }, [newCategory, propagateChange]);

  // Фильтрация транзакций
  const filteredTransactions = financialTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Фильтр по дате
    if (transactionDate < startDate || transactionDate > endDate) {
      return false;
    }
    
    // Фильтр по типу
    if (transactionTypeFilter !== 'all' && transaction.type !== transactionTypeFilter) {
      return false;
    }
    
    // Фильтр по категории
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });

  // Анализ баланса
  const handleAnalyzeBalance = useCallback(async () => {
    setIsAnalyzingBalance(true);
    try {
      // Подготовка данных для анализа
      const balanceData: Record<string, number> = {
        totalIncome: financialOverview.totalIncome,
        totalExpenses: financialOverview.totalExpenses,
        netIncome: financialOverview.netIncome,
        savingsRate: financialOverview.savingsRate
      };
      
      // Добавляем данные по категориям
      financialCategories.forEach(category => {
        const categoryAmount = category.type === 'income' ? 
          financialTransactions
            .filter(t => t.type === 'income' && t.category === category.name)
            .reduce((sum, t) => sum + t.amount, 0) :
          financialTransactions
            .filter(t => t.type === 'expense' && t.category === category.name)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        balanceData[`category_${category.name}`] = categoryAmount;
      });
      
      const analysis = await getLifeBalanceRecommendations(balanceData);
      setBalanceAnalysis(analysis);
    } catch (error) {
      console.error('Ошибка при анализе баланса:', error);
      setBalanceAnalysis('Ошибка при анализе финансового баланса.');
    } finally {
      setIsAnalyzingBalance(false);
    }
  }, [financialOverview, financialCategories, financialTransactions]);

  // Обработчики изменений полей ввода
  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalSelectChange = (name: string, value: string) => {
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleTransactionSelectChange = (name: string, value: string) => {
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelectChange = (name: string, value: string) => {
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Финансы</h1>
      
      {/* Финансовый обзор */}
      <Card>
        <CardHeader>
          <HelpTooltip content="Общий обзор вашего финансового состояния за выбранный период.">
            <CardTitle>Финансовый обзор</CardTitle>
          </HelpTooltip>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Доходы</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatAmount(financialOverview.totalIncome)}
            </p>
          </div>
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Расходы</p>
            <p className="text-xl font-bold text-red-800 dark:text-red-200">
              {formatAmount(financialOverview.totalExpenses)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            financialOverview.netIncome >= 0 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-yellow-100 dark:bg-yellow-900'
          }`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">Чистый доход</p>
            <p className={`text-xl font-bold ${
              financialOverview.netIncome >= 0 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              {formatAmount(financialOverview.netIncome)}
            </p>
          </div>
          <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Коэффициент сбережений</p>
            <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
              {financialOverview.savingsRate.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Фильтры для транзакций */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры транзакций</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Начальная дата</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Конечная дата</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="transactionType">Тип транзакции</Label>
            <Select 
              value={transactionTypeFilter} 
              onValueChange={(value: 'all' | 'income' | 'expense') => setTransactionTypeFilter(value)}
            >
              <SelectTrigger id="transactionType">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="income">Доходы</SelectItem>
                <SelectItem value="expense">Расходы</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryFilter">Категория</Label>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger id="categoryFilter">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {financialCategories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Финансовые цели */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <HelpTooltip content="Ваши финансовые цели с прогрессом выполнения.">
            <CardTitle>Финансовые цели</CardTitle>
          </HelpTooltip>
          <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить цель</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить финансовую цель</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalName">Название</Label>
                  <Input
                    id="goalName"
                    name="name"
                    value={newGoal.name}
                    onChange={handleGoalInputChange}
                    placeholder="Например, 'Создать фонд на черный день'"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAmount">Целевая сумма (₽)</Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    value={newGoal.targetAmount || ''}
                    onChange={handleGoalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="currentAmount">Текущая сумма (₽)</Label>
                  <Input
                    id="currentAmount"
                    name="currentAmount"
                    type="number"
                    value={newGoal.currentAmount || ''}
                    onChange={handleGoalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="goalDeadline">Срок достижения</Label>
                  <Input
                    id="goalDeadline"
                    name="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={handleGoalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="goalPriority">Приоритет (1-10)</Label>
                  <Input
                    id="goalPriority"
                    name="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newGoal.priority}
                    onChange={handleGoalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="goalCategory">Категория</Label>
                  <Select 
                    value={newGoal.category} 
                    onValueChange={(value) => handleGoalSelectChange('category', value)}
                  >
                    <SelectTrigger id="goalCategory">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialCategories
                        .filter(cat => cat.type === 'income')
                        .map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goalStatus">Статус</Label>
                  <Select 
                    value={newGoal.status} 
                    onValueChange={(value: 'active' | 'completed' | 'on hold') => 
                      handleGoalSelectChange('status', value)
                    }
                  >
                    <SelectTrigger id="goalStatus">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активная</SelectItem>
                      <SelectItem value="completed">Завершена</SelectItem>
                      <SelectItem value="on hold">На паузе</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddGoal}>Добавить цель</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {financialGoals.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
              Пока нет финансовых целей. Добавьте первую!
            </p>
          ) : (
            <div className="space-y-4">
              {financialGoals.map(goal => {
                const progress = goal.targetAmount > 0 
                  ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) 
                  : 0;
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatAmount(goal.currentAmount)} из {formatAmount(goal.targetAmount)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        goal.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        goal.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {goal.status === 'active' ? 'Активная' : 
                         goal.status === 'completed' ? 'Завершена' : 'На паузе'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Прогресс</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    {goal.deadline && (
                      <p className="text-xs text-gray-500 mt-2">
                        Срок: {format(new Date(goal.deadline), 'dd MMMM yyyy', { locale: ru })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Транзакции */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <HelpTooltip content="Ваши финансовые транзакции за выбранный период.">
            <CardTitle>Транзакции</CardTitle>
          </HelpTooltip>
          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить транзакцию</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить транзакцию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transactionDate">Дата</Label>
                  <Input
                    id="transactionDate"
                    name="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={handleTransactionInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="transactionAmount">Сумма (₽)</Label>
                  <Input
                    id="transactionAmount"
                    name="amount"
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={handleTransactionInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="transactionType">Тип</Label>
                  <Select 
                    value={newTransaction.type} 
                    onValueChange={(value: 'income' | 'expense') => 
                      handleTransactionSelectChange('type', value)
                    }
                  >
                    <SelectTrigger id="transactionType">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Доход</SelectItem>
                      <SelectItem value="expense">Расход</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionCategory">Категория</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => handleTransactionSelectChange('category', value)}
                  >
                    <SelectTrigger id="transactionCategory">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionDescription">Описание (опционально)</Label>
                  <Textarea
                    id="transactionDescription"
                    name="description"
                    value={newTransaction.description}
                    onChange={handleTransactionInputChange}
                    placeholder="Описание транзакции"
                  />
                </div>
                <Button onClick={handleAddTransaction}>Добавить транзакцию</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
              Пока нет транзакций за выбранный период. Добавьте первую!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Дата</th>
                    <th className="text-left py-2">Описание</th>
                    <th className="text-left py-2">Категория</th>
                    <th className="text-right py-2">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-2">
                        {format(new Date(transaction.date), 'dd.MM.yyyy')}
                      </td>
                      <td className="py-2">
                        {transaction.description || '-'}
                      </td>
                      <td className="py-2">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: financialCategories.find(c => c.name === transaction.category)?.color || '#e5e7eb',
                            color: 'white'
                          }}
                        >
                          {transaction.category}
                        </span>
                      </td>
                      <td className={`py-2 text-right font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' 
                          ? `+${formatAmount(transaction.amount)}` 
                          : `-${formatAmount(Math.abs(transaction.amount))}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Категории */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <HelpTooltip content="Категории доходов и расходов для классификации транзакций.">
            <CardTitle>Категории</CardTitle>
          </HelpTooltip>
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить категорию</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить категорию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Название</Label>
                  <Input
                    id="categoryName"
                    name="name"
                    value={newCategory.name}
                    onChange={handleCategoryInputChange}
                    placeholder="Например, 'Продукты', 'Зарплата'"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryType">Тип</Label>
                  <Select 
                    value={newCategory.type} 
                    onValueChange={(value: 'income' | 'expense') => 
                      handleCategorySelectChange('type', value)
                    }
                  >
                    <SelectTrigger id="categoryType">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Доход</SelectItem>
                      <SelectItem value="expense">Расход</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoryColor">Цвет</Label>
                  <Input
                    id="categoryColor"
                    name="color"
                    type="color"
                    value={newCategory.color}
                    onChange={handleCategoryInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="categoryBudget">Бюджет (₽) (опционально)</Label>
                  <Input
                    id="categoryBudget"
                    name="budget"
                    type="number"
                    value={newCategory.budget || ''}
                    onChange={handleCategoryInputChange}
                  />
                </div>
                <Button onClick={handleAddCategory}>Добавить категорию</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {financialCategories.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
              Пока нет категорий. Добавьте первую!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialCategories.map(category => (
                <div 
                  key={category.id} 
                  className="p-4 border rounded-lg flex items-center"
                  style={{ 
                    borderLeft: `4px solid ${category.color}`,
                    backgroundColor: 'rgba(0,0,0,0.05)'
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.type === 'income' ? 'Доход' : 'Расход'}
                    </p>
                    {category.budget && (
                      <p className="text-sm">
                        Бюджет: {formatAmount(category.budget)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Анализ баланса */}
      <Card>
        <CardHeader>
          <HelpTooltip content="Анализ вашего финансового баланса с помощью ИИ.">
            <CardTitle>Анализ баланса</CardTitle>
          </HelpTooltip>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {balanceAnalysis || 'Получите рекомендации по улучшению вашего финансового баланса.'}
          </p>
          <Button 
            onClick={handleAnalyzeBalance}
            disabled={isAnalyzingBalance}
          >
            {isAnalyzingBalance ? 'Анализ...' : 'Запросить анализ'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;