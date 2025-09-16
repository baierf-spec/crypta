import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type AnalyzeRequest = {
  symbol: string;
  limit?: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<AnalyzeRequest>;
  const symbol = (body.symbol || '').toUpperCase();
  const limit = typeof body.limit === 'number' ? Math.max(1, Math.min(200, body.limit)) : 50;

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  const xToken = process.env.X_API_BEARER_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Helper: mock fallback
  const respondMock = () => {
    const positive = Math.round(Math.random() * 100);
    const negative = Math.round(Math.random() * (100 - positive));
    const neutral = Math.max(0, 100 - positive - negative);
    const trend = Math.round((Math.random() - 0.5) * 20) / 10;
    const samplePosts = Array.from({ length: Math.min(5, limit) }).map((_, i) => ({
      id: `${symbol}-${i + 1}`,
      text: `Sample ${symbol} post ${i + 1}`,
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
    }));
    return NextResponse.json({ symbol, limit, scores: { positive, negative, neutral }, trend, samplePosts, live: false });
  };

  if (!xToken || !openaiKey) {
    return respondMock();
  }

  try {
    // 1) Fetch recent X posts for the symbol (simple query by cash/tag)
    const query = encodeURIComponent(`(${symbol}) (crypto OR cryptocurrency OR price) -is:retweet lang:en`);
    const url = `https://api.x.com/2/tweets/search/recent?max_results=${Math.min(limit, 100)}&query=${query}&tweet.fields=created_at,lang`;
    const xResp = await fetch(url, { headers: { Authorization: `Bearer ${xToken}` } });
    if (!xResp.ok) {
      return respondMock();
    }
    const xData = (await xResp.json()) as { data?: Array<{ id: string; text: string }> };
    const posts = (xData.data || []).map(p => ({ id: p.id, text: p.text }));

    if (posts.length === 0) {
      return respondMock();
    }

    // 2) Use OpenAI to classify sentiments
    const client = new OpenAI({ apiKey: openaiKey });
    const prompt = `Classify each tweet as positive, negative, or neutral regarding ${symbol}. Return JSON [{id, sentiment}] with sentiment in {positive|negative|neutral} only. Tweets:\n` +
      posts.map(p => `- (${p.id}) ${p.text.replace(/\s+/g, ' ').slice(0, 500)}`).join('\n');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: 'You return strictly valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '[]';
    let judgments: Array<{ id: string; sentiment: 'positive' | 'negative' | 'neutral' }> = [];
    try {
      judgments = JSON.parse(content);
    } catch {
      // If parsing fails, fallback mock
      return respondMock();
    }

    // 3) Aggregate
    let positive = 0, negative = 0, neutral = 0;
    const sentimentById = new Map(judgments.map(j => [j.id, j.sentiment] as const));
    const samplePosts = posts.slice(0, 5).map(p => ({ id: p.id, text: p.text, sentiment: sentimentById.get(p.id) || 'neutral' }));
    for (const [, s] of sentimentById) {
      if (s === 'positive') positive++; else if (s === 'negative') negative++; else neutral++;
    }
    const total = Math.max(1, positive + negative + neutral);
    const toPct = (n: number) => Math.round((n / total) * 100);
    const scores = { positive: toPct(positive), negative: toPct(negative), neutral: toPct(neutral) };
    const trend = Math.round(((scores.positive - scores.negative) / 100) * 10) / 10; // simple index -1..+1

    return NextResponse.json({ symbol, limit, scores, trend, samplePosts, live: true });
  } catch (error: unknown) {
    return respondMock();
  }
}



