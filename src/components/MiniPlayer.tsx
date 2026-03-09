import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayer } from '../store/PlayerContext';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 全局悬浮播放器组件 (Mini Player)
 * 吸附在底部导航栏上方
 */
export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();

  // 如果当前没有歌曲，或者用户正在完整的“播放页 (/player)”，则隐藏悬浮播放器
  if (!currentSong || location.pathname === '/player') {
    return null;
  }

  return (
    <div 
      className="fixed bottom-20 left-0 w-full px-3 z-40 pb-safe cursor-pointer"
      onClick={() => navigate('/player')} // 点击卡片跳转到完整播放页
    >
      <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* 左侧：旋转的唱片封面 */}
        <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-700 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
          <img src={currentSong.coverUrl} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        
        {/* 中间：歌曲信息 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
          <p className="text-[10px] text-zinc-400 truncate">{currentSong.artist}</p>
        </div>

        {/* 右侧：控制按钮 */}
        <div className="flex items-center gap-3 pr-2">
          <button 
            className="text-white p-1 hover:scale-110 transition-transform active:scale-90"
            onClick={(e) => { 
              e.stopPropagation(); // 阻止事件冒泡，防止触发卡片的跳转
              togglePlay(); 
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button 
            className="text-zinc-400 hover:text-white p-1 hover:scale-110 transition-transform active:scale-90"
            onClick={(e) => { 
              e.stopPropagation(); 
              nextSong(); // 触发下一首
            }}
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
