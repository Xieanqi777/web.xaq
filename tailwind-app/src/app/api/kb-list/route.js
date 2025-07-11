import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apikey = process.env.YOUDAO_API_KEY;
    
    if (!apikey) {
      return NextResponse.json({ error: '缺少 API Key 配置' }, { status: 500 });
    }

    const res = await fetch('https://openapi.youdao.com/q_anything/api/kb_list', {
      headers: {
        Authorization: apikey,
      },
      cache: 'no-store',
    });
    
    const json = await res.json();
    console.log('有道接口原始响应:', json);
    
    if (!res.ok || json.errorCode !== 0) {
      return NextResponse.json({ 
        error: json.msg || '获取知识库失败', 
        details: json.errorCode 
      }, { status: 500 });
    }
    
    return NextResponse.json(json.result);
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    return NextResponse.json({ 
      error: '获取知识库列表失败', 
      details: error.message 
    }, { status: 500 });
  }
}