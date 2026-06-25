// API 配置文件
// 根据环境自动切换 API 地址

const isDevelopment = import.meta.env.DEV;

// 开发环境：使用本地服务器
// 生产环境：使用 Render 后端
export const API_BASE_URL = isDevelopment 
  ? ""  // 空字符串表示相对路径，指向本地服务器（localhost:3000）
  : "https://cuo-le-me-api.onrender.com";  // Render 后端域名

// 使用示例：
// import { API_BASE_URL } from './config/api';
// const res = await fetch(`${API_BASE_URL}/api/generate-weekly-report`, {...});
