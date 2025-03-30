from flask import Flask, request, jsonify
import ollama

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
    return jsonify({'answer': response['message']['content']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=11434)
