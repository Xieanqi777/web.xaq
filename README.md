# Web前端技术课程练习平台
一个基于 Next.js 构建的现代化前端课程练习展示平台，集成了 QAnything 智能问答、GitHub 统计、旧作业整合等功能。

## 📋 项目简介
本项目是《Web前端技术》课程的综合练习平台，旨在展示从基础 HTML/CSS 到高级 JavaScript 的学习成果。平台采用现代化的技术栈，提供了直观的界面来浏览和访问各个练习项目，同时集成了智能问答系统和项目统计功能。

## 🎯 主要特性
- 📚 课程练习展示 ：8个精心设计的练习项目，涵盖HTML、CSS、JavaScript等核心技术
- 🤖 QAnything智能问答 ：集成有道QAnything API，提供智能问答和Agent管理功能
- 📊 GitHub统计 ：实时展示项目提交记录和开发活动
- 🎨 现代化UI ：采用Tailwind CSS和莫兰迪色彩设计，提供优雅的用户体验
- 📱 响应式设计 ：完美适配桌面端和移动端设备

## 🛠️ 技术栈
- 前端框架 ：Next.js 15.3.5 (App Router)
- UI框架 ：Tailwind CSS 4.0
- 开发语言 ：JavaScript/TypeScript
- 运行时 ：Node.js
- API集成 ：QAnything (有道智云)、GitHub API

## 🔧 QAnything集成详解
### 集成路径
tailwind-app/
├── src/app/api/qanything/route.js     # QAnything API路由<br>
├── src/app/qanything/page.js          # 问答界面<br>
├── src/app/chat-stream/page.js        # 流式对话界面<br>
├── src/app/qanything-agent/page.js    # Agent管理界面<br>
├── src/lib/youdao-api.js              # API工具函数<br>
└── youdao-api.ts                      # TypeScript API定义<br>

### 实现细节 
#### 1. API配置 ( src/app/api/qanything/route.js )
const QANYTHING_CONFIG = {<br>
  appKey: '',<br>
  adminKey: '',<br>
  baseUrl: '',<br>
  kbIds: ['']<br>
};<br>
#### 2. 签名生成机制
function generateSign(appKey, input, salt, curtime, appSecret = '') {<br>
  let processedInput = '';<br>
  if (input.length > 20) {<br>
    const inputLength = input.length;<br>
    processedInput = input.substring(0, 10) + inputLength + input.substring(inputLength - 10);<br>
  } else {<br>
    processedInput = input;<br>
  }<br>
  <br>
  const signStr = appKey + processedInput + salt + curtime + appSecret;<br>
  return crypto.createHash('sha256').update(signStr).digest('hex');<br>
}</br>
#### 3. 支持的功能
- 智能问答 ：基于知识库的问答功能
- 流式对话 ：实时流式响应
- Agent管理 ：创建、删除、列表管理智能Agent
- 知识库管理 ：支持知识库的CRUD操作
- 文件上传 ：支持URL方式上传文档到知识库

## 🏗️ Next.js项目结构
tailwind-app/
├── src/
│   ├── app/                          # App Router页面<br>
│   │   ├── page.js                   # 首页<br>
│   │   ├── layout.js                 # 全局布局<br>
│   │   ├── globals.css               # 全局样式<br>
│   │   ├── exercises/                # 练习中心<br>
│   │   ├── github-stats/             # GitHub统计<br>
│   │   ├── qanything/                # QAnything问答<br>
│   │   ├── chat-stream/              # 流式对话<br>
│   │   ├── qanything-agent/          # Agent管理<br>
│   │   └── api/                      # API路由<br>
│   │       ├── qanything/            # QAnything API<br>
│   │       ├── kb-list/              # 知识库列表<br>
│   │       └── static/               # 静态文件服务<br>
│   ├── components/                   # 可复用组件<br>
│   │   ├── Navbar.js                 # 导航栏<br>
│   │   ├── Footer.js                 # 页脚<br>
│   │   └── ExerciseCard.js           # 练习卡片<br>
│   ├── data/                         # 数据文件<br>
│   │   └── exercises.json            # 练习项目数据<br>
│   └── lib/                          # 工具库<br>
│       └── youdao-api.js             # API工具函数<br>
├── public/                           # 静态资源<br>
├── package.json                      # 项目配置<br>
├── next.config.mjs                   # Next.js配置<br>
├── tailwind.config.js                # Tailwind配置<br>
└── tsconfig.json                     # TypeScript配置<br>

## 📁 旧作业整合
### 整合方案
项目通过 Next.js 的 rewrites 功能，将旧的HTML作业文件无缝集成到新平台中：
// next.config.mjs<br>
async rewrites() {<br>
  return [<br>
    {<br>
      source: '/practice/:path*',<br>
      destination: '/api/static?path=practice/:path*',<br>
    },<br>
    {<br>
      source: '/images/:path*',<br>
      destination: '/api/static?path=images/:path*',<br>
    },<br>
  ];<br>
}<br>

### 作业列表
| 序号 | 项目名称 | 技术栈 | 描述 |
|------|----------|--------|------|
| 1 | 则知的喜好博物馆 | HTML, CSS | 个人喜好展示页面，博物馆风格设计 |
| 2 | 诗词的女儿——叶嘉莹女士 | HTML, CSS | 纪念页面，展示诗词传承 |
| 3 | 古琴雅韵 | HTML, CSS | 传统文化专题，CSS样式入门 |
| 4 | 网球赛场：概念演示 | CSS动画, 布局 | CSS核心概念，Flexbox/Grid |
| 5 | 网球场地：位置控制 | CSS定位 | Position属性详解 |
| 6 | 中国古典舞艺术 | JavaScript | 基础语法，变量和控制结构 |
| 7 | 敦煌文化之旅 | JavaScript, DOM | 面向对象编程，DOM操作 |
| 8 | 中国人民大学校史 | JavaScript, API | 异步编程，Promise/Fetch |

## 📊 GitHub集成
### 实现路径
src/app/github-stats/<br>
├── page.js                           # 统计主页面<br>
└── commits/[commitId]/page.js         # 提交详情页面<br>

async function getCommits() {<br>
  const res = await fetch('https://api.github.com/repos/Xieanqi777/web.xaq/commits?per_page=10');<br>
  if (!res.ok) {<br>
    throw new Error('Failed to fetch commits from GitHub');<br>
  }<br>
  return res.json();<br>
}</br>

### 功能特性
- 提交历史 ：展示最近10条提交记录
- 提交详情 ：点击查看具体提交的文件变更
- 实时数据 ：通过GitHub API获取最新数据

## 📊 Wakatime集成
### 实现路径
### 功能特性
#### 步骤 1: 创建 Cloudflare Worker 项目（通过 Cloudflare Dashboard）
登录 Cloudflare Dashboard。
导航到 “Workers & Pages”。
导航到“Workers & Pages”。
点击 “Create application”，然后选择 “Create Worker”。
点击“创建应用”，然后选择“创建 Worker”。
给您的 Worker 一个唯一的名称 (例如 wakatime-api-proxy)，然后点击 “Deploy”。
点击 “Edit code” 进入在线编辑器。
#### 步骤 2: 编写 Worker 逻辑以获取 Wakatime 数据
打开 src/index.js (或您在 Dashboard 中编辑的文件)，并替换为以下内容：
#### 步骤 3: 配置并部署 Cloudflare Worker
##### 1. 添加 Wakatime API Key 到环境变量:
通过 Cloudflare Dashboard:  通过 Cloudflare 控制台:
导航到您的 Worker。
点击 “Settings” -> “Variables”。
点击 “设置” -> “变量”。
在 “Environment Variables” 部分，点击 “Add variable”。
在 “环境变量” 部分，点击 “添加变量”。
设置 “Variable name” 为 WAKATIME_API_KEY。
设置 “变量名” 为 WAKATIME_API_KEY 。
设置 “Value” 为您的 Wakatime API Key。
设置 “值” 为您的 Wakatime API Key。
勾选 “Encrypt” (推荐)。
点击 “Save”。
##### 2. 部署 Worker:
通过 Cloudflare Dashboard: 如果您是在线编辑器中编写代码，保存更改后 Worker 会自动部署。您可以在 Worker 的概览页面找到其 URL。
##### 3. 测试 Worker:
在浏览器中访问您的 Worker URL。如果一切配置正确，您应该能看到 Wakatime API 返回的 JSON 数据。如果看到错误，请检查 Worker 日志 (通过 Dashboard 或 wrangler tail) 和之前的配置步骤。
#### 步骤 4: 在 Next.js 中创建或修改 Footer 组件
创建/修改 components/Footer.js

## 🚀 运行指南
### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
### 安装步骤
1. 克隆项目
git clone https://github.com/Xieanqi777/web.xaq.git<br>
cd web.xaq/tailwind-app<br>

3. 安装依赖
npm install<br>
 或<br>
yarn install<br>

3. 启动开发服务器
npm run dev<br>
 或<br>
yarn dev<br>

4. 访问应用
打开浏览器访问 http://localhost:3000<br>

### 生产部署
1. 构建项目
2. 启动生产服务器
### 可用脚本
- npm run dev - 启动开发服务器（支持Turbopack）
- npm run build - 构建生产版本
- npm run start - 启动生产服务器
- npm run lint - 代码检查

## 🎨 设计特色
### 莫兰迪色彩系统
项目采用莫兰迪色彩设计，营造优雅、舒适的视觉体验：

### 响应式设计
- 移动端优先的设计理念
- 灵活的网格布局系统
- 自适应的组件设计

## 📸 功能截图
### 主页面
主页展示了课程练习的卡片式布局，采用莫兰迪色彩设计

![1](https://github.com/user-attachments/assets/e2766f09-823c-4d8c-afbd-943c798613a6)

### QAnything问答系统
智能问答界面，支持实时对话和知识库查询

![8](https://github.com/user-attachments/assets/58162393-1921-4a7d-bd21-97c397fe2efa)
![12](https://github.com/user-attachments/assets/2b5ee9c8-7b5a-4273-8d4b-58331b3978eb)

### GitHub统计页面
类似WakaTime风格的提交统计和活动展示

<img width="1848" height="1023" alt="2(1)" src="https://github.com/user-attachments/assets/d4d4c4b9-0925-4170-a6a2-8880225c0667" />

### 练习中心
8个练习项目的详细展示，包含技术标签和描述

![4](https://github.com/user-attachments/assets/abb18357-7045-44bc-8ff4-7df89f98894b)
![3](https://github.com/user-attachments/assets/6f023e44-53ab-4820-8b86-39e957dc2825)
![13](https://github.com/user-attachments/assets/88698146-e53c-49e9-b319-a49997a7c783)


### Agent管理
QAnything Agent的创建、管理和配置界面

![14](https://github.com/user-attachments/assets/bda8370d-2dec-4b92-b853-5fdf01b4fbab)


## 🔮 未来规划
- 添加用户认证系统
- 集成更多AI服务
- 添加代码高亮和在线编辑
- 支持多语言国际化
- 添加学习进度跟踪
- 集成在线代码运行环境
## 📄 许可证
本项目仅用于学习和教育目的。

## 👨‍💻 作者
谢安琪 - 西北民族大学新闻传播学院2023级新闻学1班

这个项目从基础的HTML/CSS到高级的React/Next.js，体现了完整的学习路径和技术成长轨迹。
