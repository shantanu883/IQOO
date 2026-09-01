import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

/**
 * Real GitHub data. Per the product requirement we NEVER fabricate GitHub
 * statistics — this always hits the public GitHub REST API. Unauthenticated
 * requests are subject to GitHub's rate limits; the caller can cache the
 * result on the User document (github.syncedAt) to stay within them.
 */
const gh = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github+json" },
  timeout: 12000,
});

export async function fetchGithubProfile(username) {
  if (!username) throw ApiError.badRequest("GitHub username required");

  let profile;
  try {
    const res = await gh.get(`/users/${encodeURIComponent(username)}`);
    profile = res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw ApiError.notFound(`GitHub user "${username}" not found`);
    }
    if (err.response?.status === 403) {
      throw ApiError.serviceUnavailable(
        "GitHub API rate limit reached. Try again shortly."
      );
    }
    throw err;
  }

  // Top repos by stars (first page is enough for a portfolio view).
  const reposRes = await gh.get(
    `/users/${encodeURIComponent(username)}/repos`,
    { params: { sort: "pushed", per_page: 100 } }
  );

  const repos = reposRes.data
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  // Popular languages by repo count.
  const langCounts = {};
  for (const r of repos) {
    if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
  }
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang);

  return {
    username: profile.login,
    name: profile.name,
    avatar: profile.avatar_url,
    bio: profile.bio,
    company: profile.company,
    location: profile.location,
    blog: profile.blog,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    stars: totalStars,
    topLanguages,
    topRepos: repos.slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
    })),
    syncedAt: new Date(),
  };
}
