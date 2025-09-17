import { getLatestSentiments } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP'];

export default async function DashboardPage() {
  const rows = await getLatestSentiments(SYMBOLS, 1);
  const bySymbol = new Map(rows.map(r => [r.symbol, r]));
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sentiment Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYMBOLS.map(sym => {
          const r = bySymbol.get(sym);
          return (
            <div key={sym} className="border rounded-lg p-4">
              <div className="text-lg font-medium">{sym}</div>
              {r ? (
                <div className="text-sm mt-2 space-y-1">
                  <div>Positive: {r.positive}%</div>
                  <div>Negative: {r.negative}%</div>
                  <div>Neutral: {r.neutral}%</div>
                  <div>Trend: {r.trend}</div>
                </div>
              ) : (
                <div className="text-sm mt-2 text-gray-500">No data yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


