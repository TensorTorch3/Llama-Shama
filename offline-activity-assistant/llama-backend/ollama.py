import requests
import json

url = "http://localhost:11434/api/chat"

payload = {
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
}

try:
    response = requests.post(url, json=payload, stream=True)
    response.raise_for_status()  # Ensure HTTP errors are raised

    print("Streaming response from Ollama:")
    for line in response.iter_lines(decode_unicode=True):  # Fixed undefined "decode_unicode"
        if line:
            try:
                json_data = json.loads(line)
                print(json_data)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")

def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content.decode('utf-8')  # Fixed undefined "decode_unicode"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
