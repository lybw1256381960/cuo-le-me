// API 配置文件
// 根据环境自动切换 API 地址

const isDevelopment = import.meta.env.DEV;
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// 默认使用同源 API：
// - 本地开发：Express + Vite middleware，http://localhost:3000/api/*
// - 生产部署：Netlify 将 /api/* 代理到 Render 后端
// 如需绕过代理，可在构建环境中设置 VITE_API_BASE_URL。
export const API_BASE_URL = isDevelopment 
  ? configuredApiBaseUrl
  : configuredApiBaseUrl;

// 使用示例：
// import { API_BASE_URL } from './config/api';
// const res = await fetch(`${API_BASE_URL}/api/generate-weekly-report`, {...});

// Netlify 侧需要配置 /api/* rewrite/proxy 到后端服务。
