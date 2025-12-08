
export type GitHubContributionDay = {
  x: number;
  y: number;
  date: string;
  count: number;
  level: number;
};

export type GitHubContributionResponseData = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            contributionCount: number;
            contributionLevel: string;
            date: string;
            weekday: number;
          }[];
        }[];
      };
    };
  };
};
