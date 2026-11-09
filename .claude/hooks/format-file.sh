#!/usr/bin/env bash
# PostToolUse hook: format and lint-fix only the file Claude just edited. Exit 2 hands
# remaining ESLint errors back to Claude so it fixes them in the same turn.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
cd "$CLAUDE_PROJECT_DIR" || exit 0

case "$file" in
  '' | */node_modules/* | */src/components/ui/* | */_parked/*)
    exit 0
    ;;
  */src/*.ts | */src/*.tsx)
    pnpm exec prettier --write "$file" >/dev/null 2>&1
    if ! output=$(pnpm exec eslint --fix "$file" 2>&1); then
      echo "$output" >&2
      exit 2
    fi
    ;;
  *.ts | *.tsx | *.json | *.css | *.md | *.yaml | *.yml | *.mjs | *.js | *.html)
    pnpm exec prettier --write --ignore-unknown "$file" >/dev/null 2>&1
    ;;
esac

exit 0
