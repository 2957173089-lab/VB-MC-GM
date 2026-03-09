export interface ParsedLyric {
  time: number; // 歌词出现的时间 (秒)
  text: string; // 歌词文本
}

/**
 * 解析 LRC 格式的歌词文本
 * @param lrcText LRC 格式的字符串，例如 "[00:12.34]这是一句歌词"
 * @returns ParsedLyric 数组
 */
export function parseLrc(lrcText: string): ParsedLyric[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const parsedLyrics: ParsedLyric[] = [];

  // 匹配时间标签的正则表达式，例如 [00:12.34] 或 [00:12.345] 或 [00:12]
  const timeRegExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    // 提取当前行的所有时间标签
    const timeMatches = [...line.matchAll(timeRegExp)];
    
    // 如果没有时间标签，跳过这一行
    if (timeMatches.length === 0) continue;

    // 提取歌词文本 (去掉所有时间标签后的剩余部分)
    const text = line.replace(timeRegExp, '').trim();
    
    // 如果歌词为空，也跳过 (可选，有时空行用于占位)
    if (!text) continue;

    // 遍历当前行的所有时间标签 (一行可能有多个时间标签，例如副歌重复)
    for (const match of timeMatches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0; // 补齐到3位毫秒

      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;

      parsedLyrics.push({
        time: timeInSeconds,
        text: text
      });
    }
  }

  // 按照时间顺序对歌词进行排序
  parsedLyrics.sort((a, b) => a.time - b.time);

  return parsedLyrics;
}
