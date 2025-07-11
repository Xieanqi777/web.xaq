'use client';

import { useState, useEffect, useRef } from 'react';

export default function QAnythingPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' 或 'admin'
  const [chatHistory, setChatHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState({ hasQuestionKey: false, hasAdminKey: false });
  const [kbList, setKbList] = useState([]);
  const [selectedKbId, setSelectedKbId] = useState('');
  
  const messagesEndRef = useRef(null);
  
  // 检查API配置状态
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('/api/qanything');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data);
        }
      } catch (error) {
        console.error('获取API状态失败:', error);
      }
    }
    
    checkApiStatus();
  }, []);
  
  // 获取知识库列表
  useEffect(() => {
    async function fetchKnowledgeBases() {
      try {
        const res = await fetch('/api/kb-list');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || '获取知识库列表失败');
        }
        const data = await res.json();
        setKbList(data);
        // 直接设置为指定的知识库 ID，无论列表中是否包含该知识库
        setSelectedKbId('KB859adc70128e4088972bcaa7da1e5ee6_240430');
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取知识库列表失败');
        // 即使获取知识库列表失败，也设置默认知识库 ID
        setSelectedKbId('KB859adc70128e4088972bcaa7da1e5ee6_240430');
      }
    }
    fetchKnowledgeBases();
  }, []);

  // 添加Agent选择状态
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentList, setAgentList] = useState([]);
  
  // 在useEffect中获取Agent列表
  useEffect(() => {
    async function fetchAgentList() {
      if (apiStatus.hasAdminKey) {
        try {
          const response = await fetch('/api/qanything', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mode: 'admin', action: 'list_agents' }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.result && Array.isArray(data.result)) {
            setAgentList(data.result);
          }
        } catch (error) {
          console.error('获取Agent列表失败:', error);
        }
      }
    }
    
    fetchAgentList();
  }, [apiStatus.hasAdminKey]);

  // 考研热门问题
  const popularQuestions = [
    "考研数学一和数学二有什么区别？",
    "考研英语如何提高阅读理解能力？",
    "考研政治复习重点是什么？",
    "如何制定考研复习计划？",
    "考研专业课怎么复习？"
  ];

  // 快捷问题点击处理
  const handleQuickQuestion = (questionText) => {
    setQuestion(questionText);
  };

  // 修改handleSubmit函数以支持流式问答
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // 检查是否有对应模式的API密钥
    if ((mode === 'chat' && !apiStatus.hasQuestionKey) || 
        (mode === 'admin' && !apiStatus.hasAdminKey)) {
      setError(`${mode === 'chat' ? '问答' : '管理'}秘钥未配置`); 
      return;
    }
    
    // 检查是否选择了知识库
    if (mode === 'chat' && !selectedKbId) {
      setError('请选择知识库');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // 添加用户问题到聊天历史
    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    
    try {
      if (mode === 'admin') {
        // 管理模式使用原有的API
        const response = await fetch('/api/qanything', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question, mode }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '请求失败');
        }
        
        // 添加AI回答到聊天历史
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer || data.result || JSON.stringify(data) }]);
      } else {
        // 聊天模式使用流式API
        // 准备历史记录
        const history = chatHistory.reduce((acc, msg, i, arr) => {
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
        }, []).slice(-10); // 只保留最近10轮对话
        
        // 添加空的助手消息
        const assistantMessage = { role: 'assistant', content: '' };
        setChatHistory(prev => [...prev, assistantMessage]);
        
        // 发送流式请求
        const res = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.trim(),
            kbIds: [selectedKbId],
            history: history,
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
                    setChatHistory(prev => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = { 
                          role: "assistant", 
                          content: assistantContent
                        };
                      }
                      return newMessages;
                    });
                  }
                }
              } catch (err) {
                // 忽略解析错误，继续处理下一行
                console.warn('解析 SSE 数据失败:', line);
              }
            }
          }
        }
      }
      
      setQuestion('');
    } catch (error) {
      console.error('API调用错误:', error);
      setError(error.message || '请求失败');
      
      // 移除可能添加的空助手消息
      setChatHistory(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === "assistant" && newMessages[newMessages.length - 1]?.content === "") {
          newMessages.pop();
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--morandiLightYellow)] via-[var(--morandiYellow)] to-[var(--morandiLightYellow)] flex relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[var(--morandiPurple)] rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 border-2 border-[var(--morandiLightPurple)] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 border-2 border-[var(--morandiDarkPurple)] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-[var(--morandiPurple)]/30 font-serif">考研</div>
      </div>

      {/* 左侧边栏 */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-[var(--morandiPurple)]/30 shadow-lg flex flex-col relative z-10 overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-[var(--morandiPurple)]/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] bg-clip-text text-transparent">
            考研智能助手
          </h1>
          <p className="text-[var(--morandiPurple)]/70 text-sm mt-1">基于考研知识库的智能问答</p>
        </div>

        {/* 模式选择 */}
        <div className="p-4 border-b border-[var(--morandiPurple)]/20">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-md p-2 inline-flex">
              <button 
                onClick={() => setMode('chat')} 
                className={`px-4 py-2 rounded-md transition-all ${mode === 'chat' 
                  ? 'bg-[var(--morandiPurple)] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-[var(--morandiLightPurple)]/20'}
              >
                问答模式
              </button>
              <button 
                onClick={() => setMode('admin')} 
                className={`px-4 py-2 rounded-md ml-2 transition-all ${mode === 'admin' 
                  ? 'bg-[var(--morandiPurple)] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-[var(--morandiLightPurple)]/20'}
              >
                管理模式
              </button>
            </div>
          </div>
        </div>

        {/* 考研热门问题 */}
        {mode === 'chat' && (
          <div className="p-4 border-b border-[var(--morandiPurple)]/20">
            <label className="block text-sm font-medium text-[var(--morandiDarkPurple)] mb-3">
              考研热门问题
            </label>
            <div className="space-y-2">
              {popularQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q)}
                  className="w-full text-left px-3 py-2 text-xs bg-[var(--morandiLightPurple)]/10 hover:bg-[var(--morandiLightPurple)]/20 border border-[var(--morandiPurple)]/20 rounded-lg text-[var(--morandiDarkPurple)] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 知识库选择 */}
        {mode === 'chat' && kbList.length > 0 && (
          <div className="p-4 border-b border-[var(--morandiPurple)]/20">
            <label className="block text-sm font-medium text-[var(--morandiDarkPurple)] mb-3">
              选择知识库
            </label>
            <select
              value={selectedKbId}
              onChange={(e) => setSelectedKbId(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--morandiLightPurple)]/10 border border-[var(--morandiPurple)]/30 rounded-xl text-[var(--morandiDarkPurple)] focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)] focus:border-transparent transition-all"
            >
              <option value="">请选择知识库</option>
              {kbList.map((kb) => (
                <option key={kb.kbId} value={kb.kbId}>
                  {kb.kbName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Agent选择 */}
        {mode === 'chat' && agentList.length > 0 && (
          <div className="p-4 border-b border-[var(--morandiPurple)]/20">
            <label className="block text-sm font-medium text-[var(--morandiDarkPurple)] mb-3">
              选择Agent (可选)
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--morandiLightPurple)]/10 border border-[var(--morandiPurple)]/30 rounded-xl text-[var(--morandiDarkPurple)] focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)] focus:border-transparent transition-all"
            >
              <option value="">不使用Agent</option>
              {agentList.map((agent) => (
                <option key={agent.uuid} value={agent.uuid}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* API状态提示 */}
        <div className="p-4 border-b border-[var(--morandiPurple)]/20">
          <div className="text-sm text-[var(--morandiDarkPurple)]">
            <p className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus.hasQuestionKey ? 'bg-green-500' : 'bg-[var(--morandiPurple)]'}`}></span>
              问答秘钥: {apiStatus.hasQuestionKey ? '已配置' : '未配置'}
            </p>
            <p className="flex items-center mt-2">
              <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus.hasAdminKey ? 'bg-green-500' : 'bg-[var(--morandiPurple)]'}`}></span>
              管理秘钥: {apiStatus.hasAdminKey ? '已配置' : '未配置'}
            </p>
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* 错误提示 */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-[var(--morandiLightPurple)]/10 border border-[var(--morandiPurple)]/30 rounded-xl">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full mr-3"></div>
              <span className="text-[var(--morandiDarkPurple)] text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-[var(--morandiLightYellow)]">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">欢迎使用考研智能助手</h2>
              <p className="text-[var(--morandiPurple)]/70 max-w-md mb-4">
                我是您的考研专属助手，可以为您解答考研相关的各种问题，包括复习方法、考试技巧、专业选择等
              </p>
              <div className="text-sm text-[var(--morandiPurple)]/60">
                💡 您可以点击左侧的热门问题快速开始，或直接输入您的问题
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* 头像 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)]' 
                        : 'bg-gradient-to-br from-[var(--morandiLightPurple)] to-[var(--morandiPurple)]'
                    }`}>
                      {message.role === 'user' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    
                    {/* 消息内容 */}
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] text-white'
                        : 'bg-white/90 border border-[var(--morandiPurple)]/20 text-gray-800 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[70%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--morandiLightPurple)] to-[var(--morandiPurple)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="bg-white/90 border border-[var(--morandiPurple)]/20 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[var(--morandiPurple)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-[var(--morandiPurple)] text-sm">正在思考...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="border-t border-[var(--morandiPurple)]/30 bg-[var(--morandiLightYellow)]/40 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={mode === 'chat' ? "请输入您的考研问题... (Shift+Enter 换行)" : "输入管理命令..."}
                    className="w-full px-4 py-3 pr-12 bg-[var(--morandiLightYellow)]/60 border border-[var(--morandiPurple)]/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)] focus:border-transparent transition-all placeholder-[var(--morandiPurple)]/50 text-gray-800"
                    disabled={loading}
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-[var(--morandiPurple)]/60">
                    {question.length}/1000
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="w-12 h-12 bg-gradient-to-br from-[var(--morandiPurple)] to-[var(--morandiDarkPurple)] text-white rounded-2xl hover:from-[var(--morandiDarkPurple)] hover:to-[var(--morandiPurple)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}