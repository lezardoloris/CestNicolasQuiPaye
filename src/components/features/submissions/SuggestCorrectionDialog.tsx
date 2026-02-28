'use client';

import { useState } from 'react';
import { MessageSquarePlus, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SuggestCorrectionDialogProps {
    submission: {
        id: string;
        title: string;
        amount: string;
        sourceUrl: string;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type SuggestionType = 'amount' | 'title' | 'source' | 'other';

const SUGGESTION_TYPES: { value: SuggestionType; label: string; placeholder: string }[] = [
    {
        value: 'amount',
        label: '💶 Montant incorrect',
        placeholder: 'Ex: Le montant réel est 12 500 000 € selon le rapport de la Cour des comptes (p. 47)',
    },
    {
        value: 'title',
        label: '✏️ Titre inexact',
        placeholder: 'Ex: Le titre devrait être "Subvention à France Médias Monde 2024" car...',
    },
    {
        value: 'source',
        label: '🔗 Mauvaise source',
        placeholder: 'Ex: La source correcte est https://... (le lien actuel ne renvoie pas au bon document)',
    },
    {
        value: 'other',
        label: '📝 Autre correction',
        placeholder: 'Décrivez votre suggestion de correction avec vos sources...',
    },
];

export function SuggestCorrectionDialog({
    submission,
    open,
    onOpenChange,
}: SuggestCorrectionDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [type, setType] = useState<SuggestionType>('amount');
    const [suggestedValue, setSuggestedValue] = useState('');
    const [explanation, setExplanation] = useState('');
    const [sourceLink, setSourceLink] = useState('');

    const selectedType = SUGGESTION_TYPES.find((t) => t.value === type)!;

    const handleSubmit = async () => {
        if (!explanation.trim() || explanation.length < 20) {
            toast.error('Veuillez détailler votre suggestion (min. 20 caractères).');
            return;
        }

        setIsPending(true);

        try {
            // We post as a special "correction" comment on the submission
            const body: Record<string, string> = {
                body: [
                    `🔧 **Suggestion de correction — ${selectedType.label}**`,
                    suggestedValue ? `Valeur proposée : ${suggestedValue}` : '',
                    '',
                    explanation,
                    sourceLink ? `\nSource complémentaire : ${sourceLink}` : '',
                ]
                    .filter((l) => l !== undefined)
                    .join('\n'),
            };

            const res = await fetch(`/api/submissions/${submission.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error?.message ?? 'Erreur serveur');
            }

            toast.success(
                'Votre suggestion a été transmise. Merci pour votre contribution citoyenne !',
                { duration: 4000 }
            );
            onOpenChange(false);
            // Reset
            setSuggestedValue('');
            setExplanation('');
            setSourceLink('');
            setType('amount');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border-default bg-surface-secondary sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-text-primary">
                        Suggérer une correction
                    </DialogTitle>
                    <DialogDescription className="text-text-muted">
                        Cette plateforme est éducative et sourcée. Si vous trouvez une inexactitude,
                        signalez-la — votre suggestion sera visible dans les commentaires.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-5">
                    {/* Type selector */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-text-primary">
                            Type de correction
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {SUGGESTION_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setType(t.value)}
                                    className={cn(
                                        'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all',
                                        type === t.value
                                            ? 'border-chainsaw-red bg-chainsaw-red/10 text-chainsaw-red'
                                            : 'border-border-default bg-surface-elevated text-text-muted hover:border-border-default/70 hover:text-text-secondary'
                                    )}
                                    aria-pressed={type === t.value}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Suggested value (for amount or title types) */}
                    {(type === 'amount' || type === 'title') && (
                        <div>
                            <label htmlFor="suggest-value" className="mb-1.5 block text-sm font-medium text-text-primary">
                                {type === 'amount' ? 'Montant correct (€)' : 'Titre correct suggéré'}
                            </label>
                            <Input
                                id="suggest-value"
                                type={type === 'amount' ? 'number' : 'text'}
                                placeholder={type === 'amount' ? 'Ex: 12500000' : 'Ex: Rénovation des bureaux de...'}
                                value={suggestedValue}
                                onChange={(e) => setSuggestedValue(e.target.value)}
                                className="bg-surface-elevated"
                            />
                        </div>
                    )}

                    {/* Explanation */}
                    <div>
                        <label htmlFor="suggest-explanation" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Explication & justification <span className="text-chainsaw-red">*</span>
                        </label>
                        <Textarea
                            id="suggest-explanation"
                            placeholder={selectedType.placeholder}
                            rows={4}
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="bg-surface-elevated"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                            Soyez précis et citez vos sources pour que la correction soit crédible.
                            {explanation.length < 20 && explanation.length > 0 && (
                                <span className="ml-1 text-warning">Minimum 20 caractères.</span>
                            )}
                        </p>
                    </div>

                    {/* Extra source */}
                    <div>
                        <label htmlFor="suggest-source" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Lien source complémentaire <span className="text-text-muted">(optionnel)</span>
                        </label>
                        <Input
                            id="suggest-source"
                            type="url"
                            placeholder="https://www.ccomptes.fr/..."
                            value={sourceLink}
                            onChange={(e) => setSourceLink(e.target.value)}
                            className="bg-surface-elevated"
                        />
                    </div>

                    {/* Educational note */}
                    <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-text-secondary">
                        <p className="font-medium text-info">
                            🎓 Démarche éducative
                        </p>
                        <p className="mt-1">
                            Toutes les dépenses sur cette plateforme doivent être sourcées (rapport officiel,
                            article de presse, document parlementaire…). Votre suggestion sera publiée comme
                            commentaire et pourra être reprise par un modérateur pour corriger la fiche.
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || explanation.length < 20}
                        className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
                    >
                        {isPending ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" />Envoi…</>
                        ) : (
                            <><Send className="mr-2 size-4" />Envoyer la suggestion</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
