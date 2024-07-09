#!/bin/bash

BASE_URL="https://raw.githubusercontent.com/smolpepe59/mobiverse-nodejs/main/tokens/token"

OUTPUT_DIR="/home/ubuntu/mobiverse-nodejs/tokens"

for i in {0..2}; do
    URL="${BASE_URL}${i}.txt"
    OUTPUT_FILE="${OUTPUT_DIR}/token${i}.txt"
    wget -O "$OUTPUT_FILE" "$URL"
    
    echo "Iteration $((i + 1)) completed, downloaded $URL."
done


