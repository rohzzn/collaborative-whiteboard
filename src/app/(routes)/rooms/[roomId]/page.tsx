// src/app/(routes)/rooms/[roomId]/page.tsx

import React from 'react';
import dynamic from 'next/dynamic';
import { use } from 'react';

// Dynamically import RoomClient with no SSR
const RoomClient = dynamic(() => import('@/components/rooms/RoomClient'), {
  ssr: false
});

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function Page({ params }: PageProps) {
  // Unwrap the Promise using React.use
  const resolvedParams = use(params);
  return <RoomClient roomId={resolvedParams.roomId} />;
}