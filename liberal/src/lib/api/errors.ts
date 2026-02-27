export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static validation(message: string, details?: Record<string, unknown>) {
    return new ApiError('VALIDATION_ERROR', message, 400, details);
  }

  static unauthorized(message = 'Non authentifie') {
    return new ApiError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Acces refuse') {
    return new ApiError('FORBIDDEN', message, 403);
  }

  static notFound(message = 'Ressource introuvable') {
    return new ApiError('NOT_FOUND', message, 404);
  }

  static conflict(message = 'Conflit de ressource') {
    return new ApiError('CONFLICT', message, 409);
  }

  static rateLimited(retryAfter: number) {
    return new ApiError(
      'RATE_LIMITED',
      `Trop de requetes. Reessayez dans ${Math.ceil(retryAfter / 60)} minutes.`,
      429,
      { retryAfter },
    );
  }

  static internal(message = 'Erreur interne du serveur') {
    return new ApiError('INTERNAL_ERROR', message, 500);
  }
}
