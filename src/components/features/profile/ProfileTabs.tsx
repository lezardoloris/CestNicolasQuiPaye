'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SubmissionsList from '@/components/features/profile/SubmissionsList';
import VotesList from '@/components/features/profile/VotesList';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="submissions" className="w-full">
      <TabsList variant="line" className="w-full justify-start border-b border-border-default">
        <TabsTrigger
          value="submissions"
          className="data-[state=active]:text-chainsaw-red"
        >
          {isOwnProfile ? 'Mes signalements' : 'Signalements'}
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger
            value="votes"
            className="data-[state=active]:text-chainsaw-red"
          >
            Mes votes
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="submissions" className="mt-4">
        <SubmissionsList userId={userId} />
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="votes" className="mt-4">
          <VotesList userId={userId} />
        </TabsContent>
      )}
    </Tabs>
  );
}
