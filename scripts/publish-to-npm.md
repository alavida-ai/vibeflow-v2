# Publishing Vibeflow Packages to NPM

## Prerequisites

1. **NPM Account**: Make sure you have an npm account and are logged in:
   ```bash
   npm login
   ```

2. **Organization** (Optional): If publishing under an organization, ensure you have access.

## Publishing Steps (pnpm Workspace Method - RECOMMENDED)

### 1. Build All Packages
```bash
# Build all packages in dependency order
pnpm build -r
```

### 2. Dry Run (Test Publishing)
```bash
# See what will be published and verify dependency resolution
pnpm publish -r --dry-run
```

### 3. Publish All Packages
```bash
# Publish all packages in dependency order
# pnpm automatically converts workspace:* to actual versions
pnpm publish -r
```

## Alternative: Manual Publishing

### 1. Publish `@vibeflow/compiler` First (Dependency)

```bash
cd packages/compiler

# Verify the package builds correctly
pnpm build

# Check what will be published
pnpm pack --dry-run

# Publish to npm
pnpm publish
```

### 2. Publish `vibeflow-ai` CLI Package

```bash
cd packages/cli

# Verify the package builds correctly
pnpm build

# Check what will be published
pnpm pack --dry-run

# Publish to npm
pnpm publish
```

### 3. Publish `create-vibeflow-app` Package

```bash
cd packages/create-vibeflow-app

# Verify the package builds correctly
pnpm build

# Check what will be published
pnpm pack --dry-run

# Publish to npm
pnpm publish
```

## How pnpm Handles Workspace Dependencies

pnpm automatically handles workspace dependency resolution during publishing:

### **Development Time:**
```json
{
  "dependencies": {
    "@vibeflow/compiler": "workspace:*"
  }
}
```

### **Publishing Time:**
pnpm converts this to:
```json
{
  "dependencies": {
    "@vibeflow/compiler": "^1.0.0"
  }
}
```

### **Manual Override (if needed):**
```json
{
  "dependencies": {
    "@vibeflow/compiler": "workspace:*"
  },
  "publishConfig": {
    "dependencies": {
      "@vibeflow/compiler": "^1.0.0"
    }
  }
}
```

## Testing Published Packages

Once published, users can:

### Install and use the CLI:
```bash
# Install globally
npm install -g vibeflow-ai

# Use the CLI
vibe --help
vibeflow-ai --help
```

### Create new projects:
```bash
# npm create pattern
npm create vibeflow@latest my-project

# Direct installation
npx create-vibeflow-app my-project
```

## Version Management

For future releases:

```bash
# Bump version
npm version patch  # or minor, major

# Publish new version
npm publish
```

## Package URLs

After publishing, packages will be available at:
- `vibeflow-ai`: https://www.npmjs.com/package/vibeflow-ai
- `create-vibeflow-app`: https://www.npmjs.com/package/create-vibeflow-app

## Troubleshooting

1. **Package name conflicts**: If names are taken, consider variations like:
   - `@yourorg/vibeflow-ai`
   - `vibeflow-cli`
   - `vibeflow-dev`

2. **Publishing errors**: Check package.json for required fields and ensure you're logged in to npm.

3. **Scope issues**: For scoped packages, ensure proper organization access.
