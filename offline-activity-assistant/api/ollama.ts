import { OLLAMA_API_URL } from '@/config/api';

export async function askOllama(prompt: string) {
  try {
    console.log("askOllama: Sending prompt:", prompt); // Add log
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama2",
        prompt,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("askOllama: HTTP error:", response.status, errorText); // Add log
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("askOllama: Received data:", data); // Add log
    // Prefer 'answer', then 'response'
    return data.answer ?? data.response ?? data;
  } catch (error) {
    console.error('askOllama: Error calling Ollama:', error);
    throw error;
  }
}
