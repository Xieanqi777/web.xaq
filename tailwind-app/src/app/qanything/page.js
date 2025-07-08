'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function QAnythingPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' 或 'admin'
  const [chatHistory, setChatHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState({ hasQuestionKey: false, hasAdminKey: false });
  
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
  
  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  
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
    
    if (apiStatus.hasQuestionKey && apiStatus.hasAdminKey) {
      fetchAgentList();
    }
  }, [apiStatus]);
  
  // 修改handleSubmit函数以支持Agent聊天
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // 检查是否有对应模式的API密钥
    if ((mode === 'chat' && !apiStatus.hasQuestionKey) || 
        (mode === 'admin' && !apiStatus.hasAdminKey)) {
      setError(`${mode === 'chat' ? '问答' : '管理'}秘钥未配置`); 
      return;
    }
    
    setLoading(true);
    setError('');
    
    // 添加用户问题到聊天历史
    const newMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, newMessage]);
    
    try {
      // 构建请求数据
      const requestData = { question, mode };
      
      // 如果选择了Agent，使用agent_chat模式
      if (selectedAgent && mode === 'chat') {
        requestData.mode = 'agent_chat';
        requestData.uuid = selectedAgent;
      }
      
      const response = await fetch('/api/qanything', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      
      // 添加AI回答到聊天历史
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer || data.result || JSON.stringify(data) }]);
      setQuestion('');
    } catch (error) {
      console.error('API调用错误:', error);
      setError(error.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-[var(--morandiLightPurple)] opacity-20 blur-xl"></div>
          <h1 className="text-4xl font-bold text-[var(--morandiDarkPurple)] mb-2 relative z-10 section-title inline-block mx-auto">
            QAnything 知识问答
          </h1>
          <p className="text-lg text-[var(--morandiPurple)] max-w-2xl mx-auto mt-4">
            使用QAnything平台进行智能问答和知识库管理
          </p>
        </header>
        
        {/* 模式选择 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex">
            <button 
              onClick={() => setMode('chat')} 
              className={`px-4 py-2 rounded-md transition-all ${mode === 'chat' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              问答模式
            </button>
            <button 
              onClick={() => setMode('admin')} 
              className={`px-4 py-2 rounded-md ml-2 transition-all ${mode === 'admin' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              管理模式
            </button>
          </div>
        </div>
        
        {/* Agent选择 - 将外部代码移到这里 */}
        {mode === 'chat' && agentList.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">选择Agent (可选)</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full p-2 border rounded-md"
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
        
        {/* 聊天历史 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-h-[500px] overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>开始提问，探索QAnything的智能问答能力</p>
              <p className="text-sm mt-2">
                {mode === 'chat' ? '当前使用问答秘钥' : '当前使用管理秘钥'}
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div 
                  className={`inline-block max-w-[80%] rounded-lg p-3 ${msg.role === 'user' 
                    ? 'bg-[var(--morandiLightPurple)] text-[var(--morandiDarkPurple)]' 
                    : 'bg-gray-100 text-gray-800'}`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* 输入表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={mode === 'chat' ? "请输入您的问题..." : "请输入管理命令..."}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--morandiPurple)] resize-none"
              rows="3"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={`ml-4 px-6 py-3 rounded-lg bg-[var(--morandiPurple)] text-white font-medium transition-all ${loading || !question.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[var(--morandiDarkPurple)]'}`}
            >
              {loading ? '处理中...' : '发送'}
            </button>
          </div>
        </form>
        
        {/* API状态提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            问答秘钥状态: 
            <span className={apiStatus.hasQuestionKey ? 'text-green-500' : 'text-red-500'}>
              {apiStatus.hasQuestionKey ? ' 已配置' : ' 未配置'}
            </span>
          </p>
          <p>
            管理秘钥状态: 
            <span className={apiStatus.hasAdminKey ? 'text-green-500' : 'text-red-500'}>
              {apiStatus.hasAdminKey ? ' 已配置' : ' 未配置'}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

// 删除这段在组件外部的代码
// {mode === 'chat' && agentList.length > 0 && (
//   <div className="mb-4">
//     <label className="block text-sm font-medium text-gray-700 mb-1">选择Agent (可选)</label>
//     <select
//       value={selectedAgent}
//       onChange={(e) => setSelectedAgent(e.target.value)}
//       className="w-full p-2 border rounded-md"
//     >
//       <option value="">不使用Agent</option>
//       {agentList.map((agent) => (
//         <option key={agent.uuid} value={agent.uuid}>
//           {agent.name}
//         </option>
//       ))}
//     </select>
//   </div>
// )}