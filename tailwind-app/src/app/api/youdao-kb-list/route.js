import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apikey = process.env.YOUDAO_API_KEY;
    
    if (!apikey) {
      return NextResponse.json({ error: '缺少 API Key 配置' }, { status: 500 });
    }

    console.log('使用的 API Key:', apikey.substring(0, 10) + '...');

    const res = await fetch('https://openapi.youdao.com/q_anything/api/kb_list', {
      headers: {
        Authorization: apikey,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    console.log('有道接口响应:', data);

    // 修正：errorCode 可能是字符串 '0' 或数字 0
    if (data.errorCode !== 0 && data.errorCode !== '0') {
      return NextResponse.json({ 
        error: data.msg || '获取知识库失败',
        errorCode: data.errorCode 
      }, { status: 400 });
    }

    return NextResponse.json(data.result || []);
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}