import Navbar from "@/components/Navbar";
import ExerciseCard from "@/components/ExerciseCard";
import exercises from "@/data/exercises.json";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <header className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-[var(--morandiDarkPurple)] mb-2 relative z-10 section-title inline-block mx-auto">
            《Web前端开发》课程练习
          </h1>
          <p className="text-lg text-[var(--morandiPurple)] max-w-2xl mx-auto mt-4">
            欢迎来到课程练习展示平台，这里汇集了各个阶段的学习成果。
          </p>
        </header>

        {/* 练习卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.title}
              description={exercise.description}
              imageUrl={exercise.imageUrl}
              link={exercise.link}
              tags={exercise.tags}
            />
          ))}
        </div>
      </main>
      {/* Footer 组件将在 layout.js 中添加 */}
    </div>
  );
}