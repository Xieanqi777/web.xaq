import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ExercisesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            课程练习详情
          </h1>
          <p className="text-lg text-slate-600">
            这里展示了各个练习的详细内容，您可以查看和体验每个练习。
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">练习导航</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/practice/01-Preferences.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  01 - 则知的喜好博物馆
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/02-yejiaying.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  02 - 诗词的女儿——叶嘉莹女士
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/03-css-01.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  03 - 古琴雅韵
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/04-css-01.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  04 - 网球赛场：概念演示
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/04-css-02.relative.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  04 - 网球场地：位置的控制
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/05-news01.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  05 - JavaScript 核心语法学习一
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/06-news01.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  06 - JavaScript 语法练习2
                </Link>
              </li>
              <li>
                <Link 
                  href="/practice/07-async-01.html" 
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  07 - JavaScript 异步编程练习
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">练习说明</h2>
            <p className="text-slate-600 mb-4">
              这些练习涵盖了Web前端开发的多个方面，包括：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>HTML基础结构和语义化标签的使用</li>
              <li>CSS样式设计、布局技术和动画效果</li>
              <li>JavaScript核心语法、DOM操作和异步编程</li>
              <li>响应式设计和用户交互体验</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}