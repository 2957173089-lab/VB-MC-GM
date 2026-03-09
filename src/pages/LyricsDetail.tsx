import { ChevronLeft, Share2, Search, Play, Pause, SkipBack, SkipForward, ListMusic, Repeat } from 'lucide-react';
import { usePlayer } from '../store/PlayerContext';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LyricsDetail() {
  const { 
    currentSong, isPlaying, togglePlay, nextSong, prevSong, 
    currentTime, duration, seekTo, lyrics, currentLyricIndex 
  } = usePlayer();
  const navigate = useNavigate();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动歌词
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex >= 0) {
      const container = lyricsContainerRef.current;
      const activeElement = container.children[currentLyricIndex] as HTMLElement;
      
      if (activeElement) {
        const scrollPosition = activeElement.offsetTop - container.clientHeight / 2 + activeElement.clientHeight / 2;
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentLyricIndex]);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = clickX / rect.width;
    seekTo(newPercent * duration);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e24] text-white overflow-hidden relative">
      {/* 动态背景模糊 */}
      <div 
        className="absolute inset-0 z-0 blur-[100px] scale-150 pointer-events-none opacity-40"
        style={{ backgroundImage: `url(${currentSong.coverUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      />

      {/* 顶部导航 */}
      <header className="flex items-center justify-between p-4 z-10 shrink-0">
        <button className="text-zinc-300 hover:text-white" onClick={() => navigate(-1)}>
          <ChevronLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">{currentSong.title}</span>
          <span className="text-xs text-zinc-400">{currentSong.artist}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-zinc-300 hover:text-white">
            <Search size={24} />
          </button>
          <button className="text-zinc-300 hover:text-white">
            <Share2 size={24} />
          </button>
        </div>
      </header>

      {/* 歌词滚动区域 */}
      <div 
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar mask-image-y scroll-smooth z-10 px-8"
      >
        {lyrics.length > 0 ? (
          <div className="py-[40vh] space-y-8">
            {lyrics.map((lyric, index) => (
              <p 
                key={index} 
                className={`text-2xl transition-all duration-300 text-center ${
                  index === currentLyricIndex 
                    ? 'text-white font-bold scale-110' 
                    : 'text-zinc-500/80 font-medium'
                }`}
              >
                {lyric.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-zinc-400 text-lg">暂无歌词</p>
          </div>
        )}
      </div>

      {/* 底部控制区 */}
      <div className="px-6 pb-8 pt-4 z-10 shrink-0 bg-gradient-to-t from-[#1e1e24] via-[#1e1e24]/80 to-transparent">
        {/* 进度条 */}
        <div className="space-y-2 mb-6">
          <div 
            className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full relative transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"></div>
            </div>
          </div>
        </div>

        {/* 播放控制按钮 */}
        <div className="flex items-center justify-between px-2">
          <button className="text-zinc-400 hover:text-white transition-colors"><Repeat size={24} /></button>
          <button onClick={prevSong} className="text-zinc-100 hover:text-emerald-400 transition-colors active:scale-90"><SkipBack size={28} fill="currentColor" /></button>
          
          <button 
            onClick={togglePlay}
            className="text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause size={56} fill="currentColor" />
            ) : (
              <Play size={56} fill="currentColor" className="ml-1" />
            )}
          </button>
          
          <button onClick={nextSong} className="text-zinc-100 hover:text-emerald-400 transition-colors active:scale-90"><SkipForward size={28} fill="currentColor" /></button>
          <button className="text-zinc-400 hover:text-white transition-colors"><ListMusic size={24} /></button>
        </div>
      </div>
    </div>
  );
}
