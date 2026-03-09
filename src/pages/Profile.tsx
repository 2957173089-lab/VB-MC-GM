import { Settings, Heart, ListMusic, Clock, Play, ChevronLeft, List, MoreVertical, Search, ArrowDownUp, Shuffle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePlayer, Song } from '../store/PlayerContext';
import { useNavigate } from 'react-router-dom';

/**
 * 我的页 (Profile) -> 我喜欢的音乐
 */
export default function Profile() {
  const [likedSongsData, setLikedSongsData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong, currentSong, isPlaying, likedSongs } = usePlayer();
  const navigate = useNavigate();

  // 当 likedSongs 变化时，重新获取喜欢的歌曲列表
  useEffect(() => {
    fetch('/api/music/likes')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setLikedSongsData(data);
        }
      })
      .catch(err => console.error('获取喜欢列表失败:', err))
      .finally(() => setIsLoading(false));
  }, [likedSongs]);

  const handlePlaySong = (song: Song) => {
    playSong(song, likedSongsData);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e24] text-white overflow-y-auto no-scrollbar pb-24">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between p-4 shrink-0">
        <button className="text-zinc-300 hover:text-white" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-4">
          <button className="text-zinc-300 hover:text-white">
            <List size={24} />
          </button>
          <button className="text-zinc-300 hover:text-white">
            <MoreVertical size={24} />
          </button>
        </div>
      </header>

      {/* 封面区域 */}
      <div className="flex justify-center mt-2 mb-6 shrink-0 relative">
        <div className="w-48 h-48 rounded-2xl overflow-hidden relative z-10 shadow-2xl">
          {likedSongsData.length > 0 ? (
            <img src={likedSongsData[0].coverUrl} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Heart size={48} className="text-zinc-600" />
            </div>
          )}
        </div>
        {/* 装饰背景框 */}
        <div className="absolute top-2 w-44 h-44 rounded-2xl border-2 border-zinc-600/30 z-0 -rotate-6"></div>
        <div className="absolute top-4 w-40 h-40 rounded-2xl border-2 border-zinc-600/20 z-0 rotate-6"></div>
      </div>

      <div className="px-6 shrink-0">
        <h1 className="text-2xl font-bold mb-6">我喜欢的音乐</h1>

        {/* VIP 提示条 */}
        <div className="bg-zinc-800/80 rounded-xl p-3 flex items-center justify-between mb-6">
          <span className="text-sm text-zinc-300">含115首专享歌曲开通会员后畅听</span>
          <button className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">1元续费会员</button>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6 text-zinc-400">
            <button className="flex items-center gap-1 hover:text-white">
              <Heart size={20} /> <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white">
              <MessageCircle size={20} /> <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white">
              <Share2 size={20} /> <span className="text-xs">1</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <button className="hover:text-white"><Search size={20} /></button>
            <button className="hover:text-white"><ArrowDownUp size={20} /></button>
          </div>
        </div>

        {/* 播放按钮组 */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 bg-zinc-800/80 hover:bg-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Play size={20} fill="currentColor" />
            <span className="font-medium">播放全部</span>
            <span className="text-xs text-zinc-400">{likedSongsData.length}</span>
          </button>
          <button className="flex-1 bg-zinc-200 text-zinc-900 hover:bg-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Shuffle size={20} />
            <span className="font-medium">随机播放</span>
          </button>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="flex-1 px-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : likedSongsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
            <Heart size={48} className="mb-4 opacity-20" />
            <p className="text-sm">还没有喜欢的歌曲</p>
          </div>
        ) : (
          <div className="space-y-1">
            {likedSongsData.map((song, index) => {
              const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
              
              return (
                <div 
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="w-8 text-center text-sm text-zinc-500 font-mono">
                    {isCurrentPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-4">
                        <div className="w-1 bg-emerald-400 animate-[bounce_1s_infinite] h-full"></div>
                        <div className="w-1 bg-emerald-400 animate-[bounce_1s_infinite_0.2s] h-2/3"></div>
                        <div className="w-1 bg-emerald-400 animate-[bounce_1s_infinite_0.4s] h-4/5"></div>
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-medium truncate ${currentSong?.id === song.id ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VIP</span>
                      <p className="text-xs text-zinc-400 truncate">{song.artist} · {song.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-500">
                    <button className="hover:text-white"><Play size={20} /></button>
                    <button className="hover:text-white"><MoreVertical size={20} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 补充缺失的图标组件
function MessageCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
  );
}

function Share2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
  );
}
