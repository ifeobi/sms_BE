@echo off

echo 🔄 Post-migration script running...

REM Regenerate Prisma client
echo 📦 Regenerating Prisma client...
npx prisma generate

echo ✅ Post-migration complete!
echo 💡 If you're using VS Code, restart TypeScript server: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
echo 💡 Or restart your IDE to refresh TypeScript definitions 