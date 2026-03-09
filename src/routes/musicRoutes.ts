import express from 'express';
import { getDb } from '../db';

const router = express.Router();

/**
 * 获取网易云音乐热歌榜 (作为推荐列表)
 * 使用 Meting API: https://api.injahow.cn/meting/?type=playlist&id=3778678
 * 3778678 是网易云音乐的热歌榜 ID
 */
router.get('/recommendations', async (req, res) => {
  try {
    // 尝试第一个音乐 API
    let response = await fetch('https://api.music.areschang.top/search?keyword=热门&limit=20');

    if (!response.ok) {
      // 如果第一个 API 失败，尝试第二个 API
      response = await fetch('http://iwenwiki.com:3000/search?keywords=热门&limit=20');
    }
    
    if (!response.ok) {
      throw new Error('All music APIs failed');
    }

    const data = await response.json();
    
    // 格式化数据，适配我们前端的 Song 接口
    let formattedSongs = [];

    // 根据不同 API 的数据结构进行处理
    if (data.result && data.result.songs) {
      // iwenwiki API 格式
      formattedSongs = data.result.songs.slice(0, 20).map((song: any) => ({
        id: String(song.id),
        title: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || '未知歌手',
        coverUrl: song.album?.picUrl || `https://picsum.photos/seed/${song.id}/400/400`,
        audioUrl: song.mp3Url || `https://music.areschang.top/url?id=${song.id}`
      }));
    } else if (Array.isArray(data)) {
      // areschang API 格式
      formattedSongs = data.slice(0, 20).map((song: any) => ({
        id: String(song.id),
        title: song.title || song.name,
        artist: song.artist || song.author || '未知歌手',
        coverUrl: song.cover || song.pic || `https://picsum.photos/seed/${song.id}/400/400`,
        audioUrl: song.url || song.mp3Url || `https://music.areschang.top/url?id=${song.id}`
      }));
    }

    res.json(formattedSongs);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // 如果第三方 API 挂了，返回降级数据保证页面不崩溃
    res.status(500).json([
      { 
        id: 'fallback-1', 
        title: 'API 请求失败', 
        artist: '请检查网络或稍后再试', 
        coverUrl: 'https://picsum.photos/seed/error/400/400',
        audioUrl: '' 
      }
    ]);
  }
});

// 获取喜欢的歌曲列表
router.get('/likes', async (req, res) => {
  try {
    const db = await getDb();
    const likes = await db.all('SELECT * FROM likes ORDER BY createdAt DESC');
    res.json(likes);
  } catch (error) {
    console.error('获取喜欢列表失败:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// 添加喜欢的歌曲
router.post('/likes', async (req, res) => {
  try {
    const { id, title, artist, coverUrl, audioUrl, lrcUrl } = req.body;
    if (!id || !title || !artist || !coverUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    await db.run(
      `INSERT OR REPLACE INTO likes (id, title, artist, coverUrl, audioUrl, lrcUrl) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, artist, coverUrl, audioUrl, lrcUrl]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('添加喜欢失败:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

// 取消喜欢
router.delete('/likes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM likes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('取消喜欢失败:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

export default router;
