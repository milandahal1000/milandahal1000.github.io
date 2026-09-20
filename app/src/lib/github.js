/* ═══════ GitHub API layer ═══════
   Pure data functions ported from the legacy script.js:
   • loadGitHubProfile()  → avatar url + public repo count
   • loadGitHubProjects() → repos transformed into the projects.json shape
   • loadGitHubSkills()   → top languages with a computed proficiency level
   Same endpoints, same query string, same filters, same transforms. */

const USER = "milandahal1000";
const REPOS_URL = `https://api.github.com/users/${USER}/repos?sort=updated&direction=desc&per_page=100`;
const HEADERS = { "User-Agent": "Milan-Portfolio/1.0" };

/* ─── Profile ─── */
export async function loadGitHubProfile() {
  const response = await fetch(`https://api.github.com/users/${USER}`, {
    headers: HEADERS,
  });
  if (!response.ok)
    throw new Error(`Failed to fetch profile: ${response.status}`);
  const user = await response.json();
  return {
    avatarUrl: user.avatar_url || "",
    publicRepos: user.public_repos || 0,
  };
}

/* ─── Projects (cached for 5 minutes, like the legacy version) ─── */
let projectsCache = null;
let projectsCacheTimestamp = 0;
export const GITHUB_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function loadGitHubProjects() {
  const now = Date.now();
  if (projectsCache && now - projectsCacheTimestamp < GITHUB_CACHE_DURATION) {
    return { projects: projectsCache, cached: true };
  }
  const response = await fetch(REPOS_URL, { headers: HEADERS });
  if (!response.ok) throw new Error(`Failed to fetch repos: ${response.status}`);
  const repos = await response.json();
  const projects = transformRepos(repos);
  projectsCache = projects;
  projectsCacheTimestamp = Date.now();
  return { projects, cached: false };
}

const EMOJI_MAP = {
  JavaScript: "💻",
  TypeScript: "💻",
  Python: "🐍",
  Java: "☕",
  HTML: "🎨",
  CSS: "🎨",
  Go: "🐹",
  Rust: "🦀",
  PHP: "🐘",
  Ruby: "💎",
  "C++": "⚙️",
  C: "⚙️",
  Shell: "💻",
  Vue: "💚",
  Svelte: "💙",
  Dart: "🎯",
  Kotlin: "🟣",
  Swift: "🟧",
  Default: "📁",
};

const FRONTEND_LANGS = [
  "javascript",
  "typescript",
  "html",
  "css",
  "vue",
  "svelte",
];
const BACKEND_LANGS = [
  "python",
  "java",
  "go",
  "rust",
  "php",
  "ruby",
  "c",
  "cpp",
  "c#",
  "dotnet",
];

export function transformRepos(repos) {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .map((repo) => {
      const language = repo.language || "Default";
      const emoji = EMOJI_MAP[language] || EMOJI_MAP.Default;

      /* Category: topics first, then language fallback */
      const topics = repo.topics || [];
      const topicString = topics.join(" ").toLowerCase();
      let category = "Other";
      if (
        topicString.includes("frontend") ||
        topicString.includes("ui") ||
        topicString.includes("ux")
      ) {
        category = "Frontend";
      } else if (
        topicString.includes("backend") ||
        topicString.includes("api") ||
        topicString.includes("server")
      ) {
        category = "Backend";
      } else if (
        topicString.includes("fullstack") ||
        topicString.includes("full-stack")
      ) {
        category = "Full-stack";
      } else if (
        topicString.includes("mobile") ||
        topicString.includes("android") ||
        topicString.includes("ios")
      ) {
        category = "Mobile";
      } else if (
        topicString.includes("data") ||
        topicString.includes("analytics") ||
        topicString.includes("machine learning") ||
        topicString.includes("ai")
      ) {
        category = "Data Science";
      } else if (FRONTEND_LANGS.includes((repo.language || "").toLowerCase())) {
        category = "Frontend";
      } else if (BACKEND_LANGS.includes((repo.language || "").toLowerCase())) {
        category = "Backend";
      } else {
        category = "Full-stack"; // Default fallback
      }

      const blurb =
        repo.description ||
        `A ${language} project${repo.fork ? " (fork)" : ""} hosted on GitHub`;
      const description =
        repo.description ||
        `GitHub repository: ${repo.name}${repo.description ? ` - ${repo.description}` : ""}`;

      const features = [];
      if (repo.language) features.push(`Built with ${repo.language}`);
      if (repo.stargazers_count > 0)
        features.push(`${repo.stargazers_count} ⭐ Stars`);
      if (repo.forks_count > 0) features.push(`${repo.forks_count} 🍴 Forks`);
      if (!repo.private) features.push("Publicly available");
      if (features.length === 0) features.push("Source code available");

      const tags = [...topics, repo.language].filter(Boolean);

      return {
        title: repo.name,
        emoji,
        category,
        blurb: blurb.substring(0, 150) + (blurb.length > 150 ? "..." : ""),
        description,
        features: features.slice(0, 4),
        tags,
        links: {
          github: repo.html_url,
          live: repo.homepage || "",
        },
      };
    });
}

/* ─── Skills (top 10 languages by weighted proficiency) ─── */
export async function loadGitHubSkills() {
  const response = await fetch(REPOS_URL, { headers: HEADERS });
  if (!response.ok) throw new Error(`Failed to fetch repos: ${response.status}`);
  const repos = await response.json();
  return transformSkills(repos);
}

export function transformSkills(repos) {
  const filteredRepos = repos.filter((repo) => !repo.fork && !repo.archived);
  const totalRepos = filteredRepos.length;

  const languageStats = {};
  filteredRepos.forEach((repo) => {
    const language = repo.language;
    if (!language) return;
    if (!languageStats[language]) {
      languageStats[language] = { count: 0, stars: 0, forks: 0 };
    }
    languageStats[language].count++;
    languageStats[language].stars += repo.stargazers_count || 0;
    languageStats[language].forks += repo.forks_count || 0;
  });

  const skills = Object.entries(languageStats).map(([language, stats]) => {
    const repoScore = Math.min((stats.count / totalRepos) * 100, 100);
    const starScore = Math.min((stats.stars / 100) * 10, 100); // cap at 100 stars
    const forkScore = Math.min((stats.forks / 50) * 10, 100); // cap at 50 forks

    // Weighted average: 50% repo count, 30% stars, 20% forks
    const proficiency = Math.round(
      repoScore * 0.5 + starScore * 0.3 + forkScore * 0.2,
    );

    return {
      name: language,
      level: Math.max(proficiency, stats.count > 0 ? 10 : 0),
    };
  });

  skills.sort((a, b) => b.level - a.level);
  return skills.slice(0, 10); // top 10
}
