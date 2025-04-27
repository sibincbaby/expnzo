import { defineStore } from 'pinia';
import db, { Transaction, PendingInput, Category } from '../db';
import axios from 'axios';

interface TransactionState {
  transactions: Transaction[];
  pendingInputs: PendingInput[];
  categories: Category[];
  isProcessingQueue: boolean;
  isLoading: boolean;
}

// SECURITY WARNING: Client-side API key usage is INSECURE - only for development!
// A backend proxy MUST be implemented before production to secure the API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
    pendingInputs: [],
    categories: [],
    isProcessingQueue: false,
    isLoading: false,
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
          // Skip if no API key (development safeguard)
          if (!GEMINI_API_KEY) {
            console.error('Gemini API Key not found in environment variables');
            continue;
          }
          
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
              const transaction: Transaction = {
                item: response.item,
                amount: Number(response.amount),
                categoryId: Number(response.categoryId),
                type: response.type,
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
      console.log(categoryContext);
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: `Extract expense information from this text: "${text}". 
                Available categories: ${categoryContext}.
                Return ONLY a valid JSON with these exact fields:
                {
                  "item": "item_name",
                  "amount": "amount_in_numbers",
                  "categoryId": "category_id",
                  "type": "debit_or_credit"
                }`
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 50,
            }
          }
        );
        
        // Parse the response to get the JSON string
        const jsonString = response.data.candidates[0].content.parts[0].text;
        // Extract JSON object from the response text
        const jsonMatch = jsonString.match(/({.*})/s);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          return parsedData;
        }
        
        throw new Error('Failed to parse Gemini response');
      } catch (error) {
        console.error('Error processing text with Gemini:', error);
        throw error;
      }
    },
    
    async processAudioWithGemini(audioBlob: Blob, categoryContext: string) {
      try {
        // Convert audio to base64
        const base64Audio = await blobToBase64(audioBlob);
        
        // Define system instruction
        const systemInstruction = `Listen to this audio and extract the following information.
        Available categories: ${categoryContext}.
        Return ONLY a valid JSON with these exact fields:
        {
          "item": "what was mentioned",
          "amount": "any mentioned amount",
          "categoryId": "category_id",
          "type": "debit"
        }`;
        
        // Prepare request body
        const requestBody = {
          contents: [{
            parts: [
              { text: systemInstruction },
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
            maxOutputTokens: 50,
          }
        };
        
        // Send request to Gemini
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse the response
        const jsonString = response.data.candidates[0].content.parts[0].text;
        const jsonMatch = jsonString.match(/({.*})/s);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          return parsedData;
        }
        
        throw new Error('Failed to parse Gemini response');
      } catch (error) {
        console.error('Error processing audio with Gemini:', error);
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