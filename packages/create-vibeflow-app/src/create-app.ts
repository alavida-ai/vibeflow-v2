import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CreateAppOptions {
  projectPath: string;
  projectName: string;
  template: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  skipInstall: boolean;
}

export async function createApp(options: CreateAppOptions): Promise<void> {
  const { projectPath, projectName, template, packageManager, skipInstall } = options;

  // Ensure project directory exists
  await fs.ensureDir(projectPath);

  console.log('📁 Creating project structure...');

  // Copy template files
  const templatePath = path.join(__dirname, '..', 'templates', template);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template "${template}" not found`);
  }

  await copyTemplate(templatePath, projectPath, {
    PROJECT_NAME: projectName,
  });

  console.log('✅ Project structure created');

  // Install dependencies if not skipped
  if (!skipInstall) {
    console.log(`📦 Installing dependencies with ${packageManager}...`);
    await installDependencies(projectPath, packageManager);
    console.log('✅ Dependencies installed');
  }

  // Initialize git repository
  console.log('🔧 Initializing git repository...');
  await initializeGit(projectPath);
  console.log('✅ Git repository initialized');
}

async function copyTemplate(
  templatePath: string, 
  projectPath: string, 
  replacements: Record<string, string>
): Promise<void> {
  const files = await fs.readdir(templatePath, { withFileTypes: true });

  for (const file of files) {
    const sourcePath = path.join(templatePath, file.name);
    let targetPath = path.join(projectPath, file.name);

    if (file.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyTemplate(sourcePath, targetPath, replacements);
    } else {
      // Handle special file naming
      if (file.name === 'gitignore.template') {
        targetPath = path.join(projectPath, '.gitignore');
      } else if (file.name === 'env.example') {
        targetPath = path.join(projectPath, '.env.example');
      } else if (file.name.endsWith('.template')) {
        targetPath = path.join(projectPath, file.name.replace('.template', ''));
      }

      // Read file content and replace placeholders
      let content = await fs.readFile(sourcePath, 'utf8');
      
      for (const [placeholder, replacement] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacement);
      }

      await fs.writeFile(targetPath, content);
    }
  }
}

function installDependencies(projectPath: string, packageManager: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const installCommand = packageManager === 'yarn' ? 'yarn' : packageManager === 'npm' ? 'npm' : 'pnpm';
    const args = packageManager === 'yarn' ? [] : ['install'];

    const child = spawn(installCommand, args, {
      cwd: projectPath,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${packageManager} install failed with exit code ${code}`));
        return;
      }
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

function initializeGit(projectPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['init'], {
      cwd: projectPath,
      stdio: 'pipe',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.yellow('⚠️  Could not initialize git repository'));
        resolve();
        return;
      }
      resolve();
    });

    child.on('error', (error) => {
      console.log(chalk.yellow('⚠️  Git not available, skipping repository initialization'));
      resolve();
    });
  });
}
