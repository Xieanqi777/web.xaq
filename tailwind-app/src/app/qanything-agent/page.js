'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function QAnythingAgentPage() {
  // 状态管理
  const [agents, setAgents] = useState([]);
  const [kbList, setKbList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [action, setAction] = useState('list_agents');
  
  // Agent表单状态
  const [agentForm, setAgentForm] = useState({
    uuid: '',
    botName: '',
    botDescription: '',
    model: 'QAnything 16k',
    maxToken: 4096,
    hybridSearch: true,
    networking: true,
    needSource: true,
    botPromptSetting: '',
    welcomeMessage: '您好，我是您的专属机器人，请问有什么可以帮您呢？',
    kbIds: []
  });
  
  // 获取API配置状态
  const [apiStatus, setApiStatus] = useState({ hasQuestionKey: false, hasAdminKey: false });
  
  // 检查API配置状态
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('/api/qanything');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data);
          
          // 如果有管理秘钥，自动获取Agent列表
          if (data.hasAdminKey) {
            fetchAgentList();
          }
        }
      } catch (error) {
        console.error('获取API状态失败:', error);
      }
    }
    
    checkApiStatus();
  }, []);
  
  // 获取Agent列表
  const fetchAgentList = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/qanything', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: 'admin', action: 'list_agents' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      
      if (data.result && Array.isArray(data.result)) {
        setAgents(data.result);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('获取Agent列表失败:', error);
      setError(error.message || '获取Agent列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取知识库列表
  const fetchKbList = async () => {
    try {
      // 这里需要实现获取知识库列表的API
      // 暂时使用默认知识库
      if (apiStatus.kbIds && Array.isArray(apiStatus.kbIds)) {
        setKbList(apiStatus.kbIds.map(id => ({ id, name: id })));
      }
    } catch (error) {
      console.error('获取知识库列表失败:', error);
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 检查是否有管理秘钥
    if (!apiStatus.hasAdminKey) {
      setError('管理秘钥未配置'); 
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // 根据不同操作构建请求数据
      const requestData = { mode: 'admin', action };
      
      switch (action) {
        case 'create_agent':
          if (!agentForm.botName || !agentForm.kbIds || agentForm.kbIds.length === 0) {
            throw new Error('Agent名称和知识库不能为空');
          }
          Object.assign(requestData, agentForm);
          break;
          
        case 'update_agent':
          if (!agentForm.uuid || !agentForm.botName) {
            throw new Error('Agent UUID和名称不能为空');
          }
          Object.assign(requestData, agentForm);
          break;
          
        case 'delete_agent':
          if (!agentForm.uuid) {
            throw new Error('Agent UUID不能为空');
          }
          requestData.uuid = agentForm.uuid;
          break;
          
        case 'bind_kbs':
          if (!agentForm.uuid || !agentForm.kbIds || agentForm.kbIds.length === 0) {
            throw new Error('Agent UUID和知识库不能为空');
          }
          requestData.uuid = agentForm.uuid;
          requestData.kbIds = agentForm.kbIds;
          break;
          
        default:
          throw new Error('不支持的操作');
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
      
      // 操作成功
      setSuccess(`${getActionName(action)}成功`);
      
      // 重置表单（除了删除操作）
      if (action !== 'delete_agent') {
        resetForm();
      }
      
      // 刷新Agent列表
      fetchAgentList();
    } catch (error) {
      console.error('API调用错误:', error);
      setError(error.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 重置表单
  const resetForm = () => {
    setAgentForm({
      uuid: '',
      botName: '',
      botDescription: '',
      model: 'QAnything 16k',
      maxToken: 4096,
      hybridSearch: true,
      networking: true,
      needSource: true,
      botPromptSetting: '',
      welcomeMessage: '您好，我是您的专属机器人，请问有什么可以帮您呢？',
      kbIds: []
    });
  };
  
  // 选择Agent进行编辑
  const selectAgent = (agent) => {
    setAgentForm({
      uuid: agent.uuid,
      botName: agent.name,
      botDescription: agent.description || '',
      model: agent.model || 'QAnything 16k',
      maxToken: agent.maxToken || 4096,
      hybridSearch: agent.hybridSearch !== undefined ? agent.hybridSearch : true,
      networking: agent.networking !== undefined ? agent.networking : true,
      needSource: agent.needSource !== undefined ? agent.needSource : true,
      botPromptSetting: agent.promptSetting || '',
      welcomeMessage: agent.welcomeMessage || '您好，我是您的专属机器人，请问有什么可以帮您呢？',
      kbIds: []
    });
  };
  
  // 获取操作名称
  const getActionName = (actionType) => {
    switch (actionType) {
      case 'create_agent': return '创建Agent';
      case 'update_agent': return '更新Agent';
      case 'delete_agent': return '删除Agent';
      case 'bind_kbs': return '绑定知识库';
      case 'list_agents': return '获取Agent列表';
      default: return actionType;
    }
  };
  
  // 处理知识库选择
  const handleKbSelect = (e) => {
    const options = e.target.options;
    const selectedKbs = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedKbs.push(options[i].value);
      }
    }
    setAgentForm(prev => ({ ...prev, kbIds: selectedKbs }));
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-[var(--morandiLightPurple)] opacity-20 blur-xl"></div>
          <h1 className="text-4xl font-bold text-[var(--morandiDarkPurple)] mb-2 relative z-10 section-title inline-block mx-auto">
            QAnything Agent管理
          </h1>
          <p className="text-lg text-[var(--morandiPurple)] max-w-2xl mx-auto mt-4">
            创建和管理您的QAnything智能Agent
          </p>
        </header>
        
        {/* API状态提示 */}
        <div className="mb-6 text-center">
          <p className={`text-sm ${apiStatus.hasAdminKey ? 'text-green-500' : 'text-red-500'}`}>
            管理秘钥状态: {apiStatus.hasAdminKey ? '已配置' : '未配置'}
          </p>
          {!apiStatus.hasAdminKey && (
            <p className="text-red-500 text-sm mt-1">请先在服务器配置管理秘钥</p>
          )}
        </div>
        
        {/* 操作选择 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex flex-wrap">
            <button 
              onClick={() => { setAction('list_agents'); fetchAgentList(); }}
              className={`px-4 py-2 rounded-md m-1 transition-all ${action === 'list_agents' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Agent列表
            </button>
            <button 
              onClick={() => { setAction('create_agent'); resetForm(); fetchKbList(); }}
              className={`px-4 py-2 rounded-md m-1 transition-all ${action === 'create_agent' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={!apiStatus.hasAdminKey}
            >
              创建Agent
            </button>
            <button 
              onClick={() => { setAction('update_agent'); resetForm(); }}
              className={`px-4 py-2 rounded-md m-1 transition-all ${action === 'update_agent' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={!apiStatus.hasAdminKey}
            >
              更新Agent
            </button>
            <button 
              onClick={() => { setAction('delete_agent'); resetForm(); }}
              className={`px-4 py-2 rounded-md m-1 transition-all ${action === 'delete_agent' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={!apiStatus.hasAdminKey}
            >
              删除Agent
            </button>
            <button 
              onClick={() => { setAction('bind_kbs'); resetForm(); fetchKbList(); }}
              className={`px-4 py-2 rounded-md m-1 transition-all ${action === 'bind_kbs' 
                ? 'bg-[var(--morandiPurple)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={!apiStatus.hasAdminKey}
            >
              绑定知识库
            </button>
          </div>
        </div>
        
        {/* 错误和成功提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}
        
        {/* Agent列表 */}
        {action === 'list_agents' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--morandiDarkPurple)]">Agent列表</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无Agent</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UUID</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map((agent, index) => (
                      <tr key={agent.uuid || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.uuid}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{agent.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.model || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => { setAction('update_agent'); selectAgent(agent); }}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            编辑
                          </button>
                          <button 
                            onClick={() => { setAction('delete_agent'); setAgentForm(prev => ({ ...prev, uuid: agent.uuid })); }}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <button
                onClick={fetchAgentList}
                disabled={loading}
                className={`px-4 py-2 rounded-md bg-[var(--morandiPurple)] text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--morandiDarkPurple)]'}`}
              >
                {loading ? '刷新中...' : '刷新列表'}
              </button>
            </div>
          </div>
        )}
        
        {/* Agent表单 */}
        {(action === 'create_agent' || action === 'update_agent' || action === 'delete_agent' || action === 'bind_kbs') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--morandiDarkPurple)]">{getActionName(action)}</h2>
            
            {/* UUID选择（更新、删除、绑定知识库时需要） */}
            {(action === 'update_agent' || action === 'delete_agent' || action === 'bind_kbs') && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uuid">
                  Agent UUID <span className="text-red-500">*</span>
                </label>
                <select
                  id="uuid"
                  value={agentForm.uuid}
                  onChange={(e) => {
                    const selectedUuid = e.target.value;
                    const selectedAgent = agents.find(a => a.uuid === selectedUuid);
                    if (selectedAgent && action === 'update_agent') {
                      selectAgent(selectedAgent);
                    } else {
                      setAgentForm(prev => ({ ...prev, uuid: selectedUuid }));
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">选择Agent</option>
                  {agents.map(agent => (
                    <option key={agent.uuid} value={agent.uuid}>{agent.name} ({agent.uuid})</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* 名称和描述（创建和更新时需要） */}
            {(action === 'create_agent' || action === 'update_agent') && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="botName">
                    Agent名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="botName"
                    type="text"
                    value={agentForm.botName}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, botName: e.target.value }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="输入Agent名称（不超过20字符）"
                    maxLength={20}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="botDescription">
                    Agent描述
                  </label>
                  <textarea
                    id="botDescription"
                    value={agentForm.botDescription}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, botDescription: e.target.value }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="输入Agent描述（不超过200字符）"
                    rows="3"
                    maxLength={200}
                  />
                </div>
              </>
            )}
            
            {/* 知识库选择（创建和绑定知识库时需要） */}
            {(action === 'create_agent' || action === 'bind_kbs') && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="kbIds">
                  知识库 <span className="text-red-500">*</span>
                </label>
                <select
                  id="kbIds"
                  multiple
                  value={agentForm.kbIds}
                  onChange={handleKbSelect}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  size="5"
                  required
                >
                  {kbList.map(kb => (
                    <option key={kb.id} value={kb.id}>{kb.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">按住Ctrl键可多选（最多100个）</p>
              </div>
            )}
            
            {/* 高级设置（创建和更新时需要） */}
            {(action === 'create_agent' || action === 'update_agent') && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
                    首选模型
                  </label>
                  <select
                    id="model"
                    value={agentForm.model}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, model: e.target.value }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="QAnything 16k">QAnything 16k</option>
                    <option value="QAnything 4o mini">QAnything 4o mini</option>
                    <option value="QAnything 4o">QAnything 4o</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxToken">
                    回复上限
                  </label>
                  <input
                    id="maxToken"
                    type="number"
                    value={agentForm.maxToken}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, maxToken: parseInt(e.target.value) }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    max="16000"
                  />
                </div>
                
                <div className="mb-4 flex flex-wrap">
                  <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agentForm.hybridSearch}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, hybridSearch: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700 text-sm">开启混合检索</span>
                    </label>
                  </div>
                  
                  <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agentForm.networking}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, networking: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700 text-sm">开启联网检索</span>
                    </label>
                  </div>
                  
                  <div className="w-full md:w-1/3 px-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agentForm.needSource}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, needSource: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700 text-sm">返回信息来源</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="botPromptSetting">
                    角色设定
                  </label>
                  <textarea
                    id="botPromptSetting"
                    value={agentForm.botPromptSetting}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, botPromptSetting: e.target.value }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="输入Agent角色设定"
                    rows="3"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="welcomeMessage">
                    欢迎语
                  </label>
                  <textarea
                    id="welcomeMessage"
                    value={agentForm.welcomeMessage}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="输入Agent欢迎语"
                    rows="3"
                  />
                </div>
              </>
            )}
            
            {/* 提交按钮 */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                disabled={loading || !apiStatus.hasAdminKey}
                className={`px-6 py-3 rounded-lg bg-[var(--morandiPurple)] text-white font-medium transition-all ${loading || !apiStatus.hasAdminKey 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[var(--morandiDarkPurple)]'}`}
              >
                {loading ? '处理中...' : getActionName(action)}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium transition-all hover:bg-gray-300"
              >
                重置
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}