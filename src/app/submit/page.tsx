import type { Metadata } from 'next';
import SubmissionForm from '@/components/features/submissions/SubmissionForm';

export const metadata: Metadata = {
  title: 'Signaler un gaspillage',
  description:
    'Soumettez un cas de gaspillage public avec un titre, une description, un cout estime et un lien source.',
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-display text-3xl font-bold text-text-primary">
        Signaler un gaspillage
      </h1>
      <p className="mb-8 text-text-secondary">
        Documentez un cas de gaspillage public avec des sources verifiables.
        Votre signalement sera examine par nos moderateurs avant publication.
      </p>
      <SubmissionForm />
    </div>
  );
}
