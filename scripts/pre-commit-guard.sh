#!/bin/bash
# Pre-commit guard: ensure critical route files exist
critical_files=(
  "app/api/documents/upload/route.ts"
  "app/api/chat/route.ts"
  "app/api/documents/route.ts"
  "app/api/documents/[id]/route.ts"
)

for file in "${critical_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Critical file missing: $file"
    echo "This pre-commit hook prevented accidental deletion."
    echo "If you intentionally deleted it, bypass with: git commit --no-verify"
    exit 1
  fi
done

echo "✓ All critical route files present"
