import { usePlayer } from '../store/PlayerContext';
import { useNavigate } from 'react-router-dom';

export default function Modes() {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  const handleModeClick = async (term: string) => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=20`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const songs = data.results.filter((item: any) => item.previewUrl).map((item: any) => ({
          id: item.trackId.toString(),
          title: item.trackName,
          artist: item.artistName,
          coverUrl: item.artworkUrl100.replace('100x100', '600x600'),
          audioUrl: item.previewUrl,
        }));
        if (songs.length > 0) {
          playSong(songs[0], songs);
          navigate('/player');
        } else {
          alert('未找到可播放的歌曲');
        }
      }
    } catch (error) {
      console.error("Failed to fetch mode songs", error);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">VIBE 模式</h1>
        <p className="text-zinc-400 mt-2 text-sm">选择你当下的心情与场景</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <ModeCard title="默认模式" subtitle="猜你喜欢" color="from-emerald-500/20 to-emerald-900/20" onClick={() => handleModeClick('pop')} />
        <ModeCard title="熟悉模式" subtitle="常听老歌" color="from-blue-500/20 to-blue-900/20" onClick={() => handleModeClick('classic')} />
        <ModeCard title="新鲜模式" subtitle="探索未知" color="from-purple-500/20 to-purple-900/20" onClick={() => handleModeClick('indie')} />
        <ModeCard title="深夜 Emo" subtitle="网抑云时间" color="from-indigo-500/20 to-indigo-900/20" onClick={() => handleModeClick('sad')} />
      </div>
    </div>
  );
}

function ModeCard({ title, subtitle, color, onClick }: { title: string; subtitle: string; color: string, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`aspect-square rounded-2xl p-4 flex flex-col justify-end bg-gradient-to-br ${color} border border-white/5 backdrop-blur-sm active:scale-95 transition-transform cursor-pointer`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
    </div>
  );
}
