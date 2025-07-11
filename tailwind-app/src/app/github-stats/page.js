// src/app/github-stats/page.js
import Link from 'next/link';

async function getCommits() {
  // 注意：对于未认证的请求，GitHub API 有速率限制。
  // 在实际生产应用中，您可能需要使用认证的请求或后端代理。
  const res = await fetch('https://api.github.com/repos/Xieanqi777/web.xaq/commits?per_page=10', {
    // next: { revalidate: 3600 } // 可选：每小时重新验证数据
  });
  if (!res.ok) {
    // 如果请求失败，抛出错误，会被 error.js 捕获
    throw new Error('Failed to fetch commits from GitHub');
  }
  return res.json();
}

export default async function GitHubStatsPage() {
  let commits = [];
  let errorFetching = null;

  try {
    commits = await getCommits();
  } catch (error) {
    console.error(error);
    errorFetching = error.message;
    // 错误信息将在 error.js 中处理，这里也可以选择性地展示一些信息
  }

  if (errorFetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="container mx-auto p-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[var(--morandiLightPurple)]/30">
            <h1 className="text-3xl font-bold mb-4 text-[var(--morandiDarkPurple)]">
              获取 GitHub 提交数据失败
            </h1>
            <p className="text-[var(--morandiPurple)] mb-4">{errorFetching}</p>
            <p className="text-[var(--morandiPurple)]/80">
              请检查网络连接或稍后再试。详细错误已记录在控制台。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--morandiLightPurple)] opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[var(--morandiPink)] opacity-15 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-[var(--morandiBlue)] opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto p-8 relative z-10">
        {/* 页面标题区域 */}
        <header className="text-center mb-12 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-[var(--morandiLightPurple)] opacity-20 blur-xl"></div>
          <h1 className="text-4xl font-bold text-[var(--morandiDarkPurple)] mb-4 relative z-10">
            GitHub 项目统计
          </h1>
          <div className="inline-block px-6 py-2 bg-[var(--morandiLightPurple)]/20 rounded-full border border-[var(--morandiPurple)]/30">
            <p className="text-lg text-[var(--morandiPurple)] font-medium">
              Xieanqi777/web.xaq 最近 {commits.length} 条提交记录
            </p>
          </div>
        </header>

        {/* 提交记录列表 */}
        {commits.length > 0 ? (
          <div className="space-y-6">
            {commits.map((commit, index) => (
              <div 
                key={commit.sha} 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[var(--morandiLightPurple)]/30 hover:shadow-xl transition-all duration-300 hover:border-[var(--morandiPurple)]/50"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 提交信息标题 */}
                    <div className="mb-3">
                      <Link 
                        href={`/github-stats/commits/${commit.sha}`} 
                        className="text-xl font-bold text-[var(--morandiDarkPurple)] hover:text-[var(--morandiPurple)] transition-colors duration-200 group-hover:underline"
                      >
                        {commit.commit.message.split('\n')[0]}
                      </Link>
                    </div>

                    {/* 作者信息 */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full"></div>
                        <span className="text-[var(--morandiPurple)] font-medium">
                          {commit.commit.author.name}
                        </span>
                      </div>
                      <div className="text-[var(--morandiPurple)]/70 text-sm">
                        {commit.commit.author.email}
                      </div>
                    </div>

                    {/* 提交时间 */}
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-[var(--morandiPurple)]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[var(--morandiPurple)]/70 text-sm">
                        {new Date(commit.commit.author.date).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* 查看详情按钮 */}
                    <Link 
                      href={`/github-stats/commits/${commit.sha}`} 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--morandiPurple)]/10 hover:bg-[var(--morandiPurple)]/20 text-[var(--morandiDarkPurple)] rounded-lg transition-all duration-200 hover:translate-x-1 border border-[var(--morandiPurple)]/20"
                    >
                      <span className="font-medium">查看详情</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* 提交SHA标识 */}
                  <div className="ml-4">
                    <div className="px-3 py-1 bg-[var(--morandiLightPurple)]/30 rounded-full">
                      <span className="text-xs font-mono text-[var(--morandiDarkPurple)]/80">
                        {commit.sha.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[var(--morandiLightPurple)]/30 max-w-md mx-auto">
              <div className="w-16 h-16 bg-[var(--morandiLightPurple)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--morandiPurple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[var(--morandiPurple)] text-lg">
                未能获取到提交记录，或仓库中没有提交。
              </p>
            </div>
          </div>
        )}

        {/* 返回首页链接 */}
        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--morandiPurple)]/10 hover:bg-[var(--morandiPurple)]/20 text-[var(--morandiDarkPurple)] rounded-xl transition-all duration-200 hover:scale-105 border border-[var(--morandiPurple)]/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">返回首页</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
