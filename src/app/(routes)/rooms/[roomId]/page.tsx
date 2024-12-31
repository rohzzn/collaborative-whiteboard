// src/app/(routes)/rooms/[roomId]/page.tsx
import RoomWrapper from '@/components/RoomWrapper';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <RoomWrapper roomId={resolvedParams.roomId} />;
}