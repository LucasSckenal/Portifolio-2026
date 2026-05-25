'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { projects, nightProjects, type ProjectCase } from '@/content/projects';

// Returns the active portfolio based on the user's theme.
//   Day   → showcase / professional work (Game, Nexo, LJ)
//   Night → academic university work     (Chatbot, Phantom)
//
// Components that render project lists (Projects.tsx on home) use this so
// the visible work swaps when the eclipse toggle flips themes.
export function useProjects(): ProjectCase[] {
  const { inverted } = useTheme();
  return inverted ? nightProjects : projects;
}
