
import { GitHubContributionDay, GitHubContributionResponseData } from './types-contrib';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

type GraphQLError = {
  message: string;
  type?: string;
  path?: string[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export async function fetchGitHubContributions(username: string, token: string): Promise<GitHubContributionDay[]> {
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { login: username }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API failed: ${response.status} - ${errorText}`);
  }

  const result: GraphQLResponse<GitHubContributionResponseData> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const error = result.errors[0];
    if (error.type === 'NOT_FOUND') {
      throw new Error(`User '${username}' not found`);
    }
    throw new Error(error.message || 'Error fetching GitHub contributions');
  }

  const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

  return weeks.flatMap((week, x) =>
    week.contributionDays.map(day => ({
      x,
      y: day.weekday,
      date: day.date,
      count: day.contributionCount,
      level:
        (day.contributionLevel === "FOURTH_QUARTILE" && 4) ||
        (day.contributionLevel === "THIRD_QUARTILE" && 3) ||
        (day.contributionLevel === "SECOND_QUARTILE" && 2) ||
        (day.contributionLevel === "FIRST_QUARTILE" && 1) ||
        0,
    }))
  );
}
