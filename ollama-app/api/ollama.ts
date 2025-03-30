// shared/api/ollama.ts
import axios from 'axios';

// You can import config from a shared location or define it here
// For simplicity, we'll use the same IP as in the config file
const OLLAMA_API_URL = 'http://10.232.157.211:11434';

export async function askOllama(prompt: string): Promise<string> {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      prompt: prompt,
      model: "llama2"  // You may need to specify which model to use
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data.response ?? 'No response received.';
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return 'Error occurred while processing your request.';
  }
}