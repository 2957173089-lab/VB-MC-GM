import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

// 定义歌曲的数据结构
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string; // 新增音频链接
}

export type PlayMode = 'sequence' | 'loop' | 'shuffle';

// 定义全局播放器状态的结构
interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isImmersive: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  playMode: PlayMode;
  togglePlay: () => void;
  playSong: (song: Song, newPlaylist?: Song[]) => void;
  setIsImmersive: (val: boolean) => void;
  nextSong: () => void;
  prevSong: () => void;
  togglePlayMode: () => void;
}

// 模拟一个播放列表
export const MOCK_PLAYLIST: Song[] = [
  { id: '1', title: 'Nightfall Vibe', artist: 'VIBE Original', coverUrl: 'https://picsum.photos/seed/vibe1/400/400' },
  { id: '2', title: 'Neon City', artist: 'Synthwave Boy', coverUrl: 'https://picsum.photos/seed/vibe2/400/400' },
  { id: '3', title: 'Chill Lo-Fi', artist: 'Study Girl', coverUrl: 'https://picsum.photos/seed/vibe3/400/400' },
  { id: '4', title: 'Acoustic Morning', artist: 'The Woods', coverUrl: 'https://picsum.photos/seed/vibe4/400/400' },
  { id: '5', title: '稻香', artist: '周杰伦', coverUrl: 'https://picsum.photos/seed/jay1/400/400' },
  { id: '6', title: '夜曲', artist: '周杰伦', coverUrl: 'https://picsum.photos/seed/jay2/400/400' },
  { id: '7', title: '七里香', artist: '周杰伦', coverUrl: 'https://picsum.photos/seed/jay3/400/400' },
  { id: '8', title: '晴天', artist: '周杰伦', coverUrl: 'https://picsum.photos/seed/jay4/400/400' },
];

// 创建 Context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// 提供者组件 (包裹在 App 最外层)
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Song[]>(MOCK_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 播放状态 (默认暂停)
  const [isPlaying, setIsPlaying] = useState(false);
  // 沉浸模式状态 (默认关闭)
  const [isImmersive, setIsImmersive] = useState(false);
  
  // 播放模式
  const [playMode, setPlayMode] = useState<PlayMode>('sequence');
  
  // 进度条相关状态
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = playlist[currentIndex] || null;

  // 监听播放状态和当前歌曲变化
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong?.audioUrl) {
        audioRef.current.play().catch(e => {
          console.error("播放失败:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // 更新进度条
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(total);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  // 切换播放/暂停的方法
  const togglePlay = () => {
    if (!currentSong?.audioUrl && !isPlaying) {
      alert("该歌曲暂无试听音频，请尝试搜索其他歌曲");
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // 下一首
  const nextSong = () => {
    if (playMode === 'shuffle') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else if (playMode === 'loop') {
      // 单曲循环，重置进度
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
    setIsPlaying(true); // 切歌后自动播放
  };

  // 上一首
  const prevSong = () => {
    if (playMode === 'shuffle') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else if (playMode === 'loop') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
    setIsPlaying(true);
  };

  const togglePlayMode = () => {
    const modes: PlayMode[] = ['sequence', 'loop', 'shuffle'];
    const nextIndex = (modes.indexOf(playMode) + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  const playSong = (song: Song, newPlaylist?: Song[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      const index = newPlaylist.findIndex(s => s.id === song.id);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      const index = playlist.findIndex(s => s.id === song.id);
      if (index !== -1) {
        setCurrentIndex(index);
      } else {
        setPlaylist([song, ...playlist]);
        setCurrentIndex(0);
      }
    }
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, isPlaying, isImmersive, progress, currentTime, duration, playMode,
      togglePlay, playSong, setIsImmersive, nextSong, prevSong, togglePlayMode 
    }}>
      {children}
      <audio 
        ref={audioRef} 
        src={currentSong?.audioUrl?.replace('http://', 'https://')} 
        onEnded={nextSong}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
      />
    </PlayerContext.Provider>
  );
}

// 自定义 Hook，方便在其他组件中获取播放器状态
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer 必须在 PlayerProvider 内部使用');
  }
  return context;
}
