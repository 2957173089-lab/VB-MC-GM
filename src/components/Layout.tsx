import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Disc3, Compass, PlayCircle, User } from 'lucide-react';
import MiniPlayer from './MiniPlayer';
import { usePlayer } from '../store/PlayerContext';

/**
 * 全局布局组件 (Layout)
 * 包含应用的主内容区域和底部毛玻璃导航栏 (Tab Bar)
 */
export default function Layout() {
  const { isImmersive } = usePlayer();

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col overflow-hidden font-sans">
      
      {/* 
        主内容区域 (Main Content)
        如果处于沉浸模式 (isImmersive)，则取消底部留白，让播放页全屏
      */}
      <main className={`flex-1 overflow-y-auto relative ${isImmersive ? '' : 'pb-20'}`}>
        <Outlet /> {/* 这里是子路由页面渲染的地方 */}
      </main>

      {/* 引入全局悬浮播放器 (沉浸模式下隐藏) */}
      {!isImmersive && <MiniPlayer />}

      {/* 
        底部导航栏 (Tab Bar)
        沉浸模式下自动隐藏
      */}
      {!isImmersive && (
        <nav className="fixed bottom-0 w-full h-20 bg-zinc-950/60 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-2 z-50 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
          <NavItem to="/" icon={<Disc3 size={24} />} label="模式" />
          <NavItem to="/discover" icon={<Compass size={24} />} label="发现" />
          <NavItem to="/player" icon={<PlayCircle size={24} />} label="播放" />
          <NavItem to="/profile" icon={<User size={24} />} label="我的" />
        </nav>
      )}
    </div>
  );
}

/**
 * 单个导航按钮组件 (NavItem)
 */
function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
          isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
