import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type AskRequest = {
  question: string;
  symbol?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<AskRequest>;
  const question = (body.question || '').trim();
  const symbol = (body.symbol || '').toUpperCase();

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const answer = `This is a mock answer${symbol ? ` about ${symbol}` : ''}. Add OPENAI_API_KEY to enable live responses.`;
    return NextResponse.json({ question, answer, live: false });
  }

  try {
    const client = new OpenAI({ apiKey });
    const system = `You are a concise crypto assistant. Answer clearly in 2-4 sentences. If a ticker is provided, keep the answer focused on that asset.`;
    const user = symbol ? `${question}\n\nTicker: ${symbol}` : question;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || 'No answer generated.';
    return NextResponse.json({ question, answer, live: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      question,
      error: 'ask_failed',
      message,
    }, { status: 500 });
  }
}



