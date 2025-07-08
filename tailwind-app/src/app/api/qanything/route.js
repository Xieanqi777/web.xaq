import { NextResponse } from 'next/server';
import crypto from 'crypto';

// QAnything API 配置
const QANYTHING_CONFIG = {
  appKey: 'bot-VRfYDcoqo3dRMBOMMU9G341SROn0cwUK', // 用户提供的 API KEY
  adminKey: 'qanything-WghqgR0VxRsdDwjcgzizOGegqfMPxjPY', // 管理秘钥
  baseUrl: 'https://openapi.youdao.com', // API 基础地址
  kbIds: ['KB859adc70128e4088972bcaa7da1e5ee6_240430'] // 默认知识库ID
};

// 生成签名
function generateSign(appKey, input, salt, curtime, appSecret = '') {
  // 根据 QAnything API 文档的签名生成方法
  // input 的计算方式：input=q前10个字符 + q长度 + q后10个字符（当q长度大于20）或 input=q字符串（当q长度小于等于20）
  let processedInput = '';
  if (input.length > 20) {
    const inputLength = input.length;
    processedInput = input.substring(0, 10) + inputLength + input.substring(inputLength - 10);
  } else {
    processedInput = input;
  }
  
  const signStr = appKey + processedInput + salt + curtime + appSecret;
  return crypto.createHash('sha256').update(signStr).digest('hex');
}

// 问答 API
export async function POST(request) {
  try {
    const body = await request.json();
    const { question, mode = 'chat', action, kbName, kbId, fileUrl, fileName, uuid, botName, botDescription, model, maxToken, hybridSearch, networking, needSource, botPromptSetting, welcomeMessage, kbIds } = body;
    
    // 准备请求参数
    const curtime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    const salt = crypto.randomUUID(); // 随机字符串，使用 UUID
    
    // 确定正确的端点和使用的API密钥
    let endpoint = '';
    let apiKey = QANYTHING_CONFIG.appKey;
    let queryText = question || '';
    
    // 根据操作模式选择端点和API密钥
    if (mode === 'admin') {
      apiKey = QANYTHING_CONFIG.adminKey; // 使用管理秘钥
      
      // 根据管理操作类型选择端点
      switch (action) {
        case 'create_kb':
          if (!kbName) {
            return NextResponse.json({ error: '知识库名称不能为空' }, { status: 400 });
          }
          endpoint = '/q_anything/paas/create_kb';
          queryText = kbName;
          break;
          
        case 'delete_kb':
          if (!kbId) {
            return NextResponse.json({ error: '知识库ID不能为空' }, { status: 400 });
          }
          endpoint = '/q_anything/paas/delete_kb';
          queryText = kbId;
          break;
          
        case 'upload_url':
          if (!kbId || !fileUrl) {
            return NextResponse.json({ error: '知识库ID和文件URL不能为空' }, { status: 400 });
          }
          endpoint = '/q_anything/paas/upload_url';
          queryText = kbId;
          break;
          
        default:
          return NextResponse.json({ error: '不支持的管理操作' }, { status: 400 });
      }
    } else if (mode === 'agent_chat') {
      // Agent聊天模式
      if (!question || !uuid) {
        return NextResponse.json({ error: '问题和Agent UUID不能为空' }, { status: 400 });
      }
      endpoint = '/q_anything/api/bot/chat_stream';
      // 确保 q 参数使用问题内容，而不是 uuid
      queryText = question;
    } else {
      // 普通聊天模式
      if (!question) {
        return NextResponse.json({ error: '问题不能为空' }, { status: 400 });
      }
      endpoint = '/q_anything/paas/chat';
    }
    
    // 构建请求参数
    const requestData = {
      appKey: apiKey,
      q: queryText,
      curtime: curtime.toString(),
      salt: salt,
      sign: generateSign(apiKey, queryText, salt, curtime.toString()),
      signType: 'v3',
    };
    
    // 根据不同操作添加特定参数
    if (mode === 'chat') {
      // 聊天模式添加知识库ID - 使用 kb_id 而不是 kb_ids
      requestData.kb_id = QANYTHING_CONFIG.kbIds[0]; // 使用第一个知识库ID
    } else if (mode === 'admin') {
      // 管理模式根据操作类型添加参数
      if (action === 'upload_url') {
        requestData.url = fileUrl;
      }
    } else if (mode === 'agent_chat') {
      // Agent聊天模式添加uuid参数
      requestData.uuid = uuid;
      // 可能还需要添加其他必要参数
      requestData.stream = true; // 如果API需要stream参数
    }
    
    console.log(`发送请求到: ${QANYTHING_CONFIG.baseUrl}${endpoint}`);
    console.log('请求数据:', JSON.stringify(requestData));
    
    // 发送请求到 QAnything API
    const response = await fetch(`${QANYTHING_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('QAnything API 错误响应:', errorText);
      return NextResponse.json({ 
        error: `QAnything API 错误: ${response.status} ${errorText}`,
        requestData: requestData, // 在响应中包含请求数据以便调试
        endpoint: `${QANYTHING_CONFIG.baseUrl}${endpoint}` // 添加请求的端点
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('QAnything API 调用错误:', error);
    return NextResponse.json({ 
      error: '服务器内部错误', 
      details: error.message 
    }, { status: 500 });
  }
}

// 获取配置信息（不包含完整秘钥）
export async function GET() {
  return NextResponse.json({
    hasQuestionKey: !!QANYTHING_CONFIG.appKey,
    hasAdminKey: !!QANYTHING_CONFIG.adminKey,
    baseUrl: QANYTHING_CONFIG.baseUrl,
    kbIds: QANYTHING_CONFIG.kbIds
  });
}