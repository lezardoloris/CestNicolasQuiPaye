'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SubmissionsList from '@/components/features/profile/SubmissionsList';
import VotesList from '@/components/features/profile/VotesList';
import NotesList from '@/components/features/profile/NotesList';
import SolutionsList from '@/components/features/profile/SolutionsList';
import CommentsList from '@/components/features/profile/CommentsList';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

const VALID_TABS = ['submissions', 'votes', 'notes', 'solutions', 'comments'] as const;

export default function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (VALID_TABS.includes(hash as (typeof VALID_TABS)[number])) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, '', `#${value}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList
        variant="line"
        className="w-full justify-start overflow-x-auto border-b border-border-default"
      >
        <TabsTrigger
          value="submissions"
          className="data-[state=active]:text-chainsaw-red"
        >
          {isOwnProfile ? 'Signalements' : 'Signalements'}
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger
            value="votes"
            className="data-[state=active]:text-chainsaw-red"
          >
            Votes
          </TabsTrigger>
        )}
        <TabsTrigger
          value="notes"
          className="data-[state=active]:text-chainsaw-red"
        >
          Notes
        </TabsTrigger>
        <TabsTrigger
          value="solutions"
          className="data-[state=active]:text-chainsaw-red"
        >
          Solutions
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="data-[state=active]:text-chainsaw-red"
        >
          Commentaires
        </TabsTrigger>
      </TabsList>

      <TabsContent value="submissions" className="mt-4">
        <SubmissionsList userId={userId} />
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="votes" className="mt-4">
          <VotesList userId={userId} />
        </TabsContent>
      )}

      <TabsContent value="notes" className="mt-4">
        <NotesList userId={userId} />
      </TabsContent>

      <TabsContent value="solutions" className="mt-4">
        <SolutionsList userId={userId} />
      </TabsContent>

      <TabsContent value="comments" className="mt-4">
        <CommentsList userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
