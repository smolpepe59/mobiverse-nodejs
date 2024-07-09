#!/bin/bash

BASE_URL="https://raw.githubusercontent.com/smolpepe59/mobiverse-nodejs/main/tokens/token"

OUTPUT_DIR="/home/ubuntu/mobiverse-nodejs/tokens"

for ((i = 1; i <= 3; i++)); do
    URL="${BASE_URL}${i}.txt"
    OUTPUT_FILE="${OUTPUT_DIR}/token${i}.txt"
    wget -O "$OUTPUT_FILE" "$URL"
    
    echo "Iteration $i completed, downloaded $URL."
done
