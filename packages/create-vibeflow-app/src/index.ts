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
  .option('--use-npm', 'use npm instead of pnpm')
  .option('--use-yarn', 'use yarn instead of pnpm')
  .option('--skip-install', 'skip installing dependencies')
  .action(async (projectDirectory, options) => {
    console.log();

    let projectName = projectDirectory;

    // Prompt for project name if not provided
    if (!projectName) {
      const response = await prompts({
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

      if (!response.projectName) {
        console.log('\nOperation cancelled.');
        process.exit(1);
      }

      projectName = response.projectName;
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

    const resolvedProjectPath = path.resolve(projectName);
    const projectDirName = path.basename(resolvedProjectPath);

    // Check if directory already exists
    if (fs.existsSync(resolvedProjectPath)) {
      console.error(
        chalk.red(`Directory "${projectName}" already exists. Please choose a different name.`)
      );
      process.exit(1);
    }

    console.log(`Creating a new Vibeflow app in ${chalk.green(resolvedProjectPath)}`);
    console.log();

    // Determine package manager
    let packageManager: 'npm' | 'yarn' | 'pnpm' = 'pnpm';
    if (options.useNpm) {
      packageManager = 'npm';
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
      console.log(chalk.green('Success! Created'), chalk.cyan(projectDirName), chalk.green('at'), chalk.cyan(resolvedProjectPath));
      console.log();
      console.log('Inside that directory, you can run several commands:');
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
      console.log('We suggest that you begin by typing:');
      console.log();
      console.log(chalk.cyan('  cd'), projectDirName);
      if (!options.skipInstall) {
        console.log(chalk.cyan(`  ${packageManager} dev`));
      } else {
        console.log(chalk.cyan(`  ${packageManager} install`));
        console.log(chalk.cyan(`  ${packageManager} dev`));
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
