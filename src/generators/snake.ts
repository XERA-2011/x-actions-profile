
import fs from 'fs';
import path from 'path';
import { fetchGitHubContributions } from '../lib/snake/contributions';
import { userContributionToGrid } from '../lib/snake/utils';
import { getBestRoute } from '../lib/snake/solver/getBestRoute';
import { getPathToPose } from '../lib/snake/solver/getPathToPose';
import { createSvg } from '../lib/snake/svg-creator/create-svg';
import { createSnakeFromCells } from '../lib/snake/types/snake';
import { Color } from '../lib/snake/types/grid';

const PALETTES = {
  light: {
    colorDots: { 1: "#9be9a8", 2: "#40c463", 3: "#30a14e", 4: "#216e39" } as Record<Color, string>,
    colorEmpty: "#ebedf0",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  },
  dark: {
    colorDots: { 1: "#01311f", 2: "#034525", 3: "#0f6d31", 4: "#00c647" } as Record<Color, string>,
    colorEmpty: "#161b22",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  }
};

export async function generateSnake(username: string, token: string, outputDir: string) {
  console.log('Generating Snake...');
  const contributions = await fetchGitHubContributions(username, token);
  const grid = userContributionToGrid(contributions);
  const snake = createSnakeFromCells([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]);
  const chain = getBestRoute(grid, snake)!;
  const returnPath = getPathToPose(chain.slice(-1)[0], snake);
  if (returnPath) chain.push(...returnPath);

  for (const theme of ['light', 'dark'] as const) {
    const options = theme === 'dark' ? PALETTES.dark : PALETTES.light;
    const svg = createSvg(grid, contributions, chain, options, { stepDurationMs: 100 });
    fs.writeFileSync(path.join(outputDir, `snake-${theme}.svg`), svg);
  }
  console.log('Snake generated.');
}
