import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import { initializeSchema, insertArticle, insertSentiment } from '@/lib/db';

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP'];

export async function POST() {
  await initializeSchema();

  const symbols = DEFAULT_SYMBOLS;
  const results: any[] = [];

  for (const symbol of symbols) {
    // For MVP, reuse mock from /api/analyze (or integrate X API if available)
    const positive = Math.round(Math.random() * 100);
    const negative = Math.round(Math.random() * (100 - positive));
    const neutral = Math.max(0, 100 - positive - negative);
    const trend = Math.round(((positive - negative) / 100) * 10) / 10;

    await insertSentiment({
      id: uuid(),
      symbol,
      positive,
      negative,
      neutral,
      trend,
      createdAt: new Date().toISOString(),
    });

    // Generate brief article (use OpenAI if key present)
    const apiKey = process.env.OPENAI_API_KEY;
    let content = `Sentiment for ${symbol}: ${positive}% positive, ${negative}% negative, ${neutral}% neutral. Trend: ${trend}.`;
    let title = `${symbol} Daily Sentiment Snapshot`;
    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey });
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.5,
          messages: [
            {
              role: 'system',
              content: 'Write a concise 2-3 paragraph market note based on provided crypto sentiment stats.'
            },
            {
              role: 'user',
              content: `Symbol: ${symbol}. Positive ${positive}%, Negative ${negative}%, Neutral ${neutral}%. Trend index: ${trend}.`
            }
          ],
        });
        content = completion.choices?.[0]?.message?.content || content;
      } catch {}
    }

    const id = uuid();
    const slug = `${symbol.toLowerCase()}-${id.slice(0, 8)}`;
    await insertArticle({
      id,
      symbol,
      title,
      slug,
      content,
      createdAt: new Date().toISOString(),
    });

    results.push({ symbol, title, slug });
  }

  return NextResponse.json({ ok: true, results });
}


