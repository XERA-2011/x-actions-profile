
import fs from 'fs';
import path from 'path';
import { fetchLanguageStats, prepareLanguageData, renderVerticalLayout, renderHorizontalLayout, renderDonutLayout, renderCloudLayout, THEME_CONFIG } from '../lib/top-langs';

export async function generateTopLangs(username: string, token: string, outputDir: string) {
  console.log('Generating Top Langs...');
  const stats = await fetchLanguageStats(username, token);
  const languages = prepareLanguageData(stats);

  const layouts = [
    { name: 'vertical', fn: renderVerticalLayout },
    { name: 'compact', fn: renderHorizontalLayout },
    { name: 'donut', fn: renderDonutLayout },
    { name: 'cloud', fn: renderCloudLayout },
  ];

  for (const themeName of ['light', 'dark'] as const) {
    const theme = THEME_CONFIG[themeName];
    
    for (const layout of layouts) {
      const svg = layout.fn(languages, theme, false);
      // Keep backward compatibility for vertical layout (default)
      if (layout.name === 'vertical') {
        fs.writeFileSync(path.join(outputDir, `top-langs-${themeName}.svg`), svg);
      }
      fs.writeFileSync(path.join(outputDir, `top-langs-${layout.name}-${themeName}.svg`), svg);
    }
  }
  console.log('Top Langs generated.');
}
