import { useState, useEffect } from 'react';
import { Settings, Heart, ListMusic, Clock, Plus, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { usePlayer, Song } from '../store/PlayerContext';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const { playSong } = usePlayer();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [recentSongs, setRecentSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!user) {
      setLikedSongs([]);
      setPlaylists([]);
      setRecentSongs([]);
      return;
    }

    // 监听喜欢的歌曲
    const qLiked = query(collection(db, 'likedSongs'), where('userId', '==', user.uid));
    const unsubLiked = onSnapshot(qLiked, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLikedSongs(songs);
    });

    // 监听歌单
    const qPlaylists = query(collection(db, 'playlists'), where('userId', '==', user.uid));
    const unsubPlaylists = onSnapshot(qPlaylists, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPlaylists(lists);
    });

    // 监听最近播放
    const qRecent = query(collection(db, 'recentSongs'), where('userId', '==', user.uid));
    const unsubRecent = onSnapshot(qRecent, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      songs.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
      setRecentSongs(songs);
    });

    return () => {
      unsubLiked();
      unsubPlaylists();
      unsubRecent();
    };
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;
    try {
      await addDoc(collection(db, 'playlists'), {
        userId: user.uid,
        name: newPlaylistName.trim(),
        createdAt: new Date().toISOString()
      });
      setNewPlaylistName('');
      setShowNewPlaylist(false);
    } catch (error) {
      console.error("创建歌单失败", error);
    }
  };
  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  const handlePlayPlaylist = async (playlistId: string) => {
    const q = query(collection(db, 'playlistSongs'), where('playlistId', '==', playlistId));
    const snapshot = await getDocs(q);
    const songs = snapshot.docs.map(doc => doc.data() as Song);
    if (songs.length > 0) {
      playSong(songs[0], songs);
    } else {
      alert('歌单为空');
    }
  };

  const handlePlayRecentSongs = () => {
    if (recentSongs.length > 0) {
      playSong(recentSongs[0], recentSongs);
    } else {
      alert('暂无最近播放记录');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto pb-20 hide-scrollbar">
      {/* 顶部用户信息 */}
      <header className="flex items-center justify-between mt-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-zinc-950 flex items-center justify-center text-xl font-bold overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{user ? user.displayName?.charAt(0) || 'U' : 'V'}</span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">{user ? user.displayName || 'User' : '未登录'}</h1>
            <p className="text-xs text-zinc-400 mt-1">{user ? user.email : '点击登录体验完整功能'}</p>
          </div>
        </div>
        {user ? (
          <button onClick={logout} className="w-10 h-10 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white">
            <LogOut size={20} />
          </button>
        ) : (
          <button onClick={login} className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30">
            <LogIn size={20} />
          </button>
        )}
      </header>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div onClick={handlePlayLikedSongs} className="p-4 rounded-2xl bg-zinc-800/30 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <p className="font-medium text-sm">我喜欢的</p>
            <p className="text-xs text-zinc-500">{likedSongs.length} 首</p>
          </div>
        </div>
        <div onClick={handlePlayRecentSongs} className="p-4 rounded-2xl bg-zinc-800/30 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-medium text-sm">最近播放</p>
            <p className="text-xs text-zinc-500">{recentSongs.length} 首</p>
          </div>
        </div>
      </div>

      {/* 我的歌单 */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">自建歌单</h2>
          <button onClick={() => setShowNewPlaylist(true)} className="text-xs text-emerald-400 flex items-center gap-1">
            <Plus size={14} /> 新建
          </button>
        </div>
        
        {showNewPlaylist && (
          <div className="mb-4 flex gap-2">
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="输入歌单名称" 
              className="flex-1 bg-zinc-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
            />
            <button onClick={handleCreatePlaylist} className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium">创建</button>
            <button onClick={() => setShowNewPlaylist(false)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">取消</button>
          </div>
        )}

        <div className="space-y-3">
          {playlists.length > 0 ? playlists.map(list => (
            <div key={list.id} onClick={() => handlePlayPlaylist(list.id)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                <ListMusic size={24} />
              </div>
              <div className="flex-1 border-b border-white/5 pb-3">
                <p className="font-medium text-sm">{list.name}</p>
                <p className="text-xs text-zinc-500 mt-1">创建于 {new Date(list.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <p className="text-zinc-500 text-sm py-4 text-center">暂无自建歌单</p>
          )}
        </div>
      </section>
    </div>
  );
}
