import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Videos - PlayLikeYT',
  description: 'Upload and organize your local video collection into playlists and folders.',
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
