import { createClient } from '@vercel/sqlite';

export type SentimentRow = {
  id: string;
  symbol: string;
  positive: number;
  negative: number;
  neutral: number;
  trend: number;
  createdAt: string;
};

export type ArticleRow = {
  id: string;
  symbol: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
};

const db = createClient();

export async function initializeSchema(): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sentiments (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      positive INTEGER NOT NULL,
      negative INTEGER NOT NULL,
      neutral INTEGER NOT NULL,
      trend REAL NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

export async function insertSentiment(row: SentimentRow): Promise<void> {
  await db.execute(
    `INSERT INTO sentiments (id, symbol, positive, negative, neutral, trend, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.symbol, row.positive, row.negative, row.neutral, row.trend, row.createdAt]
  );
}

export async function getLatestSentiments(symbols: string[], limitPerSymbol = 1): Promise<SentimentRow[]> {
  if (symbols.length === 0) return [];
  const placeholders = symbols.map(() => '?').join(',');
  const { rows } = await db.execute(
    `SELECT * FROM sentiments WHERE symbol IN (${placeholders})
     ORDER BY createdAt DESC`,
    symbols
  );
  const grouped = new Map<string, SentimentRow[]>();
  for (const r of rows as any[]) {
    const list = grouped.get(r.symbol) || [];
    if (list.length < limitPerSymbol) {
      list.push(r as SentimentRow);
      grouped.set(r.symbol, list);
    }
  }
  return Array.from(grouped.values()).flat();
}

export async function insertArticle(row: ArticleRow): Promise<void> {
  await db.execute(
    `INSERT INTO articles (id, symbol, title, slug, content, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.symbol, row.title, row.slug, row.content, row.createdAt]
  );
}

export async function listArticles(symbol?: string): Promise<ArticleRow[]> {
  const { rows } = await db.execute(
    symbol ? `SELECT * FROM articles WHERE symbol = ? ORDER BY createdAt DESC` : `SELECT * FROM articles ORDER BY createdAt DESC`,
    symbol ? [symbol] : undefined
  );
  return rows as unknown as ArticleRow[];
}

export async function getArticle(idOrSlug: string): Promise<ArticleRow | null> {
  const { rows } = await db.execute(
    `SELECT * FROM articles WHERE id = ? OR slug = ? LIMIT 1`,
    [idOrSlug, idOrSlug]
  );
  return (rows?.[0] as unknown as ArticleRow) || null;
}


