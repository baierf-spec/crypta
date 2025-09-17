import { getArticle } from '@/lib/db';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) {
    return <div className="px-6 py-10">Article not found.</div>;
  }
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-semibold">{article.title}</h1>
      <div className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleString()} • {article.symbol}</div>
      <article className="prose max-w-none whitespace-pre-wrap">
        {article.content}
      </article>
    </div>
  );
}


