import { chatWithKnowledgeBaseStream } from '@/lib/youdao-api';

export async function POST(req) {
  try {
    const params = await req.json();
    const stream = await chatWithKnowledgeBaseStream(params);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('流式问答失败:', error);
    return new Response(JSON.stringify({ 
      error: '流式问答失败', 
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}