# Database Migration Guide

## Quick Commands

### 1. Create and Apply Migration

```bash
npm run db:migrate
```

This will:

- Create a new migration
- Apply it to the database
- Regenerate Prisma client automatically

### 2. Regenerate Prisma Client Only

```bash
npm run db:generate
```

### 3. Post-Migration Cleanup

```bash
npm run db:post-migrate
```

## Manual Steps (if needed)

### 1. Create Migration

```bash
npx prisma migrate dev --name "your_migration_name"
```

### 2. Regenerate Prisma Client

```bash
npx prisma generate
```

### 3. Restart TypeScript Language Server

**VS Code:**

1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

**Other IDEs:**

- Restart your IDE
- Or reload the TypeScript project

## Troubleshooting TypeScript Errors

### After Schema Changes

1. **Regenerate Prisma Client:**

   ```bash
   npx prisma generate
   ```

2. **Restart TypeScript Server:**
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
   - Or restart your IDE

3. **Clear TypeScript Cache:**
   ```bash
   rm -rf node_modules/.cache
   npm run build
   ```

### Common Issues

**Issue:** TypeScript still shows old schema errors
**Solution:**

1. Run `npx prisma generate`
2. Restart TypeScript server
3. Restart your IDE if needed

**Issue:** Prisma client not updated
**Solution:**

1. Check if migration was applied: `npx prisma migrate status`
2. Regenerate client: `npx prisma generate`
3. Restart development server: `npm run start:dev`

## Migration Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration:** `npm run db:migrate`
3. **Restart TypeScript server** in your IDE
4. **Test your changes**

## Available Scripts

- `npm run db:migrate` - Create and apply migration + regenerate client
- `npm run db:generate` - Regenerate Prisma client only
- `npm run db:reset` - Reset database (WARNING: deletes all data)
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio
- `npm run db:post-migrate` - Post-migration cleanup

## Best Practices

1. **Always regenerate client** after schema changes
2. **Restart TypeScript server** after Prisma client changes
3. **Test migrations** in development before production
4. **Use descriptive migration names**
5. **Review generated SQL** in migration files
