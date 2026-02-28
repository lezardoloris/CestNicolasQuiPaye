'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  onSubmit: (body: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Ecrire un commentaire...',
  autoFocus = false,
  onCancel,
  className,
}: CommentFormProps) {
  const [body, setBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = body.trim().length;
  const isValid = charCount >= 1 && charCount <= 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    onSubmit(body.trim());
    setBody('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isValid && !isSubmitting) {
        onSubmit(body.trim());
        setBody('');
      }
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-3', className)}
      aria-label="Formulaire de commentaire"
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          maxLength={2000}
          aria-label="Texte du commentaire"
          aria-describedby="comment-char-count"
          className="resize-none"
          disabled={isSubmitting}
        />
        <span
          id="comment-char-count"
          className={cn(
            'absolute bottom-2 right-2 text-xs',
            charCount > 1800 ? 'text-warning' : 'text-text-muted',
            charCount > 2000 && 'text-destructive',
          )}
          aria-live="polite"
        >
          {charCount}/2000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Ctrl+Entree pour publier
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="min-h-10"
              aria-label="Annuler"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!isValid || isSubmitting}
            className="min-h-10 gap-2"
            aria-label="Publier le commentaire"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Publier
          </Button>
        </div>
      </div>
    </form>
  );
}
