// Упрощенная версия vector-db.ts без проблемных WASM зависимостей

export interface VectorDBItem {
  id: number;
  text: string;
  vector?: number[];
  metadata?: any;
}

export interface SearchResult {
  id: number;
  text: string;
  similarity: number;
  metadata?: any;
}

/**
 * Упрощенная векторная база данных без WASM зависимостей
 * Использует простой текстовый поиск вместо векторного поиска
 */
class VectorDB {
  private data: Map<number, VectorDBItem> = new Map();
  private dim: number;

  constructor(dim: number) {
    this.dim = dim;
    console.log(`VectorDB initialized with dimension ${this.dim} (simplified mode)`);
  }

  /**
   * Инициализирует векторную базу данных (упрощенная версия).
   */
  async init(maxElements: number, M: number = 16, efConstruction: number = 200): Promise<void> {
    console.log(`VectorDB initialized with max elements: ${maxElements} (simplified mode)`);
  }

  /**
   * Добавляет элемент в векторную базу данных.
   */
  async addItem(item: VectorDBItem): Promise<void> {
    this.data.set(item.id, item);
    console.log(`Item with ID ${item.id} added to VectorDB (simplified mode)`);
  }

  /**
   * Ищет элементы по тексту (простой текстовый поиск).
   */
  async search(queryVector: number[] | string, numNeighbors: number = 5): Promise<SearchResult[]> {
    const query = typeof queryVector === 'string' ? queryVector : '';
    const results: SearchResult[] = [];

    for (const [id, item] of this.data) {
      if (query && item.text.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: item.id,
          text: item.text,
          similarity: 0.8, // Заглушка для совместимости
          metadata: item.metadata
        });
      }
    }

    return results.slice(0, numNeighbors);
  }

  /**
   * Удаляет элемент из векторной базы данных.
   */
  async deleteItem(id: number): Promise<void> {
    this.data.delete(id);
    console.log(`Item with ID ${id} deleted from VectorDB (simplified mode)`);
  }

  /**
   * Сохраняет индекс (заглушка).
   */
  async saveIndex(): Promise<Uint8Array> {
    console.log('Saving index (simplified mode)');
    return new Uint8Array();
  }

  /**
   * Загружает индекс (заглушка).
   */
  async loadIndex(data: Uint8Array, maxElements: number): Promise<void> {
    console.log('Loading index (simplified mode)');
  }

  /**
   * Получает все элементы.
   */
  getAllItems(): VectorDBItem[] {
    return Array.from(this.data.values());
  }

  /**
   * Получает элемент по ID.
   */
  getItem(id: number): VectorDBItem | undefined {
    return this.data.get(id);
  }
}

export const semanticDB = new VectorDB(1536);

// Заглушка для совместимости с существующим кодом
export interface VectorSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: any;
}

export interface VectorDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: any;
}

export class LocalVectorDB {
  private vectorDB: VectorDB;
  
  constructor() {
    this.vectorDB = new VectorDB(1536);
    console.log('LocalVectorDB initialized (simplified version)');
  }

  async initialize(): Promise<boolean> {
    await this.vectorDB.init(10000);
    return true;
  }

  async addDocument(document: VectorDocument): Promise<void> {
    const numericId = parseInt(document.id) || Math.floor(Math.random() * 1000000);
    await this.vectorDB.addItem({
      id: numericId,
      text: document.content,
      metadata: { ...document.metadata, originalId: document.id }
    });
  }

  async search(query: string, limit: number = 10): Promise<VectorSearchResult[]> {
    const results = await this.vectorDB.search(query, limit);
    return results.map(result => ({
      id: result.metadata?.originalId || result.id.toString(),
      content: result.text,
      similarity: result.similarity,
      metadata: result.metadata
    }));
  }

  async removeDocument(id: string): Promise<void> {
    const numericId = parseInt(id) || 0;
    await this.vectorDB.deleteItem(numericId);
  }

  async getDocument(id: string): Promise<VectorDocument | undefined> {
    const numericId = parseInt(id) || 0;
    const item = this.vectorDB.getItem(numericId);
    if (!item) return undefined;
    
    return {
      id: item.metadata?.originalId || item.id.toString(),
      content: item.text,
      metadata: item.metadata
    };
  }

  async getAllDocuments(): Promise<VectorDocument[]> {
    const items = this.vectorDB.getAllItems();
    return items.map(item => ({
      id: item.metadata?.originalId || item.id.toString(),
      content: item.text,
      metadata: item.metadata
    }));
  }
}

export const vectorDB = new LocalVectorDB();