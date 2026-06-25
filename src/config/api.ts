// API 配置文件
// 根据环境自动切换 API 地址

const isDevelopment = import.meta.env.DEV;

// 开发环境：使用本地服务器
// 生产环境：使用 Netlify Functions（相对路径，无 CORS 问题）
export const API_BASE_URL = isDevelopment 
  ? ""  // 空字符串表示相对路径，指向本地服务器（localhost:3000）
  : "";  // 生产环境也使用相对路径，Netlify Functions 会自动处理

// 使用示例：
// import { API_BASE_URL } from './config/api';
// const res = await fetch(`${API_BASE_URL}/api/generate-weekly-report`, {...});

// ⚠️ 注意：Netlify Functions 的访问路径是：
// /.netlify/functions/generate-weekly-report
// 而不是 /api/generate-weekly-report
// 所以我们需要单独处理
