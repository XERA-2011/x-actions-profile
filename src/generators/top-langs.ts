
import fs from 'fs';
import path from 'path';
import { fetchLanguageStats, prepareLanguageData, renderVerticalLayout, THEME_CONFIG } from '../lib/top-langs';

export async function generateTopLangs(username: string, token: string, outputDir: string) {
  console.log('Generating Top Langs...');
  const stats = await fetchLanguageStats(username, token);
  const languages = prepareLanguageData(stats);

  for (const themeName of ['light', 'dark'] as const) {
    const theme = THEME_CONFIG[themeName];
    const svg = renderVerticalLayout(languages, theme, false);
    fs.writeFileSync(path.join(outputDir, `top-langs-${themeName}.svg`), svg);
  }
  console.log('Top Langs generated.');
}
