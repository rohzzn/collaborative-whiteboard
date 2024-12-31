
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useUser from '@/hooks/useUser'; // Import the user store

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { setName } = useUser(); // Destructure setName

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    router.push(`/rooms/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    
    if (roomId && userName) {
      setName(userName); // Set the userName in the store
      router.push(`/rooms/${roomId}`);
    }
  };

  const features = [
    {
      icon: Pencil,
      title: 'Collaborative Drawing',
      description: 'Draw and edit in real-time with your team members.',
    },
    {
      icon: Users,
      title: 'Multi-User Support',
      description: 'See whos currently active and their changes instantly.',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share your whiteboard with a simple link.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Collaborative Whiteboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A real-time collaborative space for your team
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleCreateRoom}>
              Create Room
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  Join Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Room</DialogTitle>
                  <DialogDescription>
                    Enter the room ID to join an existing whiteboard session.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoinRoom}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="roomId">Room ID</Label>
                      <Input
                        id="roomId"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isJoining}>
                      {isJoining ? 'Joining...' : 'Join Room'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}