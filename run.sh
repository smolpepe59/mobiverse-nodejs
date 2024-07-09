#!/bin/bash

node utils.js

BASE_SESSION_NAME="mobi-nodejs"

for ((i = 1; i <= 3; i++)); do
    SESSION_NAME="${BASE_SESSION_NAME}${i}"

    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        tmux kill-session -t "$SESSION_NAME"
        echo "Session $SESSION_NAME killed."
        sleep 3
    fi
    
    # Start a new session
    tmux new-session -d -s "$SESSION_NAME"
    echo "New Session $SESSION_NAME created."
    
    # Sleep for a few seconds to ensure the tmux session is fully initialized
    sleep 3
    
    # Send command to execute launch.sh within the tmux session
    tmux send-keys -t "$SESSION_NAME" 'cd /home/ubuntu/mobiverse-nodejs' Enter
    tmux send-keys -t "$SESSION_NAME" 'node index.js' Enter

    echo "Iteration $i completed, session $SESSION_NAME created and command sent."
done

echo "All iterations completed."
