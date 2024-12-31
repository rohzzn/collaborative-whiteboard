// src/app/page.tsx
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
import useUser from '@/hooks/useUser';

export default function Home() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const { setName } = useUser();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    const newRoomId = uuidv4();
    setName(userName);
    router.push(`/rooms/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    setName(userName);
    const roomId = (e.target as any).roomId.value;
    if (roomId) {
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
      description: 'See who\'s currently active and their changes instantly.',
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">Create Room</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateRoom}>
                  <DialogHeader>
                    <DialogTitle>Create a Room</DialogTitle>
                    <DialogDescription>
                      Enter your name to create a new whiteboard session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-name">Your Name</Label>
                      <Input
                        id="create-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Create Room
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  Join Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleJoinRoom}>
                  <DialogHeader>
                    <DialogTitle>Join a Room</DialogTitle>
                    <DialogDescription>
                      Enter the room ID and your name to join an existing session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="roomId">Room ID</Label>
                      <Input
                        id="roomId"
                        name="roomId"
                        placeholder="Enter room ID"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="join-name">Your Name</Label>
                      <Input
                        id="join-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Join Room
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