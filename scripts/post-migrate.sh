#!/bin/bash

echo "🔄 Post-migration script running..."

# Regenerate Prisma client
echo "📦 Regenerating Prisma client..."
npx prisma generate

# Restart TypeScript language server (if using VS Code)
echo "🔄 Restarting TypeScript language server..."
# This will trigger a TypeScript restart in VS Code
# You can also manually restart TypeScript: Cmd+Shift+P -> "TypeScript: Restart TS Server"

echo "✅ Post-migration complete!"
echo "💡 If you're using VS Code, restart TypeScript server: Cmd+Shift+P -> 'TypeScript: Restart TS Server'" 