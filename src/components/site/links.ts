// Real contact points only. Add Instagram / X / WhatsApp / Behance here
// when Lucas confirms the handles — an empty slot stays a quiet hex cell.
export const EMAIL = 'lucaspsckenal@gmail.com';

export type SocialId = 'github' | 'linkedin' | 'email';

export const SOCIALS: Array<{ id: SocialId; label: string; href: string }> = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/LucasSckenal' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucassckenal' },
  { id: 'email', label: 'E-mail', href: `mailto:${EMAIL}` },
];
