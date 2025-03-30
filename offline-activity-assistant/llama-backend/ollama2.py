from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        response = requests.post(
            'http://localhost:11434/api/chat',
            json=data,
            stream=False
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({
                "error": f"Ollama error: {response.status_code}"
            }), response.status_code
            
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)