import { NextResponse } from 'next/server';
import { listArticles } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || undefined;
  const articles = await listArticles(symbol);
  return NextResponse.json({ articles });
}


