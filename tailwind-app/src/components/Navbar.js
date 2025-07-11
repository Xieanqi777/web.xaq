import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="horizontal-nav bg-[var(--morandiPurple)] shadow-md py-3 px-6 mb-6 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white hover:text-[var(--morandiBeige)] transition-colors flex items-center">
          <span className="inline-block w-8 h-8 bg-white rounded-md mr-2 flex items-center justify-center">
            <span className="text-[var(--morandiPurple)] text-sm font-bold">W</span>
          </span>
          Web前端技术课程练习
        </Link>
        <div className="flex space-x-2">
          <Link href="/" className="horizontal-btn bg-[var(--morandiLightPurple)] text-white hover:bg-[var(--morandiDarkPurple)]">
            首页
          </Link>
          <Link href="/exercises" className="horizontal-btn bg-[var(--morandiLightPurple)] text-white hover:bg-[var(--morandiDarkPurple)]">
            练习
          </Link>
          <Link href="/github-stats" className="horizontal-btn bg-[var(--morandiLightPurple)] text-white hover:bg-[var(--morandiDarkPurple)]">
            GitHub 统计
          </Link>
          <Link href="/chat-stream" className="horizontal-btn bg-[var(--morandiLightPurple)] text-white hover:bg-[var(--morandiDarkPurple)]">
            QAnything问答
          </Link>
          <Link href="/qanything-agent" className="horizontal-btn bg-[var(--morandiLightPurple)] text-white hover:bg-[var(--morandiDarkPurple)]">
            Agent管理
          </Link>
        </div>
      </div>
    </nav>
  );
}