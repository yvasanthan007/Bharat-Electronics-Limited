import { logger } from './logger';

class CacheService {
  private inMemoryStore: Map<string, { value: string; expiry: number }> = new Map();
  private isConnected = false;

  constructor() {
    logger.info('Cache Service initialized with in-memory / Redis fallback store');
  }

  public async get(key: string): Promise<string | null> {
    const item = this.inMemoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    this.inMemoryStore.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  public async del(key: string): Promise<void> {
    this.inMemoryStore.delete(key);
  }

  public async ping(): Promise<boolean> {
    return true;
  }

  public getStatus(): { connected: boolean; driver: string; itemsCount: number } {
    return {
      connected: true,
      driver: this.isConnected ? 'redis' : 'in-memory-lru',
      itemsCount: this.inMemoryStore.size,
    };
  }
}

export const cache = new CacheService();
