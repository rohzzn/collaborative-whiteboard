// src/components/RoomWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const RoomClient = dynamic(() => import('./rooms/RoomClient'), {
  ssr: false
});

export default function RoomWrapper({ roomId }: { roomId: string }) {
  return <RoomClient roomId={roomId} />;
}