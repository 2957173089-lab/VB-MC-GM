import { Play, Pause, X, SkipForward } from 'lucide-react';
import { usePlayer } from '../store/PlayerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * 全局悬浮播放器组件 (Mini Player)
 * 吸附在右侧边缘
 */
export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // 如果当前没有歌曲，或者用户正在完整的“播放页 (/player)”，或者被手动关闭，则隐藏悬浮播放器
  if (!currentSong || location.pathname === '/player' || location.pathname === '/lyrics' || !isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed right-0 bottom-32 z-50 flex items-center bg-zinc-800/90 backdrop-blur-md rounded-l-full shadow-lg cursor-pointer transition-transform hover:scale-105 border border-white/10 p-1 pr-2 gap-2"
      onClick={() => navigate('/player')}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-700">
        <img 
          src={currentSong.coverUrl} 
          alt={currentSong.title} 
          className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} 
          referrerPolicy="no-referrer" 
        />
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            nextSong();
          }}
        >
          <SkipForward size={16} fill="currentColor" />
        </button>
        
        <button 
          className="w-6 h-6 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors ml-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
