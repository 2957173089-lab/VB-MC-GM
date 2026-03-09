import { useState } from 'react';
import { Search, Play } from 'lucide-react';
import { usePlayer, MOCK_PLAYLIST } from '../store/PlayerContext';

/**
 * 发现页 (Discover)
 * 展示分类（抖音爆火、轻音乐、励志歌曲等）。
 */
export default function Discover() {
  const [query, setQuery] = useState('');
  const { playSong } = usePlayer();

  const searchResults = query.trim() === '' ? [] : MOCK_PLAYLIST.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">发现</h1>
        <p className="text-zinc-400 mt-2 text-sm">探索全网热门与精选歌单</p>
      </header>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-3 flex items-center gap-3 focus-within:bg-white/15 focus-within:border-emerald-400/50 transition-colors shadow-lg">
          <Search size={20} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="搜索歌曲、歌手、歌单..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.trim() !== '' ? (
        <div className="space-y-4 overflow-y-auto pb-20 hide-scrollbar">
          <h2 className="text-lg font-semibold mb-3">搜索结果</h2>
          {searchResults.length > 0 ? (
            searchResults.map(song => (
              <div 
                key={song.id} 
                onClick={() => playSong(song)} 
                className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/30 border border-white/5 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">{song.title}</h3>
                  <p className="text-zinc-400 text-xs mt-1">{song.artist}</p>
                </div>
                <Play size={20} className="text-zinc-500" />
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-center py-8 text-sm">未找到相关歌曲</p>
          )}
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pb-20 hide-scrollbar">
          <section>
            <h2 className="text-lg font-semibold mb-3">热门榜单</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {/* 横向滚动的卡片 */}
              <div className="min-w-[140px] h-[140px] rounded-xl bg-zinc-800/50 border border-white/5 snap-start flex items-center justify-center">抖音爆火</div>
              <div className="min-w-[140px] h-[140px] rounded-xl bg-zinc-800/50 border border-white/5 snap-start flex items-center justify-center">云音乐热歌</div>
              <div className="min-w-[140px] h-[140px] rounded-xl bg-zinc-800/50 border border-white/5 snap-start flex items-center justify-center">新歌榜</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">场景分类</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center px-4">轻音乐</div>
              <div className="h-16 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center px-4">励志</div>
              <div className="h-16 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center px-4">学习白噪音</div>
              <div className="h-16 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center px-4">运动燃曲</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
