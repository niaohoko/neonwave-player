const REQUIRED_FIELDS = ['id', 'title', 'artist', 'cover', 'src', 'format'];
const SUPPORTED_FORMATS = new Set(['MP3', 'WAV', 'OGG']);

export class PlaylistDataManager {
  constructor(url = 'data/playlist.json') {
    this.url = url;
  }

  async load() {
    let response;
    try {
      response = await fetch(this.url);
    } catch {
      throw new Error('无法读取播放列表，请检查网络连接后重试。');
    }
    if (!response.ok) throw new Error(`播放列表加载失败（${response.status}）。`);

    let records;
    try { records = await response.json(); } catch { throw new Error('播放列表格式无效。'); }
    if (!Array.isArray(records) || !records.length) throw new Error('播放列表中没有可播放的歌曲。');

    return records.map((track, index) => this.normalize(track, index));
  }

  normalize(track, index) {
    const missing = REQUIRED_FIELDS.filter((field) => !track[field]);
    if (missing.length) throw new Error(`第 ${index + 1} 首歌曲缺少：${missing.join('、')}。`);
    const format = String(track.format).toUpperCase();
    if (!SUPPORTED_FORMATS.has(format)) throw new Error(`第 ${index + 1} 首歌曲格式不受支持：${format}。`);
    return { ...track, id: String(track.id), format, title: String(track.title), artist: String(track.artist) };
  }
}
