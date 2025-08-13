// src/lib/vector-db.ts
import { loadHnswlib, HierarchicalNSW as HNSWType } from 'hnswlib-wasm'; // Импортируем loadHnswlib и тип HierarchicalNSW

interface VectorDBItem {
  id: number;
  text: string;
  vector: number[];
}

class VectorDB {
  private index: HNSWType | null = null; // Используем импортированный тип
  private data: Map<number, VectorDBItem> = new Map();
  private dim: number; // Размерность векторов
  private hnswModule: any = null; // Для хранения загруженного модуля

  constructor(dim: number) {
    this.dim = dim;
  }

  /**
   * Инициализирует векторную базу данных.
   * @param maxElements Максимальное количество элементов в индексе.
   * @param M Количество соседей для каждого элемента (параметр HNSW).
   * @param efConstruction Параметр efConstruction для построения индекса.
   */
  async init(maxElements: number, M: number = 16, efConstruction: number = 200) {
    if (!this.hnswModule) {
      this.hnswModule = await loadHnswlib(); // Загружаем библиотеку
    }
    this.index = new this.hnswModule.HierarchicalNSW('l2', this.dim); 
    this.index.initIndex(maxElements, M, efConstruction, 42); // Добавляем randomSeed
    console.log(`VectorDB инициализирована с размерностью ${this.dim} и максимальным количеством элементов ${maxElements}`);
  }

  /**
   * Добавляет элемент в векторную базу данных.
   * @param item Элемент для добавления, содержащий id, текст и вектор.
   */
  async addItem(item: VectorDBItem) {
    if (!this.index) {
      throw new Error('VectorDB не инициализирована. Вызовите init() перед добавлением элементов.');
    }
    this.index.addPoint(item.vector, item.id, false); // Добавляем replaceDeleted
    this.data.set(item.id, item);
    console.log(`Элемент с ID ${item.id} добавлен в VectorDB.`);
  }

  /**
   * Ищет ближайшие соседи для заданного вектора.
   * @param queryVector Вектор запроса.
   * @param numNeighbors Количество ближайших соседей для поиска.
   * @param efSearch Параметр efSearch для поиска.
   * @returns Promise<VectorDBItem[]> Массив ближайших элементов.
   */
  async search(queryVector: number[], numNeighbors: number = 5, efSearch: number = 50): Promise<VectorDBItem[]> {
    if (!this.index) {
      throw new Error('VectorDB не инициализирована. Вызовите init() перед поиском.');
    }
    // this.index.setEf(efSearch); // Закомментируем, если вызывает ошибку
    const result = this.index.searchKnn(queryVector, numNeighbors, (label: number) => {
      return this.data.has(label);
    });
    
    const foundItems: VectorDBItem[] = [];
    for (let i = 0; i < result.labels.length; i++) {
      const id = result.labels[i];
      const item = this.data.get(id);
      if (item) {
        foundItems.push(item);
      }
    }
    return foundItems;
  }

  /**
   * Удаляет элемент из векторной базы данных.
   * @param id ID элемента для удаления.
   */
  async deleteItem(id: number) {
    if (!this.index) {
      throw new Error('VectorDB не инициализирована.');
    }
    this.index.markDelete(id); // HNSWlib помечает точки как удаленные, но не удаляет их физически
    this.data.delete(id);
    console.log(`Элемент с ID ${id} помечен как удаленный в VectorDB.`);
  }

  /**
   * Сохраняет индекс в файл (для персистентности).
   * @returns Promise<Uint8Array> Сериализованный индекс.
   */
  async saveIndex(): Promise<Uint8Array> {
    if (!this.index) {
      throw new Error('VectorDB не инициализирована.');
    }
    return this.index.writeIndex();
  }

  /**
   * Загружает индекс из файла.
   * @param data Сериализованный индекс.
   * @param maxElements Максимальное количество элементов, с которым был сохранен индекс.
   */
  async loadIndex(data: Uint8Array, maxElements: number) {
    if (!this.hnswModule) {
      this.hnswModule = await loadHnswlib(); // Загружаем библиотеку
    }
    this.index = new this.hnswModule.HierarchicalNSW('l2', this.dim);
    this.index.loadIndex(data, true); // Добавляем allowReplace
    console.log('VectorDB индекс загружен.');
  }
}

export const semanticDB = new VectorDB(1536); // Пример: размерность векторов OpenAI ada-002

// Внимание: для реального использования вам потребуется модель для генерации векторов (embeddings).
// Это может быть локальная WASM-модель (например, ONNX Runtime с небольшой моделью)
// или вызов к Serverless AI API (например, OpenAI Embeddings).