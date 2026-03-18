import axios from 'axios';
import { winstonLogger } from '../utils/logger';

export const getUserStats = async (username: string) => {
  try {
    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

    const repos = reposRes.data;
    const stars = repos.reduce((acc: number, curr: any) => acc + curr.stargazers_count, 0);
    const forks = repos.reduce((acc: number, curr: any) => acc + curr.forks_count, 0);

    return {
      public_repos: userRes.data.public_repos,
      followers: userRes.data.followers,
      following: userRes.data.following,
      total_stars: stars,
      total_forks: forks
    };
  } catch (err) {
    winstonLogger.error(`Error fetching GitHub stats for ${username}`, err);
    throw err;
  }
};

export const getTopLanguages = async (username: string) => {
  try {
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);
    const languageCounts: Record<string, number> = {};

    reposRes.data.forEach((repo: any) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch (err) {
    winstonLogger.error(`Error fetching top languages for ${username}`, err);
    throw err;
  }
};
