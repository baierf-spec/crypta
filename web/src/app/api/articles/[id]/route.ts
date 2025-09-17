import { NextResponse } from 'next/server';
import { getArticle } from '@/lib/db';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const article = await getArticle(id);
  if (!article) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ article });
}


