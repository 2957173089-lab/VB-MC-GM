import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Shuffle, Maximize2, Minimize2 } from 'lucide-react';
import { usePlayer } from '../store/PlayerContext';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

const MOCK_LYRICS = [
  '还记得你说家是唯一的城堡',
  '随着稻香河流继续奔跑',
  '微微笑 小时候的梦我知道',
  '不要哭让萤火虫带着你逃跑',
  '乡间的歌谣永远的依靠',
  '回家吧 回到最初的美好',
];

/**
 * 播放页 (Player)
 * 支持 形态 A (驻留模式) 和 形态 B (沉浸式滑动模式)
 */
export default function Player() {
  const { currentSong, isPlaying, togglePlay, isImmersive, setIsImmersive, nextSong, prevSong } = usePlayer();
  const [lyricIndex, setLyricIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLyricIndex((prev) => (prev + 1) % MOCK_LYRICS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentSong) return null;

  // 处理手势滑动结束事件 (实现类似汽水音乐的上下滑动切歌)
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // 滑动超过 50px 触发切歌
    if (info.offset.y < -threshold) {
      nextSong(); // 上滑 -> 下一首
    } else if (info.offset.y > threshold) {
      prevSong(); // 下滑 -> 上一首
    }
  };

  return (
    <motion.div 
      className={`h-full flex flex-col items-center justify-between p-6 relative overflow-hidden ${isImmersive ? 'pt-safe' : 'pt-12'}`}
      // 开启垂直方向的拖拽手势
      drag="y"
      // 限制拖拽范围，松手后会自动回弹到原位
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
    >
      
      {/* 动态背景模糊 (根据封面图生成氛围感背景，带淡入淡出动画) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSong.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 blur-[100px] scale-150 pointer-events-none"
          style={{ backgroundImage: `url(${currentSong.coverUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        />
      </AnimatePresence>

      {/* 顶部信息与沉浸模式切换按钮 */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="w-8"></div> {/* 左侧占位，保持标题居中 */}
        <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase">
          {isImmersive ? '沉浸模式' : '正在播放'}
        </span>
        <button 
          onClick={() => setIsImmersive(!isImmersive)}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          {isImmersive ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* 封面区域 (毛玻璃唱片 UI，带弹性入场动画) */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={currentSong.id}
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`w-full aspect-square max-w-[380px] rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative z-10 transition-all duration-500 ${isImmersive ? 'scale-105 mt-8' : ''}`}
        >
          <div className={`w-64 h-64 rounded-full bg-zinc-900 border-[10px] border-zinc-800 shadow-inner z-10 flex items-center justify-center overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            <img src={currentSong.coverUrl} alt="cover" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
            <div className="absolute w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 歌曲信息与歌词预览 (带滑动切换动画) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSong.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full text-center space-y-2 z-10 mt-4"
        >
          <h2 className="text-2xl font-bold tracking-tight">{currentSong.title}</h2>
          <p className="text-zinc-400 text-sm">{currentSong.artist}</p>
          
          {/* 2行滚动高亮歌词 */}
          <div className="mt-6 h-16 flex flex-col items-center justify-center overflow-hidden mask-image-y relative">
            <motion.div
              animate={{ y: -lyricIndex * 32 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute top-4 w-full"
            >
              {MOCK_LYRICS.map((lyric, idx) => (
                <p 
                  key={idx} 
                  className={`h-8 flex items-center justify-center text-sm transition-colors duration-300 ${
                    idx === lyricIndex ? 'text-emerald-400 font-medium scale-110' : 'text-zinc-500'
                  }`}
                >
                  {lyric}
                </p>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 进度条与控制区 */}
      <div className="w-full max-w-[360px] space-y-8 mb-2 z-10">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
            <div className="h-full bg-emerald-400 w-1/3 rounded-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-1">
            <span>01:24</span>
            <span>03:45</span>
          </div>
        </div>

        {/* 播放控制按钮 */}
        <div className="flex items-center justify-between px-4">
          <button className="text-zinc-400 hover:text-white transition-colors"><Shuffle size={20} /></button>
          <button onClick={prevSong} className="text-zinc-100 hover:text-emerald-400 transition-colors active:scale-90"><SkipBack size={24} fill="currentColor" /></button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-emerald-400 text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
          
          <button onClick={nextSong} className="text-zinc-100 hover:text-emerald-400 transition-colors active:scale-90"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-zinc-400 hover:text-white transition-colors"><ListMusic size={20} /></button>
        </div>
      </div>
    </motion.div>
  );
}
