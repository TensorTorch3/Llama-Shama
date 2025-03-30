import { OLLAMA_API_URL, OLLAMA_MODEL } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Message interface
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  answer: string;
}

interface OllamaResponse {
  response: string;
  error?: string;
}

export const ollamaService = {
  identifyPlant: async (description: string): Promise<OllamaResponse> => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          messages: [{
            role: "user",
            content: `Please identify this plant: ${description}. 
            Provide details about: species, characteristics, habitat, and safety concerns.`
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Ollama service:', error);
      throw error;
    }
  }
};

/**
 * Service for directly interacting with Ollama API
 */
class OllamaService {
  private static instance: OllamaService;
  private responseCache: Record<string, string> = {};

  private constructor() {
    this.loadCache();
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * Load cached responses from AsyncStorage
   */
  private async loadCache(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem('ollama_response_cache');
      if (cachedData) {
        this.responseCache = JSON.parse(cachedData);
        console.log('Loaded Ollama response cache with', Object.keys(this.responseCache).length, 'entries');
      }
    } catch (error) {
      console.error('Failed to load Ollama response cache', error);
    }
  }

  /**
   * Save current cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      await AsyncStorage.setItem('ollama_response_cache', JSON.stringify(this.responseCache));
    } catch (error) {
      console.error('Failed to save Ollama response cache', error);
    }
  }

  /**
   * Check if Ollama API is available
   */
  public async isAvailable(): Promise<boolean> {
    try {
      console.log("Checking Ollama availability at:", OLLAMA_API_URL);
      const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) {
        console.warn('Ollama check failed - response not OK');
        return false;
      }

      const data = await response.json();
      console.log("Ollama models available:", data.models?.length || 0);
      
      return true;
    } catch (error) {
      console.warn('Ollama connection error:', error);
      return false;
    }
  }

  /**
   * Send a chat request directly to Ollama API
   */
  public async chat(messages: Message[]): Promise<ChatResponse> {
    const isAvailable = await this.isAvailable();
    
    // Get the last user message for caching purposes
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) {
      return { answer: "Please provide a question or description." };
    }

    if (!isAvailable) {
      // Return cached response if available
      const cacheKey = lastUserMsg.content.toLowerCase().trim();
      if (this.responseCache[cacheKey]) {
        return { answer: this.responseCache[cacheKey] };
      }
      return { answer: "Ollama is not available. Please check your connection or start the Ollama service." };
    }

    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the answer from the response
      const answer = data.message?.content || 'No valid response content from Ollama';
      
      // Cache this response for offline use
      this.responseCache[lastUserMsg.content.toLowerCase().trim()] = answer;
      this.saveCache();

      return { answer };
    } catch (error) {
      console.error('Error sending chat to Ollama:', error);
      const cacheKey = lastUserMsg.content.toLowerCase().trim();
      
      if (this.responseCache[cacheKey]) {
        return { answer: this.responseCache[cacheKey] };
      }
      
      return { answer: "Failed to get a response from Ollama. Please check your connection or try again later." };
    }
  }
}

export default OllamaService.getInstance();
