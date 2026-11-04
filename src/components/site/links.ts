// Real contact points only. Add X / Behance here when Lucas confirms the
// handles — an empty slot stays a quiet hex cell.
// "Work": on the home page it opens the first project; anywhere else it
// goes home, where the carousel is
// (opens the flat projects index; the arguments stay for the callers)
export function showWork(_router?: unknown, _pathname?: string | null) {
  window.dispatchEvent(new CustomEvent('projects:open'));
}

export const EMAIL = 'lucaspsckenal@gmail.com';

// +55 55 98414-5158, digits only for wa.me
export const WHATSAPP = '5555984145158';
// Opens a chat with the first line already written (the visitor can edit it)
export const whatsappHref = (text?: string) =>
  `https://wa.me/${WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export type SocialId = 'whatsapp' | 'instagram' | 'github' | 'linkedin' | 'email';

export const SOCIALS: Array<{ id: SocialId; label: string; href: string }> = [
  { id: 'whatsapp', label: 'WhatsApp', href: whatsappHref() },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/lucas.sckenal' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/LucasSckenal' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucassckenal' },
  { id: 'email', label: 'E-mail', href: `mailto:${EMAIL}` },
];
