const errorCodeMap = {
  101: '缺少必填参数，请检查参数填写。',
  104: '不支持的API类型。',
  105: '不支持的签名类型。',
  106: '不支持的响应类型。',
  108: 'key使用错误，请检查API Key。',
  110: '应用未绑定服务，请在控制台绑定。',
  111: '开发者账号无效。',
  202: '签名校验失败，请检查密钥和编码。',
  203: '访问IP不在白名单。',
  205: '接口与应用平台类型不一致。',
  206: '时间戳无效导致签名校验失败。',
  207: '重放请求。',
  303: '服务端异常，请稍后重试。',
  401: '账户欠费停用。',
  405: '鉴权失败。',
  406: '登陆失败。',
  QA10001: '请求api失败。',
  QA10002: '知识库ID错误。',
  QA10003: '文件上传额度超限。',
  QA10004: '文件上传过大。',
  QA10005: '不支持的文件格式。',
  QA10006: 'fileId错误。',
  QA10007: 'url格式错误。',
  QA10008: '获取url资源失败。',
  QA21003: '对应FAQ不存在。',
};

export function getErrorMessage(errorCode) {
  return errorCodeMap[errorCode] || '未知错误，请稍后重试。';
}

export async function getKnowledgeBaseList() {
  const apikey = process.env.YOUDAO_API_KEY;
  const res = await fetch('https://openapi.youdao.com/q_anything/api/kb_list', {
    headers: {
      Authorization: apikey || '',
    },
    cache: 'no-store',
  });
  const json = await res.json();
  console.log('有道接口原始响应:', json);
  if (!res.ok || json.errorCode !== 0) throw new Error(json.msg || '获取知识库失败');
  return json.result;
}

export async function chatWithKnowledgeBaseStream(params) {
  const apikey = process.env.YOUDAO_API_KEY;
  const res = await fetch('https://openapi.youdao.com/q_anything/api/chat_stream', {
    method: 'POST',
    headers: {
      Authorization: apikey || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      prompt: params.prompt ?? '',
      history: params.history ?? [],
      model: params.model ?? 'QAnything 4o mini',
      maxToken: params.maxToken ?? 1024,
      hybridSearch: params.hybridSearch ?? false,
      networking: params.networking ?? true,
      sourceNeeded: params.sourceNeeded ?? true,
    }),
  });
  if (!res.ok || !res.body) throw new Error('流式问答接口请求失败');
  return res.body; // 返回 ReadableStream
}