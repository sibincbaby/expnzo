import { defineStore } from 'pinia';
import db, { Transaction, PendingInput, Category } from '../db';
import axios from 'axios';

interface TransactionState {
  transactions: Transaction[];
  pendingInputs: PendingInput[];
  categories: Category[];
  isProcessingQueue: boolean;
  isLoading: boolean;
  modelName: string; // Centralized place to store the Gemini model name
}

// SECURITY WARNING: Client-side API key usage is for development only
// The recommended approach is to create a server-side proxy that securely handles the API key
// For production, use a server-side proxy to handle API requests securely
const getApiKey = (): string => {
  // First try environment variable (for production builds)
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envApiKey) return envApiKey;
  
  // Fall back to localStorage for development (still not secure for production)
  return localStorage.getItem('geminiApiKey') || '';
};

// Get model name from localStorage or use default
const getModelName = (): string => {
  const storedModelName = localStorage.getItem('geminiModelName');
  return storedModelName || 'gemini-1.5-flash-latest';
};

const createGeminiApiUrl = (modelName: string): string => {
  // This could be replaced with your own proxy endpoint in production
  // Example: return 'https://your-backend.com/api/gemini-proxy';
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${getApiKey()}`;
};

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Extract JSON from markdown-formatted response
const extractJsonFromResponse = (text: string): any => {
  try {
    // Find content between ```json and ``` markers
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonStr = jsonMatch[1].trim();
      try {
        // Parse the JSON array and get the first item
        const jsonArray = JSON.parse(jsonStr);
        return Array.isArray(jsonArray) ? jsonArray[0] : jsonArray;
      } catch (error) {
        console.error('Error parsing JSON from markdown format:', error);
        throw new Error('Invalid JSON format in API response');
      }
    }
    
    // If no markdown formatting, try parsing directly
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing direct JSON:', error);
      throw new Error('Could not parse response as JSON');
    }
  } catch (error) {
    console.error('Error extracting JSON from response:', error);
    throw new Error('Failed to process API response');
  }
};

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
    pendingInputs: [],
    categories: [],
    isProcessingQueue: false,
    isLoading: false,
    modelName: getModelName() // Default model name
  }),

  getters: {
    getTransactionsByDate: (state) => {
      // Group transactions by date
      const grouped = state.transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.transactionDate).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      }, {} as Record<string, Transaction[]>);
      
      return grouped;
    },
    
    getPendingCount: (state) => {
      return state.pendingInputs.filter(item => 
        item.status === 'pending' || item.status === 'processing'
      ).length;
    },
    
    getFailedCount: (state) => {
      return state.pendingInputs.filter(item => item.status === 'failed').length;
    },
    
    getTotalAmount: (state) => {
      return state.transactions.reduce((total, transaction) => {
        if (transaction.type === 'debit') {
          return total - transaction.amount;
        } else {
          return total + transaction.amount;
        }
      }, 0);
    }
  },

  actions: {
    async fetchInitialData() {
      this.isLoading = true;
      try {
        // Fetch transactions
        const transactions = await db.transactions.toArray();
        this.transactions = transactions;
        
        // Fetch pending inputs
        const pendingInputs = await db.pendingInputs.toArray();
        this.pendingInputs = pendingInputs;
        
        // Fetch categories
        const categories = await db.categories.toArray();
        this.categories = categories;
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async addPendingTextExpense(text: string) {
      try {
        // Create and save pending input
        const pendingInput: PendingInput = {
          inputType: 'text',
          status: 'pending',
          createdAt: new Date(),
          rawData: text,
          audioData: null,
          retryCount: 0
        };
        
        const id = await db.pendingInputs.add(pendingInput);
        
        // Add to local state
        this.pendingInputs.push({...pendingInput, id});
        
        // Try to process right away
        this.processPendingQueue();
        
        return id;
      } catch (error) {
        console.error('Error adding pending text expense:', error);
        return null;
      }
    },
    
    async addPendingAudioExpense(audioBlob: Blob) {
      try {
        // Create and save pending input
        const pendingInput: PendingInput = {
          inputType: 'audio',
          status: 'pending',
          createdAt: new Date(),
          rawData: null,
          audioData: audioBlob,
          retryCount: 0
        };
        
        const id = await db.pendingInputs.add(pendingInput);
        
        // Add to local state
        this.pendingInputs.push({...pendingInput, id});
        
        // Try to process right away
        this.processPendingQueue();
        
        return id;
      } catch (error) {
        console.error('Error adding pending audio expense:', error);
        return null;
      }
    },
    
    async processPendingQueue() {
      // Don't run multiple queue processes at once
      if (this.isProcessingQueue) return;
      
      this.isProcessingQueue = true;
      
      try {
        // Get all pending inputs
        const pendingInputs = await db.pendingInputs
          .where('status')
          .equals('pending')
          .toArray();
        
        if (pendingInputs.length === 0) {
          this.isProcessingQueue = false;
          return;
        }
        
        // Process each pending input
        for (const input of pendingInputs) {
          // Update status to processing
          await db.pendingInputs.update(input.id!, { status: 'processing' });
          this.updatePendingInputStatus(input.id!, 'processing');
          
          try {
            // Get categories for context
            const categories = await db.categories.toArray();
            const categoryContext = categories.map(c => `${c.id}: ${c.categoryName}`).join(', ');
            
            let response;
            
            // Process text input
            if (input.inputType === 'text' && input.rawData) {
              response = await this.processTextWithGemini(input.rawData, categoryContext);
            } 
            // Process audio input
            else if (input.inputType === 'audio' && input.audioData) {
              response = await this.processAudioWithGemini(input.audioData, categoryContext);
            } else {
              throw new Error('Invalid input data');
            }
            
            // Parse response and save transaction
            if (response) {
              // Validate response data
              if (!response.item || typeof response.amount !== 'number' || 
                  !response.categoryId || !['debit', 'credit'].includes(response.type)) {
                throw new Error('Invalid response format from Gemini API');
              }

              // Validate category exists
              const categoryExists = categories.some(c => c.id === response.categoryId);
              if (!categoryExists) {
                throw new Error(`Invalid category ID: ${response.categoryId}`);
              }

              const transaction: Transaction = {
                item: response.item,
                amount: response.amount,
                categoryId: response.categoryId,
                type: response.type as 'debit' | 'credit',
                transactionDate: new Date(),
                createdAt: new Date()
              };
              
              // Save to database
              const id = await db.transactions.add(transaction);
              
              // Add to local state
              this.transactions.push({...transaction, id});
              
              // Delete from pending inputs
              await db.pendingInputs.delete(input.id!);
              this.removePendingInput(input.id!);
            }
          } catch (error) {
            console.error(`Error processing input ${input.id}:`, error);
            
            // Update retry count and status
            const retryCount = (input.retryCount || 0) + 1;
            const maxRetries = 3;
            
            if (retryCount >= maxRetries) {
              await db.pendingInputs.update(input.id!, { 
                status: 'failed', 
                retryCount,
                lastRetry: new Date()
              });
              this.updatePendingInput(input.id!, { 
                status: 'failed', 
                retryCount,
                lastRetry: new Date()
              });
            } else {
              // Exponential backoff for retries
              await db.pendingInputs.update(input.id!, { 
                status: 'pending', 
                retryCount,
                lastRetry: new Date()
              });
              this.updatePendingInput(input.id!, { 
                status: 'pending', 
                retryCount,
                lastRetry: new Date()
              });
            }
          }
          
          // Small delay between processing items
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Error processing pending queue:', error);
      } finally {
        this.isProcessingQueue = false;
      }
    },
    
    async processTextWithGemini(text: string, categoryContext: string) {
      try {
        const response = await axios.post(
          createGeminiApiUrl(this.modelName),
          {
            contents: [{
              parts: [{
                text: `Extract expense information from this text and return a JSON object with these fields:
                - item (string): The name of the item
                - amount (number): The amount in numbers
                - categoryId (number): The category ID from these options: ${categoryContext}
                - type (string): Either "debit" or "credit"

                Text to process: "${text}"`
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              topP: 0.1,
              maxOutputTokens: 200
            }
          }
        );
        
        // Extract and parse the JSON from the response
        const responseText = response.data.candidates[0].content.parts[0].text;
        return extractJsonFromResponse(responseText);
      } catch (error) {
        console.error('Error processing text with Gemini:', error);
        throw error;
      }
    },
    
    async processAudioWithGemini(audioBlob: Blob, categoryContext: string) {
      try {
        // Convert audio to base64
        const base64Audio = await blobToBase64(audioBlob);
        
        const response = await axios.post(
          createGeminiApiUrl(this.modelName),
          {
            contents: [{
              parts: [
                {
                  text: `Extract expense information from this audio and return a JSON object with these fields:
                  - item (string): The name of the item
                  - amount (number): The amount in numbers
                  - categoryId (number): The category ID from these options: ${categoryContext}
                  - type (string): Either "debit" or "credit"`
                },
                {
                  inline_data: {
                    mime_type: audioBlob.type,
                    data: base64Audio.split(',')[1]
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topP: 0.1,
              maxOutputTokens: 200
            }
          }
        );
        
        // Extract and parse the JSON from the response
        const responseText = response.data.candidates[0].content.parts[0].text;
        return extractJsonFromResponse(responseText);
      } catch (error) {
        console.error('Error processing audio with Gemini:', error);
        throw error;
      }
    },
    
    // Add a transaction immediately for optimistic UI
    async addTransactionOptimistically(transactionData: Partial<Transaction>) {
      try {
        // Create a complete transaction object with default values
        const transaction: Transaction = {
          item: transactionData.item || 'Untitled',
          amount: transactionData.amount || 0,
          categoryId: transactionData.categoryId || 1, // Default to first category
          type: transactionData.type || 'debit',
          transactionDate: transactionData.transactionDate || new Date(),
          createdAt: new Date()
        };
        
        // Save to database
        const id = await db.transactions.add(transaction);
        
        // Add to local state
        this.transactions.push({...transaction, id});
        
        return id;
      } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }
    },
    
    // Helper methods to update local state
    updatePendingInputStatus(id: number, status: PendingInput['status']) {
      const index = this.pendingInputs.findIndex(item => item.id === id);
      if (index !== -1) {
        this.pendingInputs[index].status = status;
      }
    },
    
    updatePendingInput(id: number, updates: Partial<PendingInput>) {
      const index = this.pendingInputs.findIndex(item => item.id === id);
      if (index !== -1) {
        this.pendingInputs[index] = {...this.pendingInputs[index], ...updates};
      }
    },
    
    removePendingInput(id: number) {
      const index = this.pendingInputs.findIndex(item => item.id === id);
      if (index !== -1) {
        this.pendingInputs.splice(index, 1);
      }
    }
  }
});