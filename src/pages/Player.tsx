import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Shuffle, Repeat, Repeat1, Maximize2, Minimize2, Heart, FolderPlus, X } from 'lucide-react';
import { usePlayer } from '../store/PlayerContext';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
  const { currentSong, isPlaying, togglePlay, isImmersive, setIsImmersive, nextSong, prevSong, progress, currentTime, duration, playMode, togglePlayMode } = usePlayer();
  const [lyricIndex, setLyricIndex] = useState(0);
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (showPlaylistModal && user) {
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      getDocs(q).then(snapshot => {
        setUserPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [showPlaylistModal, user]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user || !currentSong) return;
    try {
      await addDoc(collection(db, 'playlistSongs'), {
        playlistId,
        userId: user.uid,
        songId: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        coverUrl: currentSong.coverUrl,
        audioUrl: currentSong.audioUrl || '',
        addedAt: new Date().toISOString()
      });
      alert('已添加到歌单');
      setShowPlaylistModal(false);
    } catch (error) {
      console.error(error);
      alert('添加失败');
    }
  };

  useEffect(() => {
    const checkLiked = async () => {
      if (!user || !currentSong) return;
      const q = query(collection(db, 'likedSongs'), where('userId', '==', user.uid), where('songId', '==', currentSong.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsLiked(true);
        setLikeDocId(snapshot.docs[0].id);
      } else {
        setIsLiked(false);
        setLikeDocId(null);
      }
    };
    checkLiked();
  }, [user, currentSong]);

  useEffect(() => {
    const recordRecentSong = async () => {
      if (!user || !currentSong) return;
      try {
        const q = query(collection(db, 'recentSongs'), where('userId', '==', user.uid), where('songId', '==', currentSong.id));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await updateDoc(doc(db, 'recentSongs', docId), {
            playedAt: new Date().toISOString()
          });
        } else {
          await addDoc(collection(db, 'recentSongs'), {
            userId: user.uid,
            songId: currentSong.id,
            title: currentSong.title,
            artist: currentSong.artist,
            coverUrl: currentSong.coverUrl,
            audioUrl: currentSong.audioUrl || '',
            playedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Failed to record recent song", error);
      }
    };
    recordRecentSong();
  }, [currentSong, user]);

  const handleLike = async () => {
    if (!user) {
      alert("请先登录");
      return;
    }
    if (!currentSong) return;

    try {
      if (isLiked && likeDocId) {
        await deleteDoc(doc(db, 'likedSongs', likeDocId));
        setIsLiked(false);
        setLikeDocId(null);
      } else {
        const docRef = await addDoc(collection(db, 'likedSongs'), {
          userId: user.uid,
          songId: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          coverUrl: currentSong.coverUrl,
          audioUrl: currentSong.audioUrl || '',
          addedAt: new Date().toISOString()
        });
        setIsLiked(true);
        setLikeDocId(docRef.id);
      }
    } catch (error) {
      console.error("操作失败", error);
    }
  };

  const handleCollect = async () => {
    if (!user) {
      alert("请先登录");
      return;
    }
    if (!currentSong) return;

    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid), where('name', '==', '默认歌单'));
      const snapshot = await getDocs(q);
      let playlistId = '';

      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'playlists'), {
          userId: user.uid,
          name: '默认歌单',
          createdAt: new Date().toISOString()
        });
        playlistId = docRef.id;
      } else {
        playlistId = snapshot.docs[0].id;
      }

      const qSong = query(collection(db, 'playlistSongs'), where('playlistId', '==', playlistId), where('songId', '==', currentSong.id));
      const songSnapshot = await getDocs(qSong);
      if (!songSnapshot.empty) {
        alert('已在默认歌单中');
        return;
      }

      await addDoc(collection(db, 'playlistSongs'), {
        playlistId,
        userId: user.uid,
        songId: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        coverUrl: currentSong.coverUrl,
        audioUrl: currentSong.audioUrl || '',
        addedAt: new Date().toISOString()
      });
      alert('已收藏到默认歌单');
    } catch (error) {
      console.error(error);
      alert('收藏失败');
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLyricIndex((prev) => (prev + 1) % MOCK_LYRICS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentSong) return null;

  // 格式化时间 (例如 01:24)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
      <div className="w-full max-w-[360px] space-y-6 mb-2 z-10">
        
        {/* 互动按钮区 (喜欢、收藏等) */}
        <div className="flex items-center justify-between px-8 mb-2">
          <button onClick={handleLike} className="transition-colors active:scale-90">
            <Heart size={24} className={isLiked ? "text-red-500 fill-red-500" : "text-zinc-400 hover:text-white"} />
          </button>
          <button onClick={handleCollect} className="transition-colors active:scale-90">
            <FolderPlus size={24} className="text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
            <div className="h-full bg-emerald-400 rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 播放控制按钮 */}
        <div className="flex items-center justify-between px-4">
          <button onClick={togglePlayMode} className="text-zinc-400 hover:text-white transition-colors">
            {playMode === 'sequence' && <Repeat size={20} />}
            {playMode === 'loop' && <Repeat1 size={20} className="text-emerald-400" />}
            {playMode === 'shuffle' && <Shuffle size={20} />}
          </button>
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
      {/* 添加到歌单弹窗 */}
      <AnimatePresence>
        {showPlaylistModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowPlaylistModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">添加到歌单</h3>
                <button onClick={() => setShowPlaylistModal(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto hide-scrollbar">
                {userPlaylists.length > 0 ? userPlaylists.map(list => (
                  <div 
                    key={list.id} 
                    onClick={() => handleAddToPlaylist(list.id)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                      <ListMusic size={24} />
                    </div>
                    <div className="flex-1 border-b border-white/5 pb-3">
                      <p className="font-medium text-sm">{list.name}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-zinc-500 text-sm text-center py-4">暂无自建歌单，请先在“我的”页面创建</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
