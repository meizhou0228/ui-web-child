import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

function checkStorage(): string | null {
  try {
    const k = '__ui_web_child_storage_test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return null;
  } catch {
    return '浏览器存储不可用，请打开 cookies / localStorage 后重试';
  }
}

const root = document.getElementById('root')!;
const err = checkStorage();
if (err) {
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:system-ui;">
      <div style="font-size:64px;">😢</div>
      <h1 style="margin-top:8px;">${err}</h1>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
