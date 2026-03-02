import { describe, it, expect } from 'vitest';
import {
  submissionFormSchema,
  costCalculationRequestSchema,
  feedQuerySchema,
  voteSchema,
  criteriaVoteSchema,
  isValidSort,
  isValidUUID,
  shareEventSchema,
  pageViewSchema,
  createCommentSchema,
  commentQuerySchema,
  commentVoteSchema,
  moderationActionSchema,
  flagSubmissionSchema,
  broadcastSchema,
  featureProposalCreateSchema,
  featureVoteBallotSchema,
  featureVoteStatusUpdateSchema,
  addSourceSchema,
  validateSourceSchema,
  createCommunityNoteSchema,
  communityNoteVoteSchema,
  createSolutionSchema,
  createAdjustmentSchema,
} from './validation';

// ─── submissionFormSchema ───────────────────────────────────────────

describe('submissionFormSchema', () => {
  const validSubmission = {
    title: 'Depense test',
    description: 'Description de la depense publique',
    estimatedCostEur: 1000000,
    sourceUrl: 'https://example.com/article',
  };

  it('accepte une soumission valide', () => {
    const result = submissionFormSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('refuse un titre vide', () => {
    const result = submissionFormSchema.safeParse({ ...validSubmission, title: '' });
    expect(result.success).toBe(false);
  });

  it('refuse un titre de plus de 200 caracteres', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      title: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('refuse une description vide', () => {
    const result = submissionFormSchema.safeParse({ ...validSubmission, description: '' });
    expect(result.success).toBe(false);
  });

  it('refuse une description de plus de 2000 caracteres', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      description: 'A'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('refuse un montant de 0', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      estimatedCostEur: 0,
    });
    expect(result.success).toBe(false);
  });

  it('refuse un montant negatif', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      estimatedCostEur: -100,
    });
    expect(result.success).toBe(false);
  });

  it('refuse un montant trop eleve', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      estimatedCostEur: 1000000000000,
    });
    expect(result.success).toBe(false);
  });

  it('accepte le montant maximum', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      estimatedCostEur: 999999999999.99,
    });
    expect(result.success).toBe(true);
  });

  it('refuse une URL invalide', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      sourceUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('refuse une URL sans protocole http/https', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      sourceUrl: 'ftp://example.com',
    });
    expect(result.success).toBe(false);
  });

  it('accepte une URL http', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      sourceUrl: 'http://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepte le montant sous forme de chaine (coerce)', () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      estimatedCostEur: '5000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedCostEur).toBe(5000);
    }
  });
});

// ─── costCalculationRequestSchema ───────────────────────────────────

describe('costCalculationRequestSchema', () => {
  it('accepte un montant positif', () => {
    const result = costCalculationRequestSchema.safeParse({ amountEur: 1000 });
    expect(result.success).toBe(true);
  });

  it('refuse un montant de zero', () => {
    const result = costCalculationRequestSchema.safeParse({ amountEur: 0 });
    expect(result.success).toBe(false);
  });

  it('refuse un montant negatif', () => {
    const result = costCalculationRequestSchema.safeParse({ amountEur: -100 });
    expect(result.success).toBe(false);
  });

  it('accepte un montant sous forme de chaine (coerce)', () => {
    const result = costCalculationRequestSchema.safeParse({ amountEur: '500' });
    expect(result.success).toBe(true);
  });
});

// ─── feedQuerySchema ────────────────────────────────────────────────

describe('feedQuerySchema', () => {
  it('accepte des parametres valides', () => {
    const result = feedQuerySchema.safeParse({ sort: 'hot', limit: 10 });
    expect(result.success).toBe(true);
  });

  it('applique les valeurs par defaut', () => {
    const result = feedQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('hot');
      expect(result.data.limit).toBe(20);
      expect(result.data.timeWindow).toBe('week');
    }
  });

  it('refuse un tri invalide', () => {
    const result = feedQuerySchema.safeParse({ sort: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('refuse une limite inferieure a 1', () => {
    const result = feedQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it('refuse une limite superieure a 50', () => {
    const result = feedQuerySchema.safeParse({ limit: 51 });
    expect(result.success).toBe(false);
  });

  it('accepte les trois types de tri', () => {
    expect(feedQuerySchema.safeParse({ sort: 'hot' }).success).toBe(true);
    expect(feedQuerySchema.safeParse({ sort: 'new' }).success).toBe(true);
    expect(feedQuerySchema.safeParse({ sort: 'top' }).success).toBe(true);
  });

  it('accepte les fenetres de temps', () => {
    expect(feedQuerySchema.safeParse({ timeWindow: 'today' }).success).toBe(true);
    expect(feedQuerySchema.safeParse({ timeWindow: 'week' }).success).toBe(true);
    expect(feedQuerySchema.safeParse({ timeWindow: 'month' }).success).toBe(true);
    expect(feedQuerySchema.safeParse({ timeWindow: 'all' }).success).toBe(true);
  });
});

// ─── voteSchema ─────────────────────────────────────────────────────

describe('voteSchema', () => {
  it('accepte un vote up', () => {
    expect(voteSchema.safeParse({ voteType: 'up' }).success).toBe(true);
  });

  it('accepte un vote down', () => {
    expect(voteSchema.safeParse({ voteType: 'down' }).success).toBe(true);
  });

  it('refuse un type de vote invalide', () => {
    expect(voteSchema.safeParse({ voteType: 'left' }).success).toBe(false);
  });

  it('refuse un objet vide', () => {
    expect(voteSchema.safeParse({}).success).toBe(false);
  });
});

// ─── criteriaVoteSchema ─────────────────────────────────────────────

describe('criteriaVoteSchema', () => {
  it('accepte un vote proportional avec valeur booleenne', () => {
    const result = criteriaVoteSchema.safeParse({ criterion: 'proportional', value: true });
    expect(result.success).toBe(true);
  });

  it('accepte un vote legitimate', () => {
    const result = criteriaVoteSchema.safeParse({ criterion: 'legitimate', value: false });
    expect(result.success).toBe(true);
  });

  it('accepte un vote alternative', () => {
    const result = criteriaVoteSchema.safeParse({ criterion: 'alternative', value: true });
    expect(result.success).toBe(true);
  });

  it('refuse un critere invalide', () => {
    const result = criteriaVoteSchema.safeParse({ criterion: 'invalid', value: true });
    expect(result.success).toBe(false);
  });

  it('refuse une valeur non booleenne', () => {
    const result = criteriaVoteSchema.safeParse({ criterion: 'proportional', value: 'yes' });
    expect(result.success).toBe(false);
  });
});

// ─── isValidSort ────────────────────────────────────────────────────

describe('isValidSort', () => {
  it('accepte "hot"', () => {
    expect(isValidSort('hot')).toBe(true);
  });

  it('accepte "new"', () => {
    expect(isValidSort('new')).toBe(true);
  });

  it('accepte "top"', () => {
    expect(isValidSort('top')).toBe(true);
  });

  it('refuse un tri invalide', () => {
    expect(isValidSort('random')).toBe(false);
  });

  it('refuse une chaine vide', () => {
    expect(isValidSort('')).toBe(false);
  });

  it('est sensible a la casse', () => {
    expect(isValidSort('Hot')).toBe(false);
    expect(isValidSort('NEW')).toBe(false);
  });
});

// ─── isValidUUID ────────────────────────────────────────────────────

describe('isValidUUID', () => {
  it('accepte un UUID valide v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('accepte un UUID en majuscules', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('refuse une chaine vide', () => {
    expect(isValidUUID('')).toBe(false);
  });

  it('refuse un UUID tronque', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('refuse un UUID sans tirets', () => {
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('refuse une chaine aleatoire', () => {
    expect(isValidUUID('not-a-uuid-at-all')).toBe(false);
  });

  it('refuse un UUID avec des caracteres non-hex', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
  });
});

// ─── shareEventSchema ───────────────────────────────────────────────

describe('shareEventSchema', () => {
  it('accepte un evenement de partage valide', () => {
    const result = shareEventSchema.safeParse({
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'twitter',
    });
    expect(result.success).toBe(true);
  });

  it('accepte toutes les plateformes valides', () => {
    const platforms = ['twitter', 'facebook', 'whatsapp', 'copy_link', 'native'];
    for (const platform of platforms) {
      const result = shareEventSchema.safeParse({
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        platform,
      });
      expect(result.success).toBe(true);
    }
  });

  it('refuse une plateforme invalide', () => {
    const result = shareEventSchema.safeParse({
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'tiktok',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un ID de soumission invalide', () => {
    const result = shareEventSchema.safeParse({
      submissionId: 'not-a-uuid',
      platform: 'twitter',
    });
    expect(result.success).toBe(false);
  });
});

// ─── createCommentSchema ────────────────────────────────────────────

describe('createCommentSchema', () => {
  it('accepte un commentaire valide', () => {
    const result = createCommentSchema.safeParse({ body: 'Un commentaire pertinent' });
    expect(result.success).toBe(true);
  });

  it('trim le corps du commentaire', () => {
    const result = createCommentSchema.safeParse({ body: '  Bonjour  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe('Bonjour');
    }
  });

  it('refuse un commentaire vide', () => {
    const result = createCommentSchema.safeParse({ body: '' });
    expect(result.success).toBe(false);
  });

  it('refuse un commentaire de plus de 2000 caracteres', () => {
    const result = createCommentSchema.safeParse({ body: 'A'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepte un parentCommentId UUID valide', () => {
    const result = createCommentSchema.safeParse({
      body: 'Reponse',
      parentCommentId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepte parentCommentId null', () => {
    const result = createCommentSchema.safeParse({
      body: 'Premier commentaire',
      parentCommentId: null,
    });
    expect(result.success).toBe(true);
  });

  it('refuse un parentCommentId non-UUID', () => {
    const result = createCommentSchema.safeParse({
      body: 'Reponse',
      parentCommentId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

// ─── commentVoteSchema ──────────────────────────────────────────────

describe('commentVoteSchema', () => {
  it('accepte direction "up"', () => {
    expect(commentVoteSchema.safeParse({ direction: 'up' }).success).toBe(true);
  });

  it('accepte direction "down"', () => {
    expect(commentVoteSchema.safeParse({ direction: 'down' }).success).toBe(true);
  });

  it('refuse une direction invalide', () => {
    expect(commentVoteSchema.safeParse({ direction: 'left' }).success).toBe(false);
  });
});

// ─── moderationActionSchema ─────────────────────────────────────────

describe('moderationActionSchema', () => {
  it('accepte une approbation sans raison', () => {
    const result = moderationActionSchema.safeParse({ action: 'approve' });
    expect(result.success).toBe(true);
  });

  it('refuse un rejet sans raison', () => {
    const result = moderationActionSchema.safeParse({ action: 'reject' });
    expect(result.success).toBe(false);
  });

  it('accepte un rejet avec raison', () => {
    const result = moderationActionSchema.safeParse({
      action: 'reject',
      reason: 'Contenu inapproprie',
    });
    expect(result.success).toBe(true);
  });

  it('refuse request_edit sans raison', () => {
    const result = moderationActionSchema.safeParse({ action: 'request_edit' });
    expect(result.success).toBe(false);
  });

  it('accepte request_edit avec raison', () => {
    const result = moderationActionSchema.safeParse({
      action: 'request_edit',
      reason: 'Merci de corriger le montant',
    });
    expect(result.success).toBe(true);
  });

  it('refuse remove sans raison', () => {
    const result = moderationActionSchema.safeParse({ action: 'remove' });
    expect(result.success).toBe(false);
  });

  it('refuse un rejet avec raison vide (espaces seulement)', () => {
    const result = moderationActionSchema.safeParse({
      action: 'reject',
      reason: '   ',
    });
    expect(result.success).toBe(false);
  });
});

// ─── flagSubmissionSchema ───────────────────────────────────────────

describe('flagSubmissionSchema', () => {
  it('accepte une raison de signalement valide', () => {
    expect(flagSubmissionSchema.safeParse({ reason: 'spam' }).success).toBe(true);
    expect(flagSubmissionSchema.safeParse({ reason: 'inaccurate' }).success).toBe(true);
    expect(flagSubmissionSchema.safeParse({ reason: 'inappropriate' }).success).toBe(true);
  });

  it('refuse une raison invalide', () => {
    expect(flagSubmissionSchema.safeParse({ reason: 'other' }).success).toBe(false);
  });

  it('accepte des details optionnels', () => {
    const result = flagSubmissionSchema.safeParse({
      reason: 'spam',
      details: 'Publication repetee',
    });
    expect(result.success).toBe(true);
  });
});

// ─── broadcastSchema ────────────────────────────────────────────────

describe('broadcastSchema', () => {
  it('accepte un broadcast valide', () => {
    const result = broadcastSchema.safeParse({
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      tweetText: 'Decouvrez cette depense publique',
    });
    expect(result.success).toBe(true);
  });

  it('refuse un tweet de plus de 280 caracteres', () => {
    const result = broadcastSchema.safeParse({
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      tweetText: 'A'.repeat(281),
    });
    expect(result.success).toBe(false);
  });

  it('refuse un tweet vide', () => {
    const result = broadcastSchema.safeParse({
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      tweetText: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── featureProposalCreateSchema ────────────────────────────────────

describe('featureProposalCreateSchema', () => {
  it('accepte une proposition valide', () => {
    const result = featureProposalCreateSchema.safeParse({
      title: 'Mode sombre',
      description: 'Ajouter un theme sombre pour le confort visuel',
      category: 'ux',
    });
    expect(result.success).toBe(true);
  });

  it('refuse un titre trop court', () => {
    const result = featureProposalCreateSchema.safeParse({
      title: 'AB',
      description: 'Description suffisamment longue',
      category: 'general',
    });
    expect(result.success).toBe(false);
  });

  it('refuse une description trop courte', () => {
    const result = featureProposalCreateSchema.safeParse({
      title: 'Titre valide',
      description: 'Court',
      category: 'general',
    });
    expect(result.success).toBe(false);
  });

  it('refuse une categorie invalide', () => {
    const result = featureProposalCreateSchema.safeParse({
      title: 'Titre valide',
      description: 'Description suffisamment longue',
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepte toutes les categories valides', () => {
    const categories = ['general', 'data', 'ux', 'social', 'tech'];
    for (const category of categories) {
      const result = featureProposalCreateSchema.safeParse({
        title: 'Titre valide',
        description: 'Description suffisamment longue',
        category,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ─── featureVoteBallotSchema ────────────────────────────────────────

describe('featureVoteBallotSchema', () => {
  it('accepte la valeur 1', () => {
    expect(featureVoteBallotSchema.safeParse({ value: 1 }).success).toBe(true);
  });

  it('accepte la valeur -1', () => {
    expect(featureVoteBallotSchema.safeParse({ value: -1 }).success).toBe(true);
  });

  it('refuse la valeur 0', () => {
    expect(featureVoteBallotSchema.safeParse({ value: 0 }).success).toBe(false);
  });

  it('refuse la valeur 2', () => {
    expect(featureVoteBallotSchema.safeParse({ value: 2 }).success).toBe(false);
  });

  it('refuse une valeur decimale', () => {
    expect(featureVoteBallotSchema.safeParse({ value: 0.5 }).success).toBe(false);
  });
});

// ─── featureVoteStatusUpdateSchema ──────────────────────────────────

describe('featureVoteStatusUpdateSchema', () => {
  it('accepte un statut valide sans raison', () => {
    expect(featureVoteStatusUpdateSchema.safeParse({ status: 'planned' }).success).toBe(true);
  });

  it('refuse "declined" sans raison', () => {
    expect(featureVoteStatusUpdateSchema.safeParse({ status: 'declined' }).success).toBe(false);
  });

  it('accepte "declined" avec une raison suffisante', () => {
    const result = featureVoteStatusUpdateSchema.safeParse({
      status: 'declined',
      rejectionReason: 'Pas dans la roadmap actuellement',
    });
    expect(result.success).toBe(true);
  });

  it('refuse "declined" avec une raison trop courte', () => {
    const result = featureVoteStatusUpdateSchema.safeParse({
      status: 'declined',
      rejectionReason: 'Non',
    });
    expect(result.success).toBe(false);
  });

  it('accepte tous les statuts valides (sauf declined sans raison)', () => {
    const statuses = ['proposed', 'planned', 'in_progress', 'shipped'];
    for (const status of statuses) {
      const result = featureVoteStatusUpdateSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });
});

// ─── addSourceSchema ────────────────────────────────────────────────

describe('addSourceSchema', () => {
  it('accepte une source valide', () => {
    const result = addSourceSchema.safeParse({
      url: 'https://example.com/rapport.pdf',
      title: 'Rapport annuel 2025',
      sourceType: 'official_report',
    });
    expect(result.success).toBe(true);
  });

  it('refuse une URL invalide', () => {
    const result = addSourceSchema.safeParse({
      url: 'not-an-url',
      title: 'Titre valide',
      sourceType: 'press_article',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un type de source invalide', () => {
    const result = addSourceSchema.safeParse({
      url: 'https://example.com',
      title: 'Titre valide',
      sourceType: 'blog',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un titre trop court', () => {
    const result = addSourceSchema.safeParse({
      url: 'https://example.com',
      title: 'AB',
      sourceType: 'press_article',
    });
    expect(result.success).toBe(false);
  });
});

// ─── createCommunityNoteSchema ──────────────────────────────────────

describe('createCommunityNoteSchema', () => {
  it('accepte une note communautaire valide', () => {
    const result = createCommunityNoteSchema.safeParse({
      body: 'Ce montant semble incorrect selon le rapport officiel',
    });
    expect(result.success).toBe(true);
  });

  it('trim le corps de la note', () => {
    const result = createCommunityNoteSchema.safeParse({
      body: '  Note avec espaces    ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe('Note avec espaces');
    }
  });

  it('refuse une note trop courte', () => {
    const result = createCommunityNoteSchema.safeParse({ body: 'Court' });
    expect(result.success).toBe(false);
  });

  it('refuse une note de plus de 500 caracteres', () => {
    const result = createCommunityNoteSchema.safeParse({ body: 'A'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepte une URL source optionnelle', () => {
    const result = createCommunityNoteSchema.safeParse({
      body: 'Note avec source externe officielle',
      sourceUrl: 'https://legifrance.gouv.fr',
    });
    expect(result.success).toBe(true);
  });

  it('accepte une chaine vide pour sourceUrl', () => {
    const result = createCommunityNoteSchema.safeParse({
      body: 'Note sans source explicite',
      sourceUrl: '',
    });
    expect(result.success).toBe(true);
  });
});

// ─── createSolutionSchema ───────────────────────────────────────────

describe('createSolutionSchema', () => {
  it('accepte une solution valide', () => {
    const result = createSolutionSchema.safeParse({
      body: 'On pourrait mutualiser les achats entre ministeres',
    });
    expect(result.success).toBe(true);
  });

  it('refuse une solution trop courte', () => {
    const result = createSolutionSchema.safeParse({ body: 'Nope' });
    expect(result.success).toBe(false);
  });

  it('refuse une solution de plus de 2000 caracteres', () => {
    const result = createSolutionSchema.safeParse({ body: 'A'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('trim le corps de la solution', () => {
    const result = createSolutionSchema.safeParse({
      body: '   Solution avec espaces autour   ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe('Solution avec espaces autour');
    }
  });
});

// ─── createAdjustmentSchema ─────────────────────────────────────────

describe('createAdjustmentSchema', () => {
  it('accepte un ajustement valide', () => {
    const result = createAdjustmentSchema.safeParse({
      body: 'Le montant devrait etre revu',
    });
    expect(result.success).toBe(true);
  });

  it('refuse un ajustement trop court', () => {
    const result = createAdjustmentSchema.safeParse({ body: 'Non' });
    expect(result.success).toBe(false);
  });

  it('refuse un ajustement de plus de 500 caracteres', () => {
    const result = createAdjustmentSchema.safeParse({ body: 'A'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ─── pageViewSchema ─────────────────────────────────────────────────

describe('pageViewSchema', () => {
  it('accepte une page view minimale', () => {
    const result = pageViewSchema.safeParse({ pagePath: '/feed/hot' });
    expect(result.success).toBe(true);
  });

  it('accepte une page view avec parametres UTM', () => {
    const result = pageViewSchema.safeParse({
      pagePath: '/s/depense-test',
      utmSource: 'twitter',
      utmMedium: 'social',
      utmCampaign: 'share',
    });
    expect(result.success).toBe(true);
  });

  it('refuse un pagePath vide', () => {
    const result = pageViewSchema.safeParse({ pagePath: '' });
    expect(result.success).toBe(false);
  });

  it('refuse un pagePath trop long', () => {
    const result = pageViewSchema.safeParse({ pagePath: 'A'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ─── communityNoteVoteSchema ────────────────────────────────────────

describe('communityNoteVoteSchema', () => {
  it('accepte isUseful true', () => {
    expect(communityNoteVoteSchema.safeParse({ isUseful: true }).success).toBe(true);
  });

  it('accepte isUseful false', () => {
    expect(communityNoteVoteSchema.safeParse({ isUseful: false }).success).toBe(true);
  });

  it('refuse une valeur non booleenne', () => {
    expect(communityNoteVoteSchema.safeParse({ isUseful: 'yes' }).success).toBe(false);
  });
});

// ─── validateSourceSchema ───────────────────────────────────────────

describe('validateSourceSchema', () => {
  it('accepte isValid true', () => {
    expect(validateSourceSchema.safeParse({ isValid: true }).success).toBe(true);
  });

  it('accepte isValid false', () => {
    expect(validateSourceSchema.safeParse({ isValid: false }).success).toBe(true);
  });

  it('refuse une valeur non booleenne', () => {
    expect(validateSourceSchema.safeParse({ isValid: 1 }).success).toBe(false);
  });
});

// ─── commentQuerySchema ─────────────────────────────────────────────

describe('commentQuerySchema', () => {
  it('applique les valeurs par defaut', () => {
    const result = commentQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('best');
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepte le tri par "newest"', () => {
    const result = commentQuerySchema.safeParse({ sort: 'newest' });
    expect(result.success).toBe(true);
  });

  it('refuse un tri invalide', () => {
    const result = commentQuerySchema.safeParse({ sort: 'random' });
    expect(result.success).toBe(false);
  });
});
