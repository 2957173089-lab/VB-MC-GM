import { createContext, useContext, useState, ReactNode } from 'react';

// 定义歌曲的数据结构
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

// 定义全局播放器状态的结构
interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isImmersive: boolean;
  togglePlay: () => void;
  playSong: (song: Song) => void;
  setIsImmersive: (val: boolean) => void;
  nextSong: () => void;
  prevSong: () => void;
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

  const currentSong = playlist[currentIndex] || null;

  // 切换播放/暂停的方法
  const togglePlay = () => setIsPlaying(!isPlaying);

  // 下一首
  const nextSong = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true); // 切歌后自动播放
  };

  // 上一首
  const prevSong = () => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const playSong = (song: Song) => {
    const index = playlist.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setPlaylist([song, ...playlist]);
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, isPlaying, isImmersive, 
      togglePlay, playSong, setIsImmersive, nextSong, prevSong 
    }}>
      {children}
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
