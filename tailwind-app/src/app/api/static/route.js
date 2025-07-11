import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const rootDir = path.resolve(__dirname, '../../../../../');

export async function GET(request) {
  try {
    // 从URL中获取文件路径
    const url = new URL(request.url);
    const urlPath = url.pathname;
    const searchParams = url.searchParams;
    
    // 获取path参数
    let filePath = searchParams.get('path');
    console.log('Path param:', filePath);
    
    if (!filePath) {
      // 如果没有path参数，尝试从URL路径中提取
      const match = urlPath.match(/\/api\/static\/(.+)/) || urlPath.match(/\/practice\/(.+)/) || urlPath.match(/\/images\/(.+)/);
      if (match && match[1]) {
        // 根据URL路径确定前缀
        if (urlPath.includes('/practice/')) {
          filePath = 'practice/' + match[1];
        } else if (urlPath.includes('/images/')) {
          filePath = 'images/' + match[1];
        } else {
          filePath = match[1];
        }
        console.log('Extracted from URL path:', filePath);
      } else {
        return new NextResponse('File path is required', { status: 400 });
      }
    }
    
    // 处理路径中的占位符
    if (filePath && filePath.includes(':path*')) {
      // 从URL路径中提取实际路径部分
      const pathMatch = urlPath.match(/\/practice\/(.+)/) || urlPath.match(/\/images\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        filePath = filePath.replace(':path*', pathMatch[1]);
      }
    }
    
    // 处理practice/前缀
    if (filePath.startsWith('practice/')) {
      console.log('Found practice/ prefix');
    } else if (urlPath.includes('/practice/')) {
      // 如果URL包含/practice/但filePath不以practice/开头，添加前缀
      const practiceMatch = urlPath.match(/\/practice\/(.+)/);
      if (practiceMatch && practiceMatch[1]) {
        filePath = 'practice/' + practiceMatch[1];
        console.log('Added practice/ prefix:', filePath);
      }
    }
    
    // 构建完整的文件路径
    const fullPath = path.join(rootDir, filePath);
    console.log('Full path:', fullPath);
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return new NextResponse(`File not found: ${filePath}`, { status: 404 });
    }
    
    // 根据文件扩展名设置Content-Type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'text/plain';
    
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    // 判断是否为二进制文件
    const isBinary = [
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', 
      '.woff', '.woff2', '.ttf', '.eot'
    ].includes(ext);
    
    let fileContent;
    if (isBinary) {
      // 二进制文件使用Buffer读取
      fileContent = fs.readFileSync(fullPath);
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } else {
      // 文本文件使用utf8编码读取
      fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // 如果是HTML文件，处理其中的相对路径
      if (ext === '.html') {
        // 获取文件所在目录的相对路径
        const fileDir = path.dirname(filePath);
        
        // 替换图片和CSS的相对路径
        fileContent = fileContent.replace(
          /(src|href)=(["'])(?!http|\/\/|\/)([^"']*?)(["'])/g,
          (match, attr, quote, relativePath, endQuote) => {
            // 构建新的路径
            return `${attr}=${quote}/api/static?path=${fileDir}/${relativePath}${endQuote}`;
          }
        );
      }
      
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': contentType,
        },
      });
    }
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}