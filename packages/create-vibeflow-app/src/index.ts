#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import validateProjectName from 'validate-npm-package-name';
import { createApp } from './create-app.js';

const program = new Command();

console.log(chalk.cyan('create-vibeflow-app'));

program
  .name('create-vibeflow-app')
  .description('Create a new Vibeflow application')
  .version('2.0.0')
  .argument('[project-directory]', 'directory to create the project in')
  .option('--template <name>', 'template to use', 'default')
  .option('--use-pnpm', 'use pnpm instead of npm')
  .option('--use-yarn', 'use yarn instead of npm')
  .option('--skip-install', 'skip installing dependencies')
  .action(async (projectDirectory, options) => {
    console.log();

    let projectName: string;
    let targetDirectory: string;

    // If project directory is provided as argument, use it as project name and create subdirectory
    if (projectDirectory) {
      projectName = projectDirectory;
      targetDirectory = projectDirectory;
    } else {
      // Prompt for project name
      const projectResponse = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'What is your project named?',
        initial: 'my-vibeflow-app',
        validate: (value: string) => {
          const validation = validateProjectName(value);
          if (validation.validForNewPackages) {
            return true;
          }
          return validation.errors?.join(', ') || 'Invalid project name';
        },
      });

      if (!projectResponse.projectName) {
        console.log('\nOperation cancelled.');
        process.exit(1);
      }

      projectName = projectResponse.projectName;

      // Prompt for target directory
      const directoryResponse = await prompts({
        type: 'text',
        name: 'targetDirectory',
        message: 'Where should we create your project?',
        initial: '.',
        format: (value: string) => value.trim() || '.',
      });

      if (directoryResponse.targetDirectory === undefined) {
        console.log('\nOperation cancelled.');
        process.exit(1);
      }

      targetDirectory = directoryResponse.targetDirectory || '.';
    }

    // Validate project name
    const validation = validateProjectName(projectName);
    if (!validation.validForNewPackages) {
      console.error(
        chalk.red(
          `Invalid project name "${projectName}": ${validation.errors?.join(', ')}`
        )
      );
      process.exit(1);
    }

    // Determine the actual project path
    let resolvedProjectPath: string;
    let projectDirName: string;

    if (targetDirectory === '.') {
      // Create in current directory
      resolvedProjectPath = path.resolve(process.cwd());
      projectDirName = projectName;
      
      // Check if current directory is empty (or only has .git, .gitignore, etc.)
      const currentDirContents = await fs.readdir(resolvedProjectPath);
      const allowedFiles = ['.git', '.gitignore', '.gitattributes', 'README.md', 'LICENSE'];
      const conflictingFiles = currentDirContents.filter(file => !allowedFiles.includes(file));
      
      if (conflictingFiles.length > 0) {
        console.error(
          chalk.red(`Current directory is not empty. The following files/directories would conflict:`)
        );
        conflictingFiles.slice(0, 10).forEach(file => console.error(chalk.red(`  - ${file}`)));
        if (conflictingFiles.length > 10) {
          console.error(chalk.red(`  ... and ${conflictingFiles.length - 10} more`));
        }
        console.error(chalk.red(`Please choose an empty directory or use a subdirectory.`));
        process.exit(1);
      }
    } else {
      // Create in subdirectory
      resolvedProjectPath = path.resolve(targetDirectory);
      projectDirName = path.basename(resolvedProjectPath);
    }

    // Check if directory already exists (only for subdirectory creation)
    if (targetDirectory !== '.' && fs.existsSync(resolvedProjectPath)) {
      console.error(
        chalk.red(`Directory "${targetDirectory}" already exists. Please choose a different directory.`)
      );
      process.exit(1);
    }

    console.log(`Creating a new Vibeflow app in ${chalk.green(resolvedProjectPath)}`);
    console.log();

    // Determine package manager
    let packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm';
    if (options.usePnpm) {
      packageManager = 'pnpm';
    } else if (options.useYarn) {
      packageManager = 'yarn';
    }

    try {
      await createApp({
        projectPath: resolvedProjectPath,
        projectName: projectDirName,
        template: options.template || 'default',
        packageManager,
        skipInstall: options.skipInstall || false,
      });

      console.log();
      if (targetDirectory === '.') {
        console.log(chalk.green('Success! Created'), chalk.cyan(projectDirName), chalk.green('in the current directory'));
      } else {
        console.log(chalk.green('Success! Created'), chalk.cyan(projectDirName), chalk.green('at'), chalk.cyan(resolvedProjectPath));
      }
      console.log();
      console.log('You can now run several commands:');
      console.log();
      console.log(chalk.cyan(`  ${packageManager} dev`));
      console.log('    Starts the development server with file watching.');
      console.log();
      console.log(chalk.cyan(`  ${packageManager} build`));
      console.log('    Compiles workflows for production.');
      console.log();
      console.log(chalk.cyan(`  ${packageManager} start`));
      console.log('    Starts the development server on port 3000.');
      console.log();
      if (targetDirectory === '.') {
        console.log('We suggest that you begin by typing:');
        console.log();
        if (!options.skipInstall) {
          console.log(chalk.cyan(`  ${packageManager} dev`));
        } else {
          console.log(chalk.cyan(`  ${packageManager} install`));
          console.log(chalk.cyan(`  ${packageManager} dev`));
        }
      } else {
        console.log('We suggest that you begin by typing:');
        console.log();
        console.log(chalk.cyan('  cd'), projectDirName);
        if (!options.skipInstall) {
          console.log(chalk.cyan(`  ${packageManager} dev`));
        } else {
          console.log(chalk.cyan(`  ${packageManager} install`));
          console.log(chalk.cyan(`  ${packageManager} dev`));
        }
      }
      console.log();
      console.log('Happy building! 🚀');

    } catch (error) {
      console.error(chalk.red('An error occurred while creating the project:'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
