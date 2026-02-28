import { NextResponse } from 'next/server';

type ApiMeta = {
  cursor?: string;
  hasMore?: boolean;
  totalCount?: number;
  requestId?: string;
};

type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function apiSuccess<T>(data: T, meta: ApiMeta = {}, status = 200) {
  return NextResponse.json(
    {
      data,
      error: null,
      meta: { ...meta, requestId: crypto.randomUUID() },
    },
    { status },
  );
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        message,
        details: details ?? {},
      } satisfies ApiErrorBody,
      meta: { requestId: crypto.randomUUID() },
    },
    { status },
  );
}
