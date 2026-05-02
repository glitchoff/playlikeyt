import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - PlayLikeYT',
  description: 'Learn more about PlayLikeYT, a high-performance local video management system with a native YouTube-like experience.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
