import Dexie from 'dexie';

// Define types for our database tables
export interface Category {
  id?: number;
  categoryName: string;
}

export interface PendingInput {
  id?: number;
  inputType: 'text' | 'audio';
  status: 'pending' | 'processing' | 'failed' | 'completed';
  createdAt: Date;
  rawData?: string | null;
  audioData?: Blob | null;
  retryCount: number;
  lastRetry?: Date | null;
}

export interface Transaction {
  id?: number;
  categoryId: number;
  item: string;
  amount: number;
  type: 'debit' | 'credit';
  transactionDate: Date;
  createdAt: Date;
}

// Define our database class
class ExpenzoDB extends Dexie {
  categories!: Dexie.Table<Category, number>;
  pendingInputs!: Dexie.Table<PendingInput, number>;
  transactions!: Dexie.Table<Transaction, number>;

  constructor() {
    super('ExpenzoDB');
    
    this.version(1).stores({
      categories: '++id, categoryName',
      pendingInputs: '++id, inputType, status, createdAt',
      transactions: '++id, categoryId, transactionDate, createdAt, type'
    });
  }

  // Seed the database with default categories
  async seedDefaultCategories() {
    const count = await this.categories.count();
    
    if (count === 0) {
      const defaultCategories: Category[] = [
        { categoryName: 'Food' },
        { categoryName: 'Transportation' },
        { categoryName: 'Grocery' },
        { categoryName: 'Entertainment' },
        { categoryName: 'Utilities' },
        { categoryName: 'Health' },
        { categoryName: 'Shopping' },
        { categoryName: 'Other' }
      ];
      
      await this.categories.bulkAdd(defaultCategories);
    }
  }
}

const db = new ExpenzoDB();

// Initialize the database
export async function initDatabase() {
  try {
    await db.seedDefaultCategories();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default db;