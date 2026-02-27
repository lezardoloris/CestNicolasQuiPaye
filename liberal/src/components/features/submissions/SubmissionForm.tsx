'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  submissionFormSchema,
  type SubmissionFormData,
} from '@/lib/utils/validation';
import { isTweetUrl } from '@/lib/utils/tweet-detector';
import { Loader2 } from 'lucide-react';

export default function SubmissionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<SubmissionFormData>({
    title: '',
    description: '',
    estimatedCostEur: 0,
    sourceUrl: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SubmissionFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [tweetDetected, setTweetDetected] = useState(false);

  function handleChange(
    field: keyof SubmissionFormData,
    value: string | number
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    // Detect tweet URL
    if (field === 'sourceUrl' && typeof value === 'string') {
      setTweetDetected(isTweetUrl(value));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const result = submissionFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SubmissionFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SubmissionFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });

        const body = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            setServerError(
              'Trop de soumissions. Reessayez dans quelques minutes.'
            );
            return;
          }
          if (body.error?.fieldErrors) {
            setErrors(body.error.fieldErrors);
            return;
          }
          setServerError(
            body.error?.message || 'Une erreur est survenue. Veuillez reessayer.'
          );
          return;
        }

        router.push(`/submit/confirmation/${body.data.id}`);
      } catch {
        setServerError('Une erreur est survenue. Veuillez reessayer.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block font-display font-medium text-text-primary"
        >
          Titre <span className="text-chainsaw-red">*</span>
        </label>
        <Input
          id="title"
          type="text"
          maxLength={200}
          placeholder="Ex: Renovation du bureau ministeriel a 500 000 EUR"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        <div className="mt-1 flex items-center justify-between text-sm">
          {errors.title ? (
            <p id="title-error" role="alert" className="text-destructive">
              {errors.title}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-text-muted ${formData.title.length >= 180 ? 'text-chainsaw-red' : ''}`}
          >
            {formData.title.length}/200
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-display font-medium text-text-primary"
        >
          Description <span className="text-chainsaw-red">*</span>
        </label>
        <Textarea
          id="description"
          maxLength={2000}
          placeholder="Decrivez le gaspillage en detail..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={5}
          aria-required="true"
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
        />
        <div className="mt-1 flex items-center justify-between text-sm">
          {errors.description ? (
            <p
              id="description-error"
              role="alert"
              className="text-destructive"
            >
              {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-text-muted ${formData.description.length >= 1980 ? 'text-chainsaw-red' : ''}`}
          >
            {formData.description.length}/2000
          </span>
        </div>
      </div>

      {/* Estimated Cost */}
      <div>
        <label
          htmlFor="estimatedCostEur"
          className="mb-2 block font-display font-medium text-text-primary"
        >
          Cout estime (EUR) <span className="text-chainsaw-red">*</span>
        </label>
        <div className="relative">
          <Input
            id="estimatedCostEur"
            type="number"
            min={1}
            step="0.01"
            placeholder="Ex: 500000"
            value={formData.estimatedCostEur || ''}
            onChange={(e) =>
              handleChange('estimatedCostEur', e.target.value)
            }
            className="pr-14"
            aria-required="true"
            aria-invalid={!!errors.estimatedCostEur}
            aria-describedby={
              errors.estimatedCostEur ? 'cost-error' : undefined
            }
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            EUR
          </span>
        </div>
        {errors.estimatedCostEur && (
          <p id="cost-error" role="alert" className="mt-1 text-sm text-destructive">
            {errors.estimatedCostEur}
          </p>
        )}
      </div>

      {/* Source URL */}
      <div>
        <label
          htmlFor="sourceUrl"
          className="mb-2 block font-display font-medium text-text-primary"
        >
          Lien source <span className="text-chainsaw-red">*</span>
        </label>
        <Input
          id="sourceUrl"
          type="url"
          placeholder="https://www.lemonde.fr/..."
          value={formData.sourceUrl}
          onChange={(e) => handleChange('sourceUrl', e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.sourceUrl}
          aria-describedby={errors.sourceUrl ? 'source-error' : undefined}
        />
        {errors.sourceUrl && (
          <p
            id="source-error"
            role="alert"
            className="mt-1 text-sm text-destructive"
          >
            {errors.sourceUrl}
          </p>
        )}
        {tweetDetected && (
          <p className="mt-1 text-sm text-info">
            Tweet detecte - un apercu sera affiche avec votre soumission.
          </p>
        )}
      </div>

      {/* Server Error */}
      {serverError && (
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-4 md:static">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Soumission en cours...
            </>
          ) : (
            'Signaler ce gaspillage'
          )}
        </Button>
      </div>
    </form>
  );
}
