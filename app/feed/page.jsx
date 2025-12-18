import FeedCard from '@/components/shared/FeedCard/index';

export default function FeedPage() {
  // Load posts from localStorage (client-only rendering will hydrate)
  let postList = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('posts') || '[]');
      postList = stored.map(p => ({ id: p.id, title: p.title, content: p.content, community: p.community }));
    } catch (e) {
      postList = [];
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <FeedCard postList={postList} />
    </div>
  );
}