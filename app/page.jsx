import FeedCard from '../components/shared/FeedCard/index';

export default function Home() {
  const postList = [];

  return (
    <div className="py-6 px-4">
      <div className="max-w-[740px] mx-auto">
        <FeedCard postList={postList} />
      </div>
    </div>
  );
}