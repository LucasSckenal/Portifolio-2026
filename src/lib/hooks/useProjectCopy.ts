'use client';

import { useLocale } from '@/components/providers/LanguageProvider';
import { getProjectCopy, type ProjectCopy } from '@/content/projects.i18n';

// Translated status / tagline / summary / team for one project in the
// active locale. Falls back to English when a locale has no entry.
export function useProjectCopy(slug: string): ProjectCopy {
  const { locale } = useLocale();
  return getProjectCopy(slug, locale) ?? getProjectCopy(slug, 'en')!;
}
