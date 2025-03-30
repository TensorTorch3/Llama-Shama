from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key from .env
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow requests from any origin

@app.route('/')
def home():
    return jsonify({"message": "Llama backend is running!"})

# Check if we should use Groq or a fallback mode
try:
    import groq
    # Groq setup
    MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        logger.warning("GROQ_API_KEY not found in environment, using fallback mode")
        USE_GROQ = False
    else:
        client = groq.Client(api_key=api_key)
        USE_GROQ = True
        logger.info(f"Using Groq with model: {MODEL}")
except ImportError:
    logger.warning("groq package not installed, using fallback mode")
    USE_GROQ = False

# Health check - required to verify if the backend is available
@app.route("/health", methods=["GET"])
def health():
    logger.info("Health check endpoint called")
    return jsonify({"status": "ok"}), 200

# Fallback responses when Groq is not available
FALLBACK_RESPONSES = {
    "default": "I'm a simple AI assistant. How can I help you today?",
    "plant": "This appears to be a common plant. Without more details, I can't identify it specifically. Always be cautious with unknown plants and don't consume them.",
    "emergency": "For any medical emergency, please call emergency services immediately (911 in the US). Do not rely on AI for urgent medical assistance.",
    "hiking": "When hiking, always bring water, tell someone your plans, check weather conditions, and be prepared for emergencies.",
    "weather": "It's important to check weather forecasts before outdoor activities. Use reliable weather services and be prepared for changing conditions.",
    "safety": "Outdoor safety is crucial. Always be prepared with proper gear, water, food, navigation tools, and emergency supplies.",
}

def get_fallback_response(question):
    """Get an appropriate fallback response based on keywords in the question"""
    question = question.lower()
    
    if "plant" in question or "identify" in question:
        return FALLBACK_RESPONSES["plant"]
    elif "emergency" in question or "first aid" in question:
        return FALLBACK_RESPONSES["emergency"]
    elif "hik" in question or "trail" in question:
        return FALLBACK_RESPONSES["hiking"]
    elif "weather" in question:
        return FALLBACK_RESPONSES["weather"]
    elif "safety" in question:
        return FALLBACK_RESPONSES["safety"]
    else:
        return FALLBACK_RESPONSES["default"]

# Ask: Simple one-shot question
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    logger.info(f"Ask endpoint received data: {data}")
    
    # Support both 'question' and 'prompt' keys for flexibility
    question = data.get("question") or data.get("prompt")
    
    if not question:
        logger.error("No question or prompt provided")
        return jsonify({"error": "Missing question or prompt"}), 400

    # Check if we're using Groq or fallback mode
    if USE_GROQ:
        try:
            logger.info(f"Sending question to Groq: {question[:100]}...")
            chat_completion = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant knowledgeable about outdoor safety, medical advice, and nature."},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=1024
            )
            
            response_text = chat_completion.choices[0].message.content
            logger.info(f"Received response from Groq: {response_text[:100]}...")
            
            # Return in the expected format with 'answer' key
            return jsonify({"answer": response_text})
        
        except Exception as e:
            logger.error(f"Error processing request with Groq: {str(e)}")
            fallback_response = get_fallback_response(question)
            return jsonify({"answer": fallback_response})
    else:
        # Use fallback mode
        logger.info("Using fallback mode for response")
        fallback_response = get_fallback_response(question)
        return jsonify({"answer": fallback_response})

# Chat endpoint
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    logger.info(f"Chat endpoint called with {len(data.get('messages', []))} messages")
    
    messages = data.get("messages", [])
    if not messages or not isinstance(messages, list):
        logger.error("Invalid or missing messages array")
        return jsonify({"error": "Invalid or missing messages array"}), 400
    
    # Extract the user's question from the messages
    user_messages = [msg for msg in messages if msg.get("role") == "user"]
    if not user_messages:
        return jsonify({"answer": "Please provide a question."}), 200
    
    last_question = user_messages[-1].get("content", "")
    
    # Check if we're using Groq or fallback mode
    if USE_GROQ:
        try:
            chat_completion = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            response_text = chat_completion.choices[0].message.content
            logger.info(f"Chat response received: {response_text[:100]}...")
            
            return jsonify({"answer": response_text})
        
        except Exception as e:
            logger.error(f"Error in chat endpoint: {str(e)}")
            fallback_response = get_fallback_response(last_question)
            return jsonify({"answer": fallback_response})
    else:
        # Use fallback mode
        logger.info("Using fallback mode for chat response")
        fallback_response = get_fallback_response(last_question)
        return jsonify({"answer": fallback_response})

# Emergency endpoint
@app.route("/emergency", methods=["POST"])
def emergency():
    data = request.get_json()
    logger.info(f"Emergency endpoint called with data: {data}")
    
    question = data.get("question")
    emergency_type = data.get("emergency_type", "general")

    if not question:
        logger.error("Missing emergency question")
        return jsonify({"error": "Missing emergency question"}), 400

    prompt = f"This is a {emergency_type} emergency. {question}"
    
    # Check if we're using Groq or fallback mode
    if USE_GROQ:
        try:
            chat_completion = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a calm, accurate, first-responder assistant giving step-by-step advice in emergency situations. Keep answers actionable and concise."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=1024
            )
            
            response_text = chat_completion.choices[0].message.content
            logger.info(f"Emergency response received: {response_text[:100]}...")
            
            return jsonify({"answer": response_text})
        
        except Exception as e:
            logger.error(f"Error in emergency endpoint: {str(e)}")
            return jsonify({"answer": FALLBACK_RESPONSES["emergency"]})
    else:
        # Use fallback mode
        logger.info("Using fallback mode for emergency response")
        return jsonify({"answer": FALLBACK_RESPONSES["emergency"]})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
