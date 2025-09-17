import Link from 'next/link';
import { listArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const articles = await listArticles();
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Articles</h1>
      <div className="space-y-4">
        {articles.map(a => (
          <div key={a.id} className="border rounded-lg p-4">
            <div className="font-medium">{a.title}</div>
            <div className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
            <Link className="text-blue-600" href={`/blog/${a.slug}`}>Read →</Link>
          </div>
        ))}
        {articles.length === 0 && (
          <div className="text-gray-500">No articles yet. Trigger /api/cron/daily to generate.</div>
        )}
      </div>
    </div>
  );
}


