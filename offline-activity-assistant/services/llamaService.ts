import { askOllama } from '../api/ollama';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class LlamaService {
  private lastCheckTime: number = 0;
  private isBackendAvailableCache: boolean | null = null;
  private cacheValidityDuration = 30000; // 30 seconds

  /**
   * Asks a question to the Llama API
   */
  async ask(prompt: string): Promise<{ answer: string }> {
    try {
      console.log('LlamaService: Sending prompt to API:', prompt.substring(0, 50) + '...');
      const response = await askOllama(prompt);
      console.log('LlamaService: Received response from API');
      return { answer: response };
    } catch (error) {
      console.error('LlamaService: Error in ask method:', error);
      const fallbackResponse = this.getOfflineResponse(prompt);
      return { answer: fallbackResponse || 'Sorry, I could not process your request at this time.' };
    }
  }

  /**
   * Sends a chat conversation to the API
   */
  async chat(messages: Message[]): Promise<{ answer: string }> {
    try {
      // Extract the user's message for fallback processing
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      const prompt = userMessage;
      
      const response = await this.ask(prompt);
      return response;
    } catch (error) {
      console.error('LlamaService: Error in chat method:', error);
      return { answer: 'Sorry, I could not process your chat request.' };
    }
  }

  /**
   * Gets emergency guidance
   */
  async emergency(question: string, emergencyType: string): Promise<{ answer: string }> {
    try {
      const prompt = `EMERGENCY SITUATION - ${emergencyType}: ${question}. Please provide immediate first aid guidance.`;
      return await this.ask(prompt);
    } catch (error) {
      console.error('LlamaService: Error in emergency method:', error);
      return { 
        answer: 'For any medical emergency, please call emergency services immediately (911 in the US). Do not rely solely on AI for urgent medical assistance.'
      };
    }
  }

  /**
   * Checks if the backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached result if it's still valid
    if (this.isBackendAvailableCache !== null && (now - this.lastCheckTime) < this.cacheValidityDuration) {
      return this.isBackendAvailableCache;
    }
    
    try {
      // Simple prompt to test availability
      console.log("isBackendAvailable: Checking backend health"); // Add log
      await this.ask('test');
      this.isBackendAvailableCache = true;
      this.lastCheckTime = now;
      console.log("isBackendAvailable: Backend is available"); // Add log
      return true;
    } catch (error) {
      console.error("isBackendAvailable: Backend is unavailable:", error); // Add log
      this.isBackendAvailableCache = false;
      this.lastCheckTime = now;
      return false;
    }
  }

  /**
   * Provides offline fallback responses based on keywords
   */
  getOfflineResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('plant') || lowerPrompt.includes('identify')) {
      return "I cannot identify plants while offline. Please describe the plant in detail when connection is restored. Never touch or consume unidentified plants.";
    }
    
    if (lowerPrompt.includes('emergency') || lowerPrompt.includes('help') || lowerPrompt.includes('urgent')) {
      return "For emergencies, please call emergency services immediately. This app cannot provide reliable emergency assistance while offline.";
    }
    
    if (lowerPrompt.includes('hike') || lowerPrompt.includes('trail')) {
      return "I cannot provide specific hiking information while offline. Always be prepared with maps, water, and emergency supplies when hiking.";
    }
    
    return "I'm currently in offline mode and can't process your request. Please try again when connected to the internet.";
  }
}

export default new LlamaService();
