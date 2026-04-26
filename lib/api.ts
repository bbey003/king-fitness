import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from './auth';

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function fail(
  status: number,
  message: string,
  code?: string
): NextResponse {
  return NextResponse.json(
    { error: message, code: code ?? 'ERR' },
    { status }
  );
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return fail(400, first?.message ?? 'Invalid input', 'VALIDATION');
  }
  if (err instanceof AuthError) {
    return fail(err.status, err.message, err.code);
  }
  if (err instanceof Error) {
    return fail(500, err.message);
  }
  return fail(500, 'Unknown error');
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error('Invalid JSON body');
  }
}
