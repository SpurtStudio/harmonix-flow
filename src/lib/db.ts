import Dexie, { Table } from 'dexie';

export interface Vision {
  id?: number;
  name: string;
  description: string;
  imageUrl?: string;
  balanceScore: number;
  globalGoalIds?: number[];
}

export interface GlobalGoal {
  id?: number;
  name: string;
  smartFormulation: string;
  progress: number;
  strategicGoalIds?: number[];
  lifeSphere: string; // Связь со сферами жизни
}

export interface StrategicGoal {
  id?: number;
  name: string;
  krs: string[]; // Key Results
  priority: number;
  projectIds?: number[];
  standaloneTaskIds?: number[];
  impactOnBalance: number;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  status: string;
  subProjectLevel1Ids?: number[];
  taskIds?: number[];
  resourceEstimation: string;
}

export interface SubProjectLevel1 {
  id?: number;
  name: string;
  description: string;
  status: string;
  subProjectLevel2Ids?: number[];
  taskIds?: number[];
}

export interface SubProjectLevel2 {
  id?: number;
  name: string;
  description: string;
  status: string;
  taskIds?: number[];
}

export interface Task {
  id?: number | string;
  name: string;
  description: string;
  priority: 'Urgent-Important' | 'NotUrgent-Important' | 'Urgent-NotImportant' | 'NotUrgent-NotImportant'; // Матрица Эйзенхауэра
  context: {
    place?: string;
    tool?: string;
    energy?: string;
  };
  subTaskIds?: number[];
  status: string;
  dueDate?: Date; // Срок выполнения задачи
  category?: string; // Категория задачи (сфера жизни)
}

export interface SubTask {
  id?: number;
  name: string;
  description: string;
  priority: number;
  status: string;
}

export interface JournalEntry {
  id?: number | string;
  timestamp: Date;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  psychologicalState: number;
  emotionalState: number;
  physicalState: number;
  linkedVisionId?: number;
  linkedGlobalGoalIds?: number[];
  linkedStrategicGoalIds?: number[];
  linkedProjectIds?: number[];
  linkedSubProjectLevel1Ids?: number[];
  linkedSubProjectLevel2Ids?: number[];
  linkedTaskIds?: number[];
  linkedSubTaskIds?: number[];
  formedIdeaIds?: number[];
}

export interface Idea {
  id?: number;
  name: string;
  description: string;
  sourceJournalEntryId?: number;
  analysisResult?: string; // Результат анализа через Квадрат Декарта
  linkedGoalIds?: number[]; // Связь с целями
  linkedProjectIds?: number[]; // Связь с проектами
  status: 'active' | 'dormant' | 'realized';
}

export interface Habit {
  id?: number | string;
  name: string;
  description: string;
  frequency: string;
  progress: number;
  linkedGoalIds?: number[];
  linkedTaskIds?: number[];
  completionTime?: string;
  }
  
  export interface Skill {
  id?: number;
  name: string;
  level: number; // 0-100
  goal: number; // Целевой уровень 0-100
  category: string;
  lastUpdated: Date;
  }
  
  export interface LearningGoal {
  id?: number;
  title: string;
  description: string;
  progress: number; // 0-100
  deadline?: Date;
  skills: string[]; // Связанные навыки
  }
  
  export interface LearningProject {
  id?: number;
  title: string;
  description: string;
  progress: number; // 0-100
  startDate: Date;
  endDate?: Date;
  goals: number[]; // Связанные цели
  }
  
  export interface Notification {
  id?: number;
  title: string;
  description: string;
  timestamp: Date;
  read: number; // 0 for false, 1 for true
  type: string; // Например, 'task_reminder', 'goal_update', 'system_message'
  linkedEntityId?: number; // ID связанной сущности (задача, цель и т.д.)
  linkedEntityType?: string; // Тип связанной сущности
  }
  
  export interface FinancialGoal {
  id?: number;
  name: string;
  targetAmount: number; // Целевая сумма
  currentAmount: number; // Текущая сумма
  deadline?: Date; // Срок достижения цели
  priority: number; // Приоритет (1-10)
  category: string; // Категория (например, 'Сбережения', 'Инвестиции', 'Погашение долга')
  status: 'active' | 'completed' | 'on hold'; // Статус
  }
  
  export interface FinancialTransaction {
  id?: number;
  date: Date; // Дата транзакции
  amount: number; // Сумма (положительная для дохода, отрицательная для расхода)
  type: 'income' | 'expense'; // Тип транзакции
  category: string; // Категория (например, 'Зарплата', 'Продукты', 'Транспорт')
  description?: string; // Описание
  projectId?: number; // Связь с проектом (если применимо)
  }
  
  export interface FinancialCategory {
  id?: number;
  name: string; // Название категории
  type: 'income' | 'expense'; // Тип категории
  color: string; // Цвет для визуализации
  budget?: number; // Бюджет (для категорий расходов)
  }
  
  export interface FamilyMember {
  id?: number;
  name: string;
  relationship: string; // Например, 'Мать', 'Отец', 'Брат', 'Сестра', 'Супруг(а)', 'Ребенок'
  birthDate?: Date;
  contactInfo?: string;
  photoUrl?: string;
  notes?: string;
  }
  
  export interface FamilyEvent {
  id?: number;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  linkedFamilyMemberIds?: number[];
  type: string; // Например, 'День рождения', 'Годовщина', 'Праздник', 'Встреча'
  }
  
  export interface Relationship {
  id?: number;
  member1Id: number;
  member2Id: number;
  type: string; // Например, 'родитель-ребенок', 'супруги', 'брат-сестра'
  }
  
  export interface UserSettings {
  id?: number;
  isRegistered: boolean;
  hashedMasterKey?: ArrayBuffer; // Зашифрованный мастер-ключ или хеш пароля
  salt?: Uint8Array;
  iterations?: number;
  hashAlgorithm?: string;
  }

export class HarmonyDB extends Dexie {
  visions!: Table<Vision>;
  globalGoals!: Table<GlobalGoal>;
  strategicGoals!: Table<StrategicGoal>;
  projects!: Table<Project>;
  subProjectsLevel1!: Table<SubProjectLevel1>;
  subProjectsLevel2!: Table<SubProjectLevel2>;
  tasks!: Table<Task>;
  subTasks!: Table<SubTask>;
  journalEntries!: Table<JournalEntry>;
  ideas!: Table<Idea>;
  habits!: Table<Habit>;
  notifications!: Table<Notification>;
  skills!: Table<Skill>;
  learningGoals!: Table<LearningGoal>;
  learningProjects!: Table<LearningProject>;
  familyMembers!: Table<FamilyMember>; // Новая таблица
  familyEvents!: Table<FamilyEvent>;   // Новая таблица
  relationships!: Table<Relationship>; // Новая таблица
  financialGoals!: Table<FinancialGoal>; // Новая таблица
  financialTransactions!: Table<FinancialTransaction>; // Новая таблица
  financialCategories!: Table<FinancialCategory>; // Новая таблица
  userSettings!: Table<UserSettings>;
  
  constructor() {
    super('HarmonyDB');
    this.version(1).stores({
      visions: '++id, name',
      globalGoals: '++id, name, lifeSphere',
      strategicGoals: '++id, name, priority',
      projects: '++id, name, status',
      subProjectsLevel1: '++id, name, status',
      subProjectsLevel2: '++id, name, status',
      tasks: '++id, name, priority, status',
      subTasks: '++id, name, status',
      journalEntries: '++id, timestamp',
      ideas: '++id, name, status',
      habits: '++id, name, frequency',
      notifications: '++id, timestamp, read, type',
      familyMembers: '++id, name, relationship',
      familyEvents: '++id, date, type',
      relationships: '++id, member1Id, member2Id, type',
      financialGoals: '++id, name, priority, category',
      financialTransactions: '++id, date, type, category',
      financialCategories: '++id, name, type',
      userSettings: '++id',
    });
  
  // Обновление до версии 2 с добавлением новых полей в таблицу tasks
  this.version(2).stores({
  tasks: '++id, name, priority, status, dueDate, category',
  });
  
  // Обновление до версии 3 с добавлением индекса для subTaskIds
  this.version(3).stores({
  tasks: '++id, name, priority, status, dueDate, category, subTaskIds',
  });
  
  // Обновление до версии 4 с добавлением таблиц для развития
  this.version(4).stores({
  skills: '++id, name, category, level, goal',
  learningGoals: '++id, title, progress, deadline',
  learningProjects: '++id, title, progress, startDate',
  });
  
  // Обновление до версии 5 с добавлением индексов для photoUrl и notes в таблице familyMembers
  this.version(5).stores({
  familyMembers: '++id, name, relationship, photoUrl, notes',
  });
  }

  // Vision methods
  async addVision(vision: Omit<Vision, 'id'>): Promise<number> {
    return await this.visions.add(vision);
  }

  async getVision(id: number): Promise<Vision | undefined> {
    return await this.visions.get(id);
  }

  async getAllVisions(): Promise<Vision[]> {
    return await this.visions.toArray();
  }

  async updateVision(id: number, vision: Partial<Vision>): Promise<number> {
    return await this.visions.update(id, vision);
  }

  async deleteVision(id: number): Promise<void> {
    await this.visions.delete(id);
  }

  // GlobalGoal methods
  async addGlobalGoal(globalGoal: Omit<GlobalGoal, 'id'>): Promise<number> {
    return await this.globalGoals.add(globalGoal);
  }

  async getGlobalGoal(id: number): Promise<GlobalGoal | undefined> {
    return await this.globalGoals.get(id);
  }

  async getAllGlobalGoals(): Promise<GlobalGoal[]> {
    return await this.globalGoals.toArray();
  }

  async getGlobalGoalsByLifeSphere(lifeSphere: string): Promise<GlobalGoal[]> {
    return await this.globalGoals.where('lifeSphere').equals(lifeSphere).toArray();
  }

  async updateGlobalGoal(id: number, globalGoal: Partial<GlobalGoal>): Promise<number> {
    return await this.globalGoals.update(id, globalGoal);
  }

  async deleteGlobalGoal(id: number): Promise<void> {
    await this.globalGoals.delete(id);
  }

  // StrategicGoal methods
  async addStrategicGoal(strategicGoal: Omit<StrategicGoal, 'id'>): Promise<number> {
    return await this.strategicGoals.add(strategicGoal);
  }

  async getStrategicGoal(id: number): Promise<StrategicGoal | undefined> {
    return await this.strategicGoals.get(id);
  }

  async getAllStrategicGoals(): Promise<StrategicGoal[]> {
    return await this.strategicGoals.toArray();
  }

  async getStrategicGoalsByPriority(priority: number): Promise<StrategicGoal[]> {
    return await this.strategicGoals.where('priority').equals(priority).toArray();
  }

  async updateStrategicGoal(id: number, strategicGoal: Partial<StrategicGoal>): Promise<number> {
    return await this.strategicGoals.update(id, strategicGoal);
  }

  async deleteStrategicGoal(id: number): Promise<void> {
    await this.strategicGoals.delete(id);
  }

  // Project methods
  async addProject(project: Omit<Project, 'id'>): Promise<number> {
    return await this.projects.add(project);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return await this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.projects.toArray();
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    return await this.projects.where('status').equals(status).toArray();
  }

  async updateProject(id: number, project: Partial<Project>): Promise<number> {
    return await this.projects.update(id, project);
  }

  async deleteProject(id: number): Promise<void> {
    await this.projects.delete(id);
  }

  // SubProjectLevel1 methods
  async addSubProjectLevel1(subProject: Omit<SubProjectLevel1, 'id'>): Promise<number> {
    return await this.subProjectsLevel1.add(subProject);
  }

  async getSubProjectLevel1(id: number): Promise<SubProjectLevel1 | undefined> {
    return await this.subProjectsLevel1.get(id);
  }

  async getAllSubProjectsLevel1(): Promise<SubProjectLevel1[]> {
    return await this.subProjectsLevel1.toArray();
  }

  async getSubProjectsLevel1ByStatus(status: string): Promise<SubProjectLevel1[]> {
    return await this.subProjectsLevel1.where('status').equals(status).toArray();
  }

  async updateSubProjectLevel1(id: number, subProject: Partial<SubProjectLevel1>): Promise<number> {
    return await this.subProjectsLevel1.update(id, subProject);
  }

  async deleteSubProjectLevel1(id: number): Promise<void> {
    await this.subProjectsLevel1.delete(id);
  }

  // SubProjectLevel2 methods
  async addSubProjectLevel2(subProject: Omit<SubProjectLevel2, 'id'>): Promise<number> {
    return await this.subProjectsLevel2.add(subProject);
  }

  async getSubProjectLevel2(id: number): Promise<SubProjectLevel2 | undefined> {
    return await this.subProjectsLevel2.get(id);
  }

  async getAllSubProjectsLevel2(): Promise<SubProjectLevel2[]> {
    return await this.subProjectsLevel2.toArray();
  }

  async getSubProjectsLevel2ByStatus(status: string): Promise<SubProjectLevel2[]> {
    return await this.subProjectsLevel2.where('status').equals(status).toArray();
  }

  async updateSubProjectLevel2(id: number, subProject: Partial<SubProjectLevel2>): Promise<number> {
    return await this.subProjectsLevel2.update(id, subProject);
  }

  async deleteSubProjectLevel2(id: number): Promise<void> {
    await this.subProjectsLevel2.delete(id);
  }

  // Task methods
  async addTask(task: Omit<Task, 'id'>): Promise<number> {
    return await this.tasks.add(task);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return await this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.tasks.toArray();
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    return await this.tasks.where('priority').equals(priority).toArray();
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.tasks.where('status').equals(status).toArray();
  }

  async updateTask(id: number, task: Partial<Task>): Promise<number> {
    return await this.tasks.update(id, task);
  }

  async deleteTask(id: number): Promise<void> {
    await this.tasks.delete(id);
  }

  // SubTask methods
  async addSubTask(subTask: Omit<SubTask, 'id'>): Promise<number> {
    return await this.subTasks.add(subTask);
  }

  async getSubTask(id: number): Promise<SubTask | undefined> {
    return await this.subTasks.get(id);
  }

  async getAllSubTasks(): Promise<SubTask[]> {
    return await this.subTasks.toArray();
  }

  async getSubTasksByStatus(status: string): Promise<SubTask[]> {
    return await this.subTasks.where('status').equals(status).toArray();
  }

  async updateSubTask(id: number, subTask: Partial<SubTask>): Promise<number> {
    return await this.subTasks.update(id, subTask);
  }

  async deleteSubTask(id: number): Promise<void> {
    await this.subTasks.delete(id);
  }

  // JournalEntry methods
  async addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<number> {
    return await this.journalEntries.add(entry);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return await this.journalEntries.get(id);
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await this.journalEntries.toArray();
  }

  async getJournalEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await this.journalEntries.where('timestamp').between(startDate, endDate).toArray();
  }

  async updateJournalEntry(id: number, entry: Partial<JournalEntry>): Promise<number> {
    return await this.journalEntries.update(id, entry);
  }

  async deleteJournalEntry(id: number): Promise<void> {
    await this.journalEntries.delete(id);
  }

  // Idea methods
  async addIdea(idea: Omit<Idea, 'id'>): Promise<number> {
    return await this.ideas.add(idea);
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    return await this.ideas.get(id);
  }

  async getAllIdeas(): Promise<Idea[]> {
    return await this.ideas.toArray();
  }

  async getIdeasByStatus(status: Idea['status']): Promise<Idea[]> {
    return await this.ideas.where('status').equals(status).toArray();
  }

  async updateIdea(id: number, idea: Partial<Idea>): Promise<number> {
    return await this.ideas.update(id, idea);
  }

  async deleteIdea(id: number): Promise<void> {
    await this.ideas.delete(id);
  }

  // Habit methods
  async addHabit(habit: Omit<Habit, 'id'>): Promise<number> {
    return await this.habits.add(habit);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return await this.habits.get(id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return await this.habits.toArray();
  }

  async getHabitsByFrequency(frequency: string): Promise<Habit[]> {
    return await this.habits.where('frequency').equals(frequency).toArray();
  }

  async updateHabit(id: number, habit: Partial<Habit>): Promise<number> {
    return await this.habits.update(id, habit);
  }

  async deleteHabit(id: number): Promise<void> {
    await this.habits.delete(id);
  }

  // Notification methods
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<number> {
    const fullNotification: Notification = {
      ...notification,
      timestamp: new Date(),
      read: 0
    };
    return await this.notifications.add(fullNotification);
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return await this.notifications.get(id);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await this.notifications.toArray();
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await this.notifications.where('read').equals(0).toArray();
  }

  async markNotificationAsRead(id: number): Promise<number> {
    return await this.notifications.update(id, { read: 1 });
  }

  async markAllNotificationsAsRead(): Promise<number> {
    return await this.notifications.where('read').equals(0).modify({ read: 1 });
  }

  async deleteNotification(id: number): Promise<void> {
    await this.notifications.delete(id);
  }

  // FamilyMember methods
  async addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<number> {
    return await this.familyMembers.add(member);
  }

  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    return await this.familyMembers.get(id);
  }

  async getAllFamilyMembers(): Promise<FamilyMember[]> {
    return await this.familyMembers.toArray();
  }

  async getFamilyMembersByRelationship(relationship: string): Promise<FamilyMember[]> {
    return await this.familyMembers.where('relationship').equals(relationship).toArray();
  }

  async updateFamilyMember(id: number, member: Partial<FamilyMember>): Promise<number> {
    return await this.familyMembers.update(id, member);
  }

  async deleteFamilyMember(id: number): Promise<void> {
    await this.familyMembers.delete(id);
  }

  // FamilyEvent methods
  async addFamilyEvent(event: Omit<FamilyEvent, 'id'>): Promise<number> {
    return await this.familyEvents.add(event);
  }

  async getFamilyEvent(id: number): Promise<FamilyEvent | undefined> {
    return await this.familyEvents.get(id);
  }

  async getAllFamilyEvents(): Promise<FamilyEvent[]> {
    return await this.familyEvents.toArray();
  }

  async getFamilyEventsByDateRange(startDate: Date, endDate: Date): Promise<FamilyEvent[]> {
    return await this.familyEvents.where('date').between(startDate, endDate).toArray();
  }

  async getFamilyEventsByType(type: string): Promise<FamilyEvent[]> {
    return await this.familyEvents.where('type').equals(type).toArray();
  }

  async updateFamilyEvent(id: number, event: Partial<FamilyEvent>): Promise<number> {
    return await this.familyEvents.update(id, event);
  }

  async deleteFamilyEvent(id: number): Promise<void> {
    await this.familyEvents.delete(id);
  }

  // Relationship methods
  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<number> {
    return await this.relationships.add(relationship);
  }

  async getRelationship(id: number): Promise<Relationship | undefined> {
    return await this.relationships.get(id);
  }

  async getAllRelationships(): Promise<Relationship[]> {
    return await this.relationships.toArray();
  }

  async getRelationshipsByType(type: string): Promise<Relationship[]> {
    return await this.relationships.where('type').equals(type).toArray();
  }

  async updateRelationship(id: number, relationship: Partial<Relationship>): Promise<number> {
    return await this.relationships.update(id, relationship);
  }

  async deleteRelationship(id: number): Promise<void> {
    await this.relationships.delete(id);
  }

  // UserSettings methods
  async getUserSettings(): Promise<UserSettings | undefined> {
    return await this.userSettings.toCollection().first();
  }

  async saveUserSettings(settings: UserSettings): Promise<number> {
    const existingSettings = await this.getUserSettings();
    if (existingSettings && existingSettings.id) {
      return await this.userSettings.update(existingSettings.id, settings);
    } else {
      return await this.userSettings.add(settings);
    }
  }

  // Skill methods
  async addSkill(skill: Omit<Skill, 'id'>): Promise<number> {
  return await this.skills.add(skill);
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
  return await this.skills.get(id);
  }
  
  async getAllSkills(): Promise<Skill[]> {
  return await this.skills.toArray();
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
  return await this.skills.where('category').equals(category).toArray();
  }
  
  async updateSkill(id: number, skill: Partial<Skill>): Promise<number> {
  return await this.skills.update(id, skill);
  }
  
  async deleteSkill(id: number): Promise<void> {
  await this.skills.delete(id);
  }
  
  // LearningGoal methods
  async addLearningGoal(goal: Omit<LearningGoal, 'id'>): Promise<number> {
  return await this.learningGoals.add(goal);
  }
  
  async getLearningGoal(id: number): Promise<LearningGoal | undefined> {
  return await this.learningGoals.get(id);
  }
  
  async getAllLearningGoals(): Promise<LearningGoal[]> {
  return await this.learningGoals.toArray();
  }
  
  async getLearningGoalsByDeadline(deadline: Date): Promise<LearningGoal[]> {
  return await this.learningGoals.where('deadline').belowOrEqual(deadline).toArray();
  }
  
  async updateLearningGoal(id: number, goal: Partial<LearningGoal>): Promise<number> {
  return await this.learningGoals.update(id, goal);
  }
  
  async deleteLearningGoal(id: number): Promise<void> {
  await this.learningGoals.delete(id);
  }
  
  // LearningProject methods
  async addLearningProject(project: Omit<LearningProject, 'id'>): Promise<number> {
  return await this.learningProjects.add(project);
  }
  
  async getLearningProject(id: number): Promise<LearningProject | undefined> {
  return await this.learningProjects.get(id);
  }
  
  async getAllLearningProjects(): Promise<LearningProject[]> {
  return await this.learningProjects.toArray();
  }
  
  async getLearningProjectsByStartDate(startDate: Date): Promise<LearningProject[]> {
  return await this.learningProjects.where('startDate').aboveOrEqual(startDate).toArray();
  }
  
  async updateLearningProject(id: number, project: Partial<LearningProject>): Promise<number> {
  return await this.learningProjects.update(id, project);
  }
  
  async deleteLearningProject(id: number): Promise<void> {
  await this.learningProjects.delete(id);
  }
  
  async clearUserSettings(): Promise<void> {
    await this.userSettings.clear();
  }

  // FinancialGoal methods
  async addFinancialGoal(goal: Omit<FinancialGoal, 'id'>): Promise<number> {
    return await this.financialGoals.add(goal);
  }

  async getFinancialGoal(id: number): Promise<FinancialGoal | undefined> {
    return await this.financialGoals.get(id);
  }

  async getAllFinancialGoals(): Promise<FinancialGoal[]> {
    return await this.financialGoals.toArray();
  }

  async getFinancialGoalsByCategory(category: string): Promise<FinancialGoal[]> {
    return await this.financialGoals.where('category').equals(category).toArray();
  }

  async getFinancialGoalsByStatus(status: FinancialGoal['status']): Promise<FinancialGoal[]> {
    return await this.financialGoals.where('status').equals(status).toArray();
  }

  async updateFinancialGoal(id: number, goal: Partial<FinancialGoal>): Promise<number> {
    return await this.financialGoals.update(id, goal);
  }

  async deleteFinancialGoal(id: number): Promise<void> {
    await this.financialGoals.delete(id);
  }

  // FinancialTransaction methods
  async addFinancialTransaction(transaction: Omit<FinancialTransaction, 'id'>): Promise<number> {
    return await this.financialTransactions.add(transaction);
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    return await this.financialTransactions.get(id);
  }

  async getAllFinancialTransactions(): Promise<FinancialTransaction[]> {
    return await this.financialTransactions.toArray();
  }

  async getFinancialTransactionsByDateRange(startDate: Date, endDate: Date): Promise<FinancialTransaction[]> {
    return await this.financialTransactions.where('date').between(startDate, endDate).toArray();
  }

  async getFinancialTransactionsByType(type: FinancialTransaction['type']): Promise<FinancialTransaction[]> {
    return await this.financialTransactions.where('type').equals(type).toArray();
  }

  async getFinancialTransactionsByCategory(category: string): Promise<FinancialTransaction[]> {
    return await this.financialTransactions.where('category').equals(category).toArray();
  }

  async updateFinancialTransaction(id: number, transaction: Partial<FinancialTransaction>): Promise<number> {
    return await this.financialTransactions.update(id, transaction);
  }

  async deleteFinancialTransaction(id: number): Promise<void> {
    await this.financialTransactions.delete(id);
  }

  // FinancialCategory methods
  async addFinancialCategory(category: Omit<FinancialCategory, 'id'>): Promise<number> {
    return await this.financialCategories.add(category);
  }

  async getFinancialCategory(id: number): Promise<FinancialCategory | undefined> {
    return await this.financialCategories.get(id);
  }

  async getAllFinancialCategories(): Promise<FinancialCategory[]> {
    return await this.financialCategories.toArray();
  }

  async getFinancialCategoriesByType(type: FinancialCategory['type']): Promise<FinancialCategory[]> {
    return await this.financialCategories.where('type').equals(type).toArray();
  }

  async updateFinancialCategory(id: number, category: Partial<FinancialCategory>): Promise<number> {
    return await this.financialCategories.update(id, category);
  }

  async deleteFinancialCategory(id: number): Promise<void> {
    await this.financialCategories.delete(id);
  }
}
  
  export const db = new HarmonyDB();