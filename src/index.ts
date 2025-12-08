
import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { generateSnake } from './generators/snake';
import { generateStats } from './generators/stats';
import { generateTopLangs } from './generators/top-langs';

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const username = core.getInput('user', { required: true });
    const outputDir = core.getInput('output_dir') || 'dist';
    const types = core.getInput('types') || 'snake,stats,top-langs';

    const typesArray = types.split(',').map(t => t.trim().toLowerCase());

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const tasks: Promise<void>[] = [];

    if (typesArray.includes('snake')) {
      tasks.push(generateSnake(username, token, outputDir));
    }
    if (typesArray.includes('stats')) {
      tasks.push(generateStats(username, token, outputDir));
    }
    if (typesArray.includes('top-langs')) {
      tasks.push(generateTopLangs(username, token, outputDir));
    }

    await Promise.all(tasks);
    console.log('All charts generated successfully.');

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

run();
