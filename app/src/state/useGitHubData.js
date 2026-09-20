/* ═══════ GitHub data hook ═══════
   Port of fetchGitHub() / fetchGitHubProjects() / fetchGitHubSkills() from the
   legacy script.js, including the "Projects Built" stat update and the exact
   success/error notifications. */
import { useCallback, useEffect, useState } from "react";
import { D, P } from "../lib/constants.js";
import {
  loadGitHubProfile,
  loadGitHubProjects,
  loadGitHubSkills,
} from "../lib/github.js";

export function useGitHubData({ notify }) {
  const [projects, setProjects] = useState(D.projects);
  const [skills, setSkills] = useState(D.skills);
  const [stats, setStats] = useState(P.stats);
  const [liveAvatar, setLiveAvatar] = useState(null);

  const setProjectsBuiltCount = useCallback((value) => {
    setStats((prev) =>
      prev.map((s) => (s.label === "Projects Built" ? { ...s, value } : s)),
    );
  }, []);

  /* ─── GitHub profile (live avatar + public repo count) ─── */
  const loadProfile = useCallback(async () => {
    try {
      const { avatarUrl, publicRepos } = await loadGitHubProfile();
      if (avatarUrl) setLiveAvatar(avatarUrl);
      if (publicRepos) setProjectsBuiltCount(publicRepos);
    } catch {
      /* offline — fall back to the emoji avatar */
    }
  }, [setProjectsBuiltCount]);

  /* ─── Repos → projects.json ─── */
  const refreshProjects = useCallback(async () => {
    try {
      const { projects: list, cached } = await loadGitHubProjects();
      setProjects(list);
      setProjectsBuiltCount(list.length);
      notify(
        cached ? "info" : "success",
        cached ? "Projects loaded from cache" : "Projects updated",
        cached
          ? `Showing ${list.length} cached projects from GitHub`
          : `Loaded ${list.length} projects from GitHub`,
        "projects.json",
      );
    } catch (error) {
      console.error("Error fetching GitHub projects:", error);
      notify(
        "error",
        "Failed to load projects",
        "Could not fetch projects from GitHub. Using cached data.",
        "projects.json",
      );
    }
  }, [notify, setProjectsBuiltCount]);

  /* ─── Repos → skills.json (top languages) ─── */
  const refreshSkills = useCallback(async () => {
    try {
      const topSkills = await loadGitHubSkills();
      setSkills((prev) => ({
        ...prev,
        languages: topSkills.map((s) => ({ name: s.name, level: s.level })),
      }));
      notify(
        "success",
        "Skills updated",
        `Loaded ${topSkills.length} skills from GitHub`,
        "skills.json",
      );
    } catch (error) {
      console.error("Error fetching GitHub skills:", error);
      notify(
        "error",
        "Failed to load skills",
        "Could not fetch skills from GitHub.",
        "skills.json",
      );
    }
  }, [notify]);

  /* Same call order as the legacy init(): profile → projects → skills */
  useEffect(() => {
    loadProfile();
    refreshProjects();
    refreshSkills();
  }, [loadProfile, refreshProjects, refreshSkills]);

  return {
    projects,
    skills,
    stats,
    liveAvatar,
    refreshProjects,
    refreshSkills,
    loadProfile,
  };
}
