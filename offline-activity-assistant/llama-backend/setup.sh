#!/bin/bash

echo "Setting up Llama backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed. Please install pip3 and try again."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Ensure pip is up-to-date
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install flask flask-cors python-dotenv ollama groq

# Create sample .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating sample .env file..."
    cat > .env << EOL
# API keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-8b-8192

# Server configuration
PORT=5001
EOL
    echo "Created .env file. Please update it with your API keys."
fi

echo "Setup completed successfully."
echo "To start the server, run: source venv/bin/activate && python app.py"
