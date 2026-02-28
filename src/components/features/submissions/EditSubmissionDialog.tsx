'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2, Check } from 'lucide-react';
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
import { CATEGORIES } from '@/lib/constants/categories';

interface EditSubmissionDialogProps {
    submission: {
        id: string;
        title: string;
        description: string;
        sourceUrl: string;
        amount: string;
        ministryTag: string | null;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSubmissionDialog({
    submission,
    open,
    onOpenChange,
}: EditSubmissionDialogProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const [fields, setFields] = useState({
        title: submission.title,
        description: submission.description,
        sourceUrl: submission.sourceUrl,
        estimatedCostEur: parseFloat(submission.amount),
        ministryTag: submission.ministryTag ?? '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string | number) => {
        setFields((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const handleSubmit = async () => {
        setIsPending(true);
        setErrors({});

        try {
            const res = await fetch(`/api/submissions/${submission.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: fields.title,
                    description: fields.description,
                    sourceUrl: fields.sourceUrl,
                    estimatedCostEur: fields.estimatedCostEur,
                    ministryTag: fields.ministryTag || null,
                }),
            });

            const body = await res.json();

            if (!res.ok) {
                if (body.error?.fieldErrors) {
                    setErrors(body.error.fieldErrors);
                } else {
                    toast.error(body.error?.message ?? 'Une erreur est survenue.');
                }
                return;
            }

            toast.success('Signalement mis à jour avec succès.');
            onOpenChange(false);
            router.refresh();
        } catch {
            toast.error('Impossible de contacter le serveur.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border-default bg-surface-secondary sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-text-primary">
                        Modifier le signalement
                    </DialogTitle>
                    <DialogDescription className="text-text-muted">
                        Corrigez les informations. Toute modification est tracée.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-5">
                    {/* Title */}
                    <div>
                        <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Titre <span className="text-chainsaw-red">*</span>
                        </label>
                        <Input
                            id="edit-title"
                            maxLength={200}
                            value={fields.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="bg-surface-elevated"
                        />
                        <div className="mt-0.5 flex justify-between text-xs">
                            {errors.title ? <p className="text-destructive">{errors.title}</p> : <span />}
                            <span className={`tabular-nums ${fields.title.length >= 180 ? 'text-chainsaw-red' : 'text-text-muted'}`}>
                                {fields.title.length}/200
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Description <span className="text-chainsaw-red">*</span>
                        </label>
                        <Textarea
                            id="edit-description"
                            rows={5}
                            maxLength={2000}
                            value={fields.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="bg-surface-elevated"
                        />
                        <div className="mt-0.5 flex justify-between text-xs">
                            {errors.description ? <p className="text-destructive">{errors.description}</p> : <span />}
                            <span className={`tabular-nums ${fields.description.length >= 1980 ? 'text-chainsaw-red' : 'text-text-muted'}`}>
                                {fields.description.length}/2000
                            </span>
                        </div>
                    </div>

                    {/* Source URL */}
                    <div>
                        <label htmlFor="edit-source" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Lien source <span className="text-chainsaw-red">*</span>
                        </label>
                        <Input
                            id="edit-source"
                            type="url"
                            value={fields.sourceUrl}
                            onChange={(e) => handleChange('sourceUrl', e.target.value)}
                            className="bg-surface-elevated"
                        />
                        {errors.sourceUrl && <p className="mt-0.5 text-xs text-destructive">{errors.sourceUrl}</p>}
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="edit-amount" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Coût estimé (EUR) <span className="text-chainsaw-red">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="edit-amount"
                                type="number"
                                min={1}
                                step="0.01"
                                value={fields.estimatedCostEur || ''}
                                onChange={(e) => handleChange('estimatedCostEur', parseFloat(e.target.value) || 0)}
                                className="bg-surface-elevated pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">EUR</span>
                        </div>
                        {errors.estimatedCostEur && <p className="mt-0.5 text-xs text-destructive">{errors.estimatedCostEur}</p>}
                    </div>

                    {/* Ministry Tag */}
                    <div>
                        <label htmlFor="edit-ministry" className="mb-1.5 block text-sm font-medium text-text-primary">
                            Catégorie
                        </label>
                        <select
                            id="edit-ministry"
                            value={fields.ministryTag}
                            onChange={(e) => handleChange('ministryTag', e.target.value)}
                            className="w-full rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red"
                        >
                            <option value="">— Aucune —</option>
                            {CATEGORIES.map((c) => (
                                <option key={c.slug} value={c.slug}>{c.label}</option>
                            ))}
                        </select>
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
                        disabled={isPending}
                        className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
                    >
                        {isPending ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" />Enregistrement…</>
                        ) : (
                            <><Check className="mr-2 size-4" />Enregistrer</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
