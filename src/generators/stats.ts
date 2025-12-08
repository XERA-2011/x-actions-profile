
import fs from 'fs';
import path from 'path';
import { fetchGitHubStats, renderStatsCard } from '../lib/stats';

export async function generateStats(username: string, token: string, outputDir: string) {
  console.log('Generating Stats...');
  const stats = await fetchGitHubStats(username, token);

  for (const theme of ['light', 'dark'] as const) {
    const svg = renderStatsCard(username, stats, { theme });
    fs.writeFileSync(path.join(outputDir, `stats-${theme}.svg`), svg);
  }
  console.log('Stats generated.');
}
