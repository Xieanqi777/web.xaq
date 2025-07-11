import "./globals.css";
import Footer from "../components/Footer"; // 改为相对路径

export const metadata = {
  title: "Web前端开发练习平台",
  description: "《Web前端开发》课程练习成果展示",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head></head>
      <body className={`antialiased bg-[var(--background)] flex flex-col min-h-screen`}>
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
