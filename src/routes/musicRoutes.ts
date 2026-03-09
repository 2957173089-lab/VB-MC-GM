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
    // 请求第三方 API 获取歌单详情
    const response = await fetch('https://api.injahow.cn/meting/?type=playlist&id=3778678');
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Meting API');
    }

    const data = await response.json();
    
    // 格式化数据，适配我们前端的 Song 接口
    // 为了保证加载速度，我们先只取前 20 首歌
    const formattedSongs = data.slice(0, 20).map((song: any) => ({
      id: String(song.id),
      title: song.name,
      artist: song.artist,
      coverUrl: song.pic,
      audioUrl: song.url,
      lrcUrl: song.lrc // 歌词链接
    }));

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
