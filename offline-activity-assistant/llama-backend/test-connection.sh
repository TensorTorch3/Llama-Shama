#!/bin/bash

# Configuration - update this to match your environment
LLAMA_API_URL="http://10.232.157.211:5001"
# For local testing, use:
# LLAMA_API_URL="http://localhost:5001"

echo "Testing connection to Llama server at ${LLAMA_API_URL}..."
echo

# Test health endpoint
echo "Testing health endpoint..."
curl -s ${LLAMA_API_URL}/health
echo
echo

# Test ask endpoint
echo "Testing ask endpoint..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the symptoms of a sprained ankle?"}' \
  ${LLAMA_API_URL}/ask
echo
echo

echo "Connection test complete."
