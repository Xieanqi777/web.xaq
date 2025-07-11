import { NextRequest } from 'next/server';

export async function POST(req) {
  try {
    const apikey = process.env.YOUDAO_API_KEY;
    
    if (!apikey) {
      return new Response(JSON.stringify({ error: '缺少 API Key 配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { question, kbIds, history = [] } = body;

    if (!question || !kbIds || !Array.isArray(kbIds)) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 简化历史记录格式，只保留最近2轮对话
    const formattedHistory = history
      .filter(item => 
        item != null && typeof item === 'object' && 
        'question' in item && 'response' in item &&
        typeof item.question === 'string' && 
        typeof item.response === 'string' &&
        item.question.trim() !== '' &&
        item.response.trim() !== ''
      )
      .slice(-2); // 只保留最近2轮对话

    // 简化请求体，只保留必需参数
    const requestBody = {
      question: question.trim(),
      kbIds,
      history: formattedHistory,
    };

    console.log('发送聊天请求:', { 
      question: requestBody.question, 
      kbIds: kbIds.length, 
      historyCount: formattedHistory.length 
    });

    const res = await fetch('https://openapi.youdao.com/q_anything/api/chat_stream', {
      method: 'POST',
      headers: {
        Authorization: apikey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('有道接口响应状态:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('聊天接口错误响应:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('解析后的错误:', errorData);
        return new Response(JSON.stringify({ 
          error: errorData.msg || '聊天请求失败',
          errorCode: errorData.errorCode 
        }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch {
        return new Response(JSON.stringify({ 
          error: '聊天请求失败',
          details: errorText 
        }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 返回流式响应
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('聊天接口错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}