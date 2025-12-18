import FeedCard from '@/components/shared/FeedCard/index';

export default function Home() {
  // Dummy post DATA (not React components)
  const postList = [
    { id: 1, title: "Post A", content: "Hello" },
    { id: 2, title: "Post B", content: "World" },
    { id: 3, title: "Post C", content: "!!" },
  ];

  return (
    <div>
      <FeedCard postList={postList} />
    </div>
  );
}