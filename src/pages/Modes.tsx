import { Plus } from 'lucide-react';

/**
 * 模式页 (Modes)
 */
export default function Modes() {
  return (
    <div className="p-6 h-full flex flex-col bg-[#4a5559] text-white overflow-y-auto no-scrollbar pb-24">
      <header className="mb-6 mt-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">听歌模式</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-zinc-300 text-xs">升级会员，推荐更...</span>
            <button className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">1元续费 &gt;</button>
            <span className="text-zinc-300 text-xs">双人一起听</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-bold">
            癸
          </div>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Plus size={16} />
          </button>
        </div>
      </header>

      <div className="space-y-3 mb-6">
        <button className="w-full py-4 rounded-xl bg-white/10 text-center font-medium text-lg active:scale-95 transition-transform">
          默认模式
        </button>
        <button className="w-full py-4 rounded-xl bg-white text-zinc-900 text-center font-medium text-lg active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2">
          <span className="w-1 h-3 bg-zinc-900 rounded-full"></span>
          <span className="w-1 h-4 bg-zinc-900 rounded-full"></span>
          <span className="w-1 h-2 bg-zinc-900 rounded-full"></span>
          熟悉模式
        </button>
        <button className="w-full py-4 rounded-xl bg-white/10 text-center font-medium text-lg active:scale-95 transition-transform">
          新鲜模式
        </button>
      </div>

      <div className="grid grid-cols-3 gap-y-6 gap-x-4">
        <ModeIcon icon="🏃" label="动感健身" />
        <ModeIcon icon="🎧" label="DJ模式" />
        <ModeIcon icon="☹️" label="深夜 EMO" />
        <ModeIcon icon="📚" label="图书馆" />
        <ModeIcon icon="🌙" label="助眠模式" />
        <ModeIcon icon="🎵" label="抖音漫游" />
        <ModeIcon icon="🛁" label="洗澡" />
        <ModeIcon icon="🍃" label="Chill 放松" />
        <ModeIcon icon="😊" label="快乐时光" />
        <ModeIcon icon="🎛️" label="电音" />
        <ModeIcon icon="▶️" label="音乐视频" />
        <ModeIcon icon="🐉" label="春节模式" />
        <ModeIcon icon="🗣️" label="粤语" />
        <ModeIcon icon="🚌" label="通勤必听" />
        <ModeIcon icon="💔" label="失恋必听" />
      </div>
    </div>
  );
}

function ModeIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
      <div className="text-2xl">{icon}</div>
      <span className="text-xs text-zinc-200">{label}</span>
    </div>
  );
}
