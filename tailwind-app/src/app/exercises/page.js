'use client';
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

export default function ExercisesPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const exercises = [
    {
      id: 1,
      title: "则知的喜好博物馆",
      description: "探索个人喜好的数字化展示，学习HTML基础结构",
      link: "/practice/01-Preferences.html",
      icon: "🏛️",
      category: "HTML基础",
      difficulty: "初级",
      color: "from-[var(--morandiLightPurple)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 2,
      title: "诗词的女儿——叶嘉莹女士",
      description: "致敬诗词大师，学习文本排版和语义化标签",
      link: "/practice/02-yejiaying.html",
      icon: "📜",
      category: "文本设计",
      difficulty: "初级",
      color: "from-[var(--morandiBlue)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 3,
      title: "古琴雅韵",
      description: "传统文化与现代技术的融合，CSS样式入门",
      link: "/practice/03-css-01.html",
      icon: "🎵",
      category: "CSS基础",
      difficulty: "初级",
      color: "from-[var(--morandiGreen)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 4,
      title: "网球赛场：概念演示",
      description: "运动场景的视觉呈现，CSS布局技术",
      link: "/practice/04-css-01.html",
      icon: "🎾",
      category: "CSS布局",
      difficulty: "中级",
      color: "from-[var(--morandiPink)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 5,
      title: "网球场地：位置的控制",
      description: "精确的元素定位，CSS Position属性详解",
      link: "/practice/04-css-02.relative.html",
      icon: "🏟️",
      category: "CSS定位",
      difficulty: "中级",
      color: "from-[var(--morandiBeige)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 6,
      title: "JavaScript 核心语法学习一",
      description: "JavaScript基础语法，变量、函数和控制结构",
      link: "/practice/05-news01.html",
      icon: "⚡",
      category: "JavaScript",
      difficulty: "中级",
      color: "from-[var(--morandiYellow)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 7,
      title: "JavaScript 语法练习2",
      description: "深入JavaScript，对象、数组和高级特性",
      link: "/practice/06-news01.html",
      icon: "🚀",
      category: "JavaScript",
      difficulty: "中级",
      color: "from-[var(--morandiGray)]/40 to-[var(--morandiPurple)]/40"
    },
    {
      id: 8,
      title: "JavaScript 异步编程练习",
      description: "掌握异步编程，Promise、async/await实战",
      link: "/practice/07-async-01.html",
      icon: "🔄",
      category: "异步编程",
      difficulty: "高级",
      color: "from-[var(--morandiDarkPurple)]/40 to-[var(--morandiPurple)]/40"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '初级': return 'bg-[var(--morandiLightPurple)]/20 text-[var(--morandiDarkPurple)] border border-[var(--morandiLightPurple)]/50';
      case '中级': return 'bg-[var(--morandiBlue)]/20 text-[var(--morandiDarkPurple)] border border-[var(--morandiBlue)]/50';
      case '高级': return 'bg-[var(--morandiPink)]/20 text-[var(--morandiDarkPurple)] border border-[var(--morandiPink)]/50';
      default: return 'bg-[var(--morandiGray)]/20 text-[var(--morandiDarkPurple)] border border-[var(--morandiGray)]/50';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* 柔和背景装饰 - 与首页一致 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--morandiLightPurple)]/20 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--morandiBlue)]/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--morandiPurple)]/15 rounded-full"></div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pt-32 relative z-10">
        <header className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-[var(--morandiDarkPurple)] mb-2 relative z-10 section-title inline-block mx-auto">
            课程练习中心
          </h1>
          <p className="text-lg text-[var(--morandiPurple)] max-w-2xl mx-auto mt-4">
            探索前端开发的精彩世界，从基础到进阶，每一步都是成长的足迹
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-[var(--morandiLightPurple)]/30">
              <span className="w-3 h-3 bg-[var(--morandiPurple)] rounded-full"></span>
              <span className="text-sm text-[var(--morandiDarkPurple)] font-medium">8个练习项目</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-[var(--morandiBlue)]/30">
              <span className="w-3 h-3 bg-[var(--morandiBlue)] rounded-full"></span>
              <span className="text-sm text-[var(--morandiDarkPurple)] font-medium">3个难度等级</span>
            </div>
          </div>
        </header>

        {/* 练习卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-[var(--morandiLightPurple)]/30"
              onMouseEnter={() => setHoveredCard(exercise.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 卡片背景渐变 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${exercise.color} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* 卡片内容 */}
              <div className="relative p-6">
                {/* 图标和难度标签 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl transform group-hover:scale-105 transition-transform duration-300">
                    {exercise.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>

                {/* 标题和描述 */}
                <h3 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2 group-hover:text-[var(--morandiPurple)] transition-colors duration-300">
                  {exercise.title}
                </h3>
                <p className="text-[var(--morandiPurple)] text-sm mb-4 leading-relaxed">
                  {exercise.description}
                </p>

                {/* 分类标签 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--morandiDarkPurple)] bg-[var(--morandiLightPurple)]/20 px-2 py-1 rounded-full font-medium border border-[var(--morandiLightPurple)]/30">
                    {exercise.category}
                  </span>
                  <Link
                    href={exercise.link}
                    target="_blank"
                    className="inline-flex items-center space-x-2 text-[var(--morandiPurple)] hover:text-[var(--morandiDarkPurple)] font-medium transition-colors duration-300 group/link"
                  >
                    <span>开始练习</span>
                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 学习路径指南 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-[var(--morandiLightPurple)]/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--morandiDarkPurple)] mb-4">学习路径指南</h2>
            <p className="text-[var(--morandiPurple)] font-medium">按照推荐顺序学习，循序渐进掌握前端开发技能</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* HTML基础 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--morandiLightPurple)] to-[var(--morandiPurple)] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">HTML基础</h3>
              <p className="text-[var(--morandiPurple)] text-sm mb-4">学习网页结构和语义化标签</p>
              <div className="space-y-2">
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 个人喜好博物馆</div>
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 诗词文化展示</div>
              </div>
            </div>

            {/* CSS样式 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--morandiBlue)] to-[var(--morandiPurple)] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">CSS样式</h3>
              <p className="text-[var(--morandiPurple)] text-sm mb-4">掌握样式设计和布局技术</p>
              <div className="space-y-2">
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 古琴艺术展示</div>
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 网球场地布局</div>
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 元素定位控制</div>
              </div>
            </div>

            {/* JavaScript交互 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--morandiGreen)] to-[var(--morandiPurple)] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">JavaScript交互</h3>
              <p className="text-[var(--morandiPurple)] text-sm mb-4">实现动态交互和异步编程</p>
              <div className="space-y-2">
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 核心语法学习</div>
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 高级特性应用</div>
                <div className="text-sm text-[var(--morandiDarkPurple)] font-medium">• 异步编程实战</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}