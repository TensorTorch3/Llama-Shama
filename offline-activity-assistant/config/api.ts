/**
 * API configuration for the application
 */

// Define the base URL for the Llama backend service
export const LLAMA_API_URL = 'http://localhost:5001';

// For production/different environments:
// export const LLAMA_API_URL = 'http://10.232.157.211:5001';

// Optional: Timeout settings (in milliseconds)
export const API_TIMEOUT = 5000; // 5 seconds

// Configuration for API endpoints

// Update this URL to match your Ollama API server
export const OLLAMA_API_URL = 'http://localhost:11434';
