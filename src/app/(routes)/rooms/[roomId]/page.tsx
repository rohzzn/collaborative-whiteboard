// src/app/(routes)/rooms/[roomId]/page.tsx

import React from 'react';
import RoomClient from '@/components/rooms/RoomClient';

interface Params {
  roomId: string;
}

interface PageProps {
  params: Promise<Params>; // Define params as a Promise
}

export default async function Page({ params }: PageProps) {
  const { roomId } = await params; // Await the Promise to get roomId
  return <RoomClient roomId={roomId} />;
}
