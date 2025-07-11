'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function ChatStreamPage() {
  const [kbList, setKbList] = useState([]);
  const [selectedKbId, setSelectedKbId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistories, setChatHistories] = useState([]);
  const [currentChatId, setCurrentChatId] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const messagesEndRef = useRef(null);

  // 考研快速提问
  const quickQuestions = [
    "考研英语如何备考？",
    "考研数学重点知识点有哪些？",
    "如何制定考研复习计划？",
    "考研政治怎么复习？",
    "考研专业课如何准备？",
    "考研复试需要注意什么？",
    "考研择校有什么建议？",
    "考研心态如何调整？",
    "考研真题如何利用？",
    "考研冲刺阶段怎么安排？",
    "考研报考流程是什么？",
    "考研分数线如何查询？"
  ];

  // 考研学习小贴士
  const culturalTips = [
    "💡 备考策略：制定详细的复习计划，合理分配各科目的学习时间。",
    "📚 学习方法：理论与实践相结合，多做真题和模拟题提升应试能力。",
    "🎯 目标设定：根据自身实力合理选择目标院校和专业，不盲目追求热门。",
    "⏰ 时间管理：保持良好的作息习惯，提高学习效率比延长学习时间更重要。",
    "💪 心态调整：保持积极乐观的心态，适当放松，避免过度焦虑影响复习效果。"
  ];

  const [currentTip, setCurrentTip] = useState(0);

  // 生成对话标题
  const generateChatTitle = (messages) => {
    const firstUserMessage = messages.find(msg => msg.role === "user");
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 20) + (firstUserMessage.content.length > 20 ? "..." : "");
    }
    return "新对话";
  };

  // 保存对话历史到localStorage
  const saveChatHistory = (chatId, messages, kbId) => {
    const histories = JSON.parse(localStorage.getItem('exam_chat_histories') || '[]');
    const existingIndex = histories.findIndex(h => h.id === chatId);
    
    const chatData = {
      id: chatId,
      title: generateChatTitle(messages),
      messages: messages,
      kbId: kbId,
      createdAt: existingIndex === -1 ? Date.now() : histories[existingIndex].createdAt,
      updatedAt: Date.now()
    };

    if (existingIndex === -1) {
      histories.unshift(chatData);
    } else {
      histories[existingIndex] = chatData;
    }

    // 只保留最近50条对话历史
    const trimmedHistories = histories.slice(0, 50);
    localStorage.setItem('exam_chat_histories', JSON.stringify(trimmedHistories));
    setChatHistories(trimmedHistories);
  };

  // 加载对话历史
  const loadChatHistories = () => {
    const histories = JSON.parse(localStorage.getItem('exam_chat_histories') || '[]');
    setChatHistories(histories);
  };

  // 创建新对话
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    setError('');
  };

  // 加载指定对话
  const loadChat = (chatHistory) => {
    setCurrentChatId(chatHistory.id);
    setMessages(chatHistory.messages);
    setSelectedKbId(chatHistory.kbId);
    setError('');
  };

  // 删除对话历史
  const deleteChat = (chatId) => {
    const histories = chatHistories.filter(h => h.id !== chatId);
    localStorage.setItem('exam_chat_histories', JSON.stringify(histories));
    setChatHistories(histories);
    
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  // 获取知识库列表
  useEffect(() => {
    async function fetchKnowledgeBases() {
      try {
        const res = await fetch('/api/youdao-kb-list');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || '获取考研知识库失败');
        }
        const data = await res.json();
        setKbList(data);
        // 设置默认知识库
        if (data.length > 0) {
          setSelectedKbId('KB859adc70128e4088972bcaa7da1e5ee6_240430');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取考研知识库失败');
        // 设置默认知识库ID
        // 在useEffect中已经设置了正确的知识库ID
        setSelectedKbId('KB859adc70128e4088972bcaa7da1e5ee6_240430');
      }
    }
    fetchKnowledgeBases();
    loadChatHistories();
  }, []);

  // 考研学习小贴士轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % culturalTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理快速提问
  const handleQuickQuestion = (question) => {
    setInput(question);
    setShowQuickQuestions(false);
  };

  // 发送消息
  const sendMessage = async (userMessage = input.trim()) => {
    if (!userMessage || loading) return;
    if (!selectedKbId) {
      setError('请选择知识库');
      return;
    }

    setLoading(true);
    setError('');
    setInput('');

    // 如果没有当前对话ID，创建新对话
    const chatId = currentChatId || Date.now().toString();
    if (!currentChatId) {
      setCurrentChatId(chatId);
    }

    // 添加用户消息
    const newUserMessage = { 
      role: "user", 
      content: userMessage, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      const res = await fetch('/api/youdao-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          kbIds: [selectedKbId],
          history: messages.slice(-10).reduce((acc, msg, i, arr) => {
            if (msg.role === "user") {
              const nextMsg = arr[i + 1];
              if (nextMsg && nextMsg.role === "assistant" && nextMsg.content.trim()) {
                acc.push({
                  question: msg.content.trim(),
                  response: nextMsg.content.trim()
                });
              }
            }
            return acc;
          }, []),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '对话失败');
      }

      // 处理流式响应
      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      let assistantContent = "";
      const decoder = new TextDecoder();
      
      // 添加空的助手消息
      const newAssistantMessage = { 
        role: "assistant", 
        content: "", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, newAssistantMessage]);

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // 处理 Server-Sent Events 格式
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // 保留最后一行（可能不完整）
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.substring(5).trim(); // 移除 "data:" 前缀
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.result && data.result.response) {
                  assistantContent += data.result.response;
                  
                  // 更新助手消息内容
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex]?.role === "assistant") {
                      newMessages[lastIndex] = { 
                        role: "assistant", 
                        content: assistantContent,
                        timestamp: Date.now()
                      };
                    }
                    return newMessages;
                  });
                }
              }
            } catch {
              // 忽略解析错误，继续处理下一行
              console.warn('解析 SSE 数据失败:', line);
            }
          }
        }
      }

      // 保存对话历史
      const finalMessages = [...messages, newUserMessage, { role: "assistant", content: assistantContent, timestamp: Date.now() }];
      saveChatHistory(chatId, finalMessages, selectedKbId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '对话失败');
      // 移除可能添加的空助手消息
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.content === "") {
          newMessages.pop();
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[var(--morandiLightYellow)] via-[var(--morandiYellow)] to-[var(--morandiLightYellow)] flex relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[var(--morandiPurple)] rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 border-2 border-[var(--morandiLightPurple)] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 border-2 border-[var(--morandiDarkPurple)] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-[var(--morandiPurple)]/30 font-serif">考研</div>
      </div>

      {/* 左侧边栏 - 固定高度，内部滚动 */}
      <div className="w-80 h-full bg-white/80 backdrop-blur-sm border-r border-[var(--morandiPurple)]/30 shadow-lg flex flex-col relative z-10">
        {/* 头部 - 固定 */}
        <div className="flex-shrink-0 p-6 border-b border-[var(--morandiPurple)]/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] bg-clip-text text-transparent">
            考研问答助手
          </h1>
          <p className="text-[var(--morandiPurple)]/70 text-sm mt-1">基于考研知识库的智能问答</p>
        </div>

        {/* 考研学习小贴士 - 固定 */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--morandiPurple)]/20">
          <div className="bg-gradient-to-r from-[var(--morandiLightYellow)] to-[var(--morandiYellow)] rounded-lg p-3 min-h-[60px] flex items-center">
            <div className="text-sm text-[var(--morandiDarkPurple)] transition-all duration-500">
              {culturalTips[currentTip]}
            </div>
          </div>
        </div>

        {/* 新建对话和快速提问 - 固定 */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--morandiPurple)]/20">
          <button
            onClick={createNewChat}
            className="w-full bg-gradient-to-r from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 mb-3"
          >
            新建对话
          </button>
          <button
            onClick={() => setShowQuickQuestions(!showQuickQuestions)}
            className="w-full bg-white border-2 border-[var(--morandiPurple)] text-[var(--morandiPurple)] py-2 px-4 rounded-lg hover:bg-[var(--morandiLightYellow)] transition-all duration-300"
          >
            考研热门问题 {showQuickQuestions ? '▲' : '▼'}
          </button>
          
          {/* 快速提问列表 */}
          {showQuickQuestions && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-2 text-sm bg-[var(--morandiLightYellow)] hover:bg-[var(--morandiYellow)] rounded border border-[var(--morandiPurple)]/20 transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 知识库选择 - 固定 */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--morandiPurple)]/20">
          <label className="block text-sm font-medium text-[var(--morandiDarkPurple)] mb-2">
            选择考研知识库:
          </label>
          <select
            value={selectedKbId}
            onChange={(e) => setSelectedKbId(e.target.value)}
            className="flex-1 px-4 py-2 border border-[var(--morandiLightPurple)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)]/50 bg-white/90 backdrop-blur-sm text-[var(--morandiDarkPurple)]"
          >
            <option value="">请选择知识库</option>
            {kbList.map((kb) => (
              <option key={kb.kbId} value={kb.kbId}>
                {kb.kbName}
              </option>
            ))}
          </select>
        </div>

        {/* API状态提示 - 固定 */}
        {error && (
          <div className="flex-shrink-0 p-4 border-b border-[var(--morandiPurple)]/20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 对话历史 - 可滚动区域，完全保留 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-[var(--morandiDarkPurple)] mb-3">对话历史</h3>
          <div className="space-y-2">
            {chatHistories.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group ${
                  currentChatId === chat.id
                    ? 'bg-[var(--morandiLightYellow)] border-[var(--morandiPurple)]'
                    : 'bg-white border-[var(--morandiPurple)]/20 hover:bg-[var(--morandiLightYellow)]/50'
                }`}
                onClick={() => loadChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--morandiDarkPurple)] truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-[var(--morandiPurple)]/60 mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all duration-200 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 主聊天区域 - 固定高度，内部滚动 */}
      <div className="flex-1 h-full flex flex-col relative z-10">
        {/* 错误提示 */}
        {error && (
          <div className="flex-shrink-0 bg-red-50 border-b border-red-200 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 消息区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[var(--morandiPurple)]/20 max-w-md">
                <h2 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">开始考研问答</h2>
                <p className="text-[var(--morandiPurple)]/70 max-w-md mb-4">
                  请输入考研相关问题，我会基于知识库为您提供准确的答案
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* 头像 */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      message.role === 'user' 
                        ? 'bg-[var(--morandiPurple)] ml-3' 
                        : 'bg-[var(--morandiDarkPurple)] mr-3'
                    }`}>
                      {message.role === 'user' ? '我' : '助'}
                    </div>
                    
                    {/* 消息内容 */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[var(--morandiPurple)] text-white'
                        : 'bg-white/80 backdrop-blur-sm text-[var(--morandiDarkPurple)] border border-[var(--morandiPurple)]/20'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      {message.timestamp && (
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.role === 'user' ? 'text-white' : 'text-[var(--morandiPurple)]'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 加载状态 */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--morandiDarkPurple)] flex items-center justify-center text-white text-sm font-medium mr-3">
                      助
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-[var(--morandiPurple)]/20">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 - 固定在底部 */}
        <div className="flex-shrink-0 border-t border-[var(--morandiPurple)]/20 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="请输入您的考研问题..."
              className="flex-1 p-3 border border-[var(--morandiPurple)]/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)] bg-white"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto',
                overflow: 'hidden'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}