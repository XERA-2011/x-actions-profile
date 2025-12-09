
export interface LanguageItem {
  name: string;
  bytes: number;
  percentage: string;
  color: string;
}

export type Theme = {
  bg: string;
  border: string;
  title: string;
  text: string;
  progressBg: string;
};

const LANGS_COUNT = 6;

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
  PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Shell: '#89e051', 'Objective-C': '#438eff',
  Scala: '#c22d40',
};

export const THEME_CONFIG = {
  dark: { bg: '#0d1117', border: '#30363d', title: '#c9d1d9', text: '#c9d1d9', progressBg: '#21262d' },
  light: { bg: '#ffffff', border: '#e1e4e8', title: '#24292e', text: '#586069', progressBg: '#eaecef' },
};

type LanguageStats = Record<string, number>;

export async function fetchLanguageStats(username: string, token: string): Promise<LanguageStats> {
  const headers: HeadersInit = {
    'Authorization': `bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const query = `
    query userInfo($login: String!) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes {
            name
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges { size, node { color, name } }
            }
          }
        }
      }
    }
  `;
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers, body: JSON.stringify({ query, variables: { login: username } })
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  const result = await response.json();
  if (result.errors) {
    const error = result.errors[0];
    if (error.type === 'NOT_FOUND') throw new Error(`User '${username}' not found`);
    throw new Error(error.message || 'Error fetching from GitHub GraphQL API');
  }
  const languageStats: LanguageStats = {};
  const repos = result.data?.user?.repositories?.nodes;
  if (!repos) return {};
  for (const repo of repos) {
    if (!repo.languages?.edges) continue;
    for (const edge of repo.languages.edges) {
      const lang = edge.node.name;
      if (!LANGUAGE_COLORS[lang]) {
        LANGUAGE_COLORS[lang] = edge.node.color || '#858585';
      }
      languageStats[lang] = (languageStats[lang] || 0) + edge.size;
    }
  }
  return languageStats;
}

export function prepareLanguageData(stats: LanguageStats): LanguageItem[] {
  const total = Object.values(stats).reduce((s, b) => s + b, 0);
  if (total === 0) return [];
  return Object.entries(stats).sort(([, a], [, b]) => b - a).slice(0, LANGS_COUNT)
    .map(([lang, bytes]) => ({
      name: lang, bytes, percentage: ((bytes / total) * 100).toFixed(1),
      color: LANGUAGE_COLORS[lang] || '#858585',
    }));
}

export function renderVerticalLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 235, padding = 16, contentWidth = 268;
  const items = languages.map((lang, i) => {
    const y = 55 + i * 30;
    const progress = (parseFloat(lang.percentage) / 100) * contentWidth;
    return `
      <text x="${padding}" y="${y}" class="lang-name">${lang.name}</text>
      <text x="${cardWidth - padding}" y="${y}" class="lang-name" text-anchor="end">${lang.percentage}%</text>
      <rect x="${padding}" y="${y + 7}" width="${contentWidth}" height="8" rx="4" fill="${theme.progressBg}"/>
      <rect x="${padding}" y="${y + 7}" width="${progress}" height="8" rx="4" fill="${lang.color}"/>`;
  }).join('');
  return `
    <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
      <style>.title{font-size:14px;font-weight:600;fill:${theme.title}} .lang-name{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;fill:${theme.text}}</style>
      <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
      <text x="16" y="28" class="title">Most Used Languages</text>
      <g>${items}</g>
    </svg>`;
}

export function renderHorizontalLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 140, padding = 16, contentWidth = 268;
  const totalColoredWidth = languages.reduce((sum, lang) => sum + (parseFloat(lang.percentage) / 100) * contentWidth, 0);
  let currentX = padding;
  const progressBars = languages.map(lang => {
    const width = (parseFloat(lang.percentage) / 100) * contentWidth;
    const bar = `<rect x="${currentX}" y="45" height="10" width="${width}" fill="${lang.color}"/>`;
    currentX += width;
    return bar;
  }).join('');
  const legendItems = languages.map((lang, i) => {
    const x = (i % 2 === 0) ? 16 : 160;
    const y = 75 + Math.floor(i / 2) * 20;
    return `<g transform="translate(${x}, ${y})"><circle r="5" fill="${lang.color}"/><text x="10" class="legend-text">${lang.name} <tspan class="legend-percent">${lang.percentage}%</tspan></text></g>`;
  }).join('');
  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>.title{font-size:14px;font-weight:600;fill:${theme.title}} .legend-text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;dominant-baseline:middle;fill:${theme.text}}</style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <text x="16" y="28" class="title">Most Used Languages</text>
          <rect x="16" y="45" height="10" width="268" rx="5" fill="${theme.progressBg}"/>
          <defs><clipPath id="colored-bar-clip"><rect x="16" y="45" height="10" width="${totalColoredWidth}" rx="5"/></clipPath></defs>
          <g clip-path="url(#colored-bar-clip)">${progressBars}</g>
          <g>${legendItems}</g>
      </svg>`;
}

export function renderDonutLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 140, radius = 45, circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;
  const segments = languages.map(lang => {
    const percentage = parseFloat(lang.percentage);
    const dash = (percentage / 100) * circumference;
    const offset = (accumulatedPercentage / 100) * circumference;
    accumulatedPercentage += percentage;

    return `<circle class="donut-segment" r="${radius}" stroke="${lang.color}" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="-${offset}"/>`;
  }).join('');

  const legendYStart = (cardHeight - (languages.length * 18)) / 2 + 5;
  const legend = languages.map((lang, i) =>
    `<g transform="translate(0, ${i * 18})"><circle cx="5" cy="0" r="5" fill="${lang.color}"/><text x="15">${lang.name} ${lang.percentage}%</text></g>`
  ).join('');

  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>
            .donut-segment { fill: transparent; stroke-width: 20; }
            text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; dominant-baseline: middle; fill: ${theme.text}; }
          </style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <g transform="translate(70, 70) rotate(-90)">
            ${segments}
          </g>
          <g transform="translate(150, ${legendYStart})">
            ${legend}
          </g>
      </svg>`;
}

export function renderCloudLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300;
  const cardHeight = 140;
  const padding = 15;
  const lineSpacing = 45;
  const horizontalGap = 15;

  const fontConfigs = [
    { size: 24, weight: 700 }, { size: 20, weight: 600 },
    { size: 18, weight: 500 }, { size: 17, weight: 500 },
    { size: 16, weight: 500 }, { size: 15, weight: 500 },
  ];

  const lines: { lang: LanguageItem; config: typeof fontConfigs[0] }[][] = [[]];
  const lineWidths: number[] = [0];
  let currentLineIndex = 0;

  languages.forEach((lang, i) => {
    const config = fontConfigs[i];
    const estimatedWidth = lang.name.length * (config.size * 0.65) + horizontalGap;

    if (lineWidths[currentLineIndex] + estimatedWidth > cardWidth - padding * 2 && lines[currentLineIndex].length > 0) {
      currentLineIndex++;
      lines[currentLineIndex] = [];
      lineWidths[currentLineIndex] = 0;
    }

    lines[currentLineIndex].push({ lang, config });
    lineWidths[currentLineIndex] += estimatedWidth;
  });

  lineWidths.forEach((width, index) => {
    lineWidths[index] = width - horizontalGap;
  });

  const totalContentHeight = (lines.length - 1) * lineSpacing + fontConfigs[0].size;
  const startY = (cardHeight - totalContentHeight) / 2;

  let itemsSvg = '';
  lines.forEach((line, lineIndex) => {
    const lineY = startY + lineIndex * lineSpacing;
    let currentX = (cardWidth - lineWidths[lineIndex]) / 2;

    line.forEach(item => {
      const { lang, config } = item;
      const estimatedWidth = lang.name.length * (config.size * 0.65);

      itemsSvg += `
              <a href="#" class="tag">
                <text x="${currentX}" y="${lineY}" font-size="${config.size}" font-weight="${config.weight}" fill="${lang.color}">${lang.name}</text>
              </a>
            `;
      currentX += estimatedWidth + horizontalGap;
    });
  });

  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>
            .tag { transition: opacity 0.2s ease; cursor: pointer; }
            .tag:hover { opacity: 0.7; }
            text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; dominant-baseline: hanging; }
          </style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <g text-anchor="start">
            ${itemsSvg}
          </g>
      </svg>`;
}

export function renderErrorCard(message: string, theme: Theme): string {
  return `
    <svg width="450" height="120" viewBox="0 0 450 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${theme.bg}" rx="12" stroke="${theme.border}"/>
      <text x="50%" y="50%" font-family="-apple-system,sans-serif" font-size="16" fill="#ef4444" text-anchor="middle" dominant-baseline="middle">${message}</text>
    </svg>`;
}
