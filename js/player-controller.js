export const PLAY_MODES = {
  LOOP: { id: 'loop', label: '列表循环', icon: '↻' },
  ONE: { id: 'one', label: '单曲循环', icon: '↻¹' },
  SHUFFLE: { id: 'shuffle', label: '随机播放', icon: '⤨' }
};

export class PlayerController extends EventTarget {
  constructor(audio) {
    super();
    this.audio = audio;
    this.tracks = [];
    this.index = 0;
    this.mode = PLAY_MODES.LOOP;
    this.bindAudioEvents();
  }

  bindAudioEvents() {
    ['timeupdate', 'loadedmetadata', 'durationchange', 'waiting', 'canplay', 'play', 'pause', 'volumechange'].forEach((event) =>
      this.audio.addEventListener(event, () => this.emit(event))
    );
    this.audio.addEventListener('ended', () => this.handleEnded());
    this.audio.addEventListener('error', () => this.emit('error', { message: '音频加载或解码失败，请尝试切换其他歌曲。' }));
  }

  setTracks(tracks) { this.tracks = tracks; this.load(0); }
  get currentTrack() { return this.tracks[this.index]; }
  get isPlaying() { return !this.audio.paused; }

  load(index, { autoplay = false } = {}) {
    if (!this.tracks.length) return;
    this.index = (index + this.tracks.length) % this.tracks.length;
    const track = this.currentTrack;
    this.audio.src = track.src;
    this.audio.load();
    this.emit('trackchange');
    if (autoplay) this.play();
  }

  async play() {
    try { await this.audio.play(); }
    catch { this.emit('error', { message: '浏览器阻止了播放，请再次点击播放按钮。' }); }
  }
  pause() { this.audio.pause(); }
  toggle() { return this.isPlaying ? this.pause() : this.play(); }
  previous() { this.load(this.audio.currentTime > 3 ? this.index : this.index - 1, { autoplay: this.isPlaying }); if (this.audio.currentTime > 3) this.audio.currentTime = 0; }
  next() { this.load(this.nextIndex(), { autoplay: this.isPlaying }); }
  seek(percent) { if (Number.isFinite(this.audio.duration)) this.audio.currentTime = (percent / 100) * this.audio.duration; }
  setVolume(volume) { this.audio.volume = Math.max(0, Math.min(1, Number(volume))); if (this.audio.volume > 0) this.audio.muted = false; }
  toggleMute() { this.audio.muted = !this.audio.muted; }
  cycleMode() {
    const modes = Object.values(PLAY_MODES);
    this.mode = modes[(modes.indexOf(this.mode) + 1) % modes.length];
    this.emit('modechange');
  }
  nextIndex() {
    if (this.mode === PLAY_MODES.SHUFFLE && this.tracks.length > 1) {
      let next; do { next = Math.floor(Math.random() * this.tracks.length); } while (next === this.index); return next;
    }
    return (this.index + 1) % this.tracks.length;
  }
  handleEnded() {
    if (this.mode === PLAY_MODES.ONE) { this.audio.currentTime = 0; this.play(); return; }
    this.load(this.nextIndex(), { autoplay: true });
  }
  emit(type, detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail })); }
}
