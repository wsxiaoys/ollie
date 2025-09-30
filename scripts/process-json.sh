#!/bin/bash

# Function to process a single file
process_file() {
  local i="$1"
  
  echo "Processing $i"
  question=$(cat "$i" | jq -r '.question')
cat <<EOF | pochi --model=google/gemini-2.5-flash &> /dev/null
Question: $question

===

Please above following question into a proper file name. Current file name is $i. The new file name shall be in hypenated lowercase format, for example 'how-to-create-a-vue-3-interface', run executeCommand with 'mv' to rename. The file name shall no longer than 8 words.

YOU GOAL IS ONLY TO RENAME THE FILE, DO NOTHING ELSE, run attemptCompletion immediately after renaming.
EOF
}

# Export the function so it's available to subshells
export -f process_file
export POCHI_LIVEKIT_NO_SYNC=1

# Find all JSON files, filter out numeric filenames, and process them in parallel (10 at a time)
find library -name "*.json" | while read -r file; do
  if [[ $(basename "$file" .json) =~ ^[0-9]+$ ]]; then
    echo "$file"
  fi
done | xargs -n 1 -P 50 bash -c 'process_file "$@"' _
