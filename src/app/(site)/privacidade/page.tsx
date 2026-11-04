import type { Metadata } from 'next';
import Privacy from '@/components/site/Privacy';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'O que este site guarda e com quem fala: quase nada.',
};

export default function PrivacyPage() {
  return <Privacy />;
}
