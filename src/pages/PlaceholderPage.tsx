import { Link } from 'react-router-dom';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-gray-3">
      <p className="text-[16px]">{title}（占位）</p>
      <Link to="/community" className="text-primary-1 hover:underline">
        前往社区
      </Link>
    </div>
  );
}
