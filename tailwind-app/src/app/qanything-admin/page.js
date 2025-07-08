'use client';

import { useState, useEffect } from 'react';

export default function QAnythingAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // 表单状态
  const [action, setAction] = useState('create_kb');
  const [kbName, setKbName] = useState('');
  const [kbId, setKbId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  // 获取配置信息
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/qanything');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError('获取配置信息失败: ' + err.message);
      }
    }
    
    fetchConfig();
  }, []);
  
  // 提交管理请求
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const requestData = {
        mode: 'admin',
        action: action
      };
      
      // 根据操作类型添加必要参数
      if (action === 'create_kb') {
        requestData.kbName = kbName;
      } else if (action === 'delete_kb') {
        requestData.kbId = kbId;
      } else if (action === 'upload_url') {
        requestData.kbId = kbId;
        requestData.fileUrl = fileUrl;
      }
      
      const response = await fetch('/api/qanything', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '请求失败');
      }
    } catch (err) {
      setError('请求出错: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
  
  if (!config) {
    return <div className="p-6">加载配置信息...</div>;
  }
  
  if (!config.hasAdminKey) {
    return <div className="p-6 text-red-500">未配置管理秘钥，无法使用管理功能</div>;
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">QAnything 知识库管理</h1>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">当前配置</h2>
        <p>API 基础地址: {config.baseUrl}</p>
        <p>问答 API 密钥: {config.hasQuestionKey ? '已配置' : '未配置'}</p>
        <p>管理 API 密钥: {config.hasAdminKey ? '已配置' : '未配置'}</p>
        <p>默认知识库: {config.kbIds?.join(', ') || '无'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block mb-2 font-medium">操作类型</label>
          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="create_kb">创建知识库</option>
            <option value="delete_kb">删除知识库</option>
            <option value="upload_url">上传文档URL</option>
          </select>
        </div>
        
        {action === 'create_kb' && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">知识库名称</label>
            <input 
              type="text" 
              value={kbName} 
              onChange={(e) => setKbName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        
        {(action === 'delete_kb' || action === 'upload_url') && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">知识库ID</label>
            <input 
              type="text" 
              value={kbId} 
              onChange={(e) => setKbId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        
        {action === 'upload_url' && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">文档URL</label>
            <input 
              type="text" 
              value={fileUrl} 
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? '处理中...' : '提交'}
        </button>
      </form>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          <h3 className="font-semibold">错误</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          <h3 className="font-semibold">操作结果</h3>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}