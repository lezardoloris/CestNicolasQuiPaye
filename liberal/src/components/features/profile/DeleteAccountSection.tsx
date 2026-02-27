'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DeleteAccountDialog from '@/components/features/profile/DeleteAccountDialog';

export default function DeleteAccountSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-chainsaw-red">
        Zone de danger
      </h2>
      <p className="text-sm text-text-secondary">
        La suppression de votre compte est definitive. Vos signalements publies
        seront conserves mais anonymises.
      </p>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="border-chainsaw-red text-chainsaw-red hover:bg-chainsaw-red hover:text-white"
      >
        Supprimer mon compte
      </Button>

      <DeleteAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
