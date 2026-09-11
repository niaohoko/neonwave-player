const time = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export class UIRenderer {
  constructor(controller) {
    this.controller = controller;
    this.elements = Object.fromEntries(['coverArt', 'trackTitle', 'trackArtist', 'record', 'soundBars', 'progress', 'currentTime', 'duration', 'playButton', 'playIcon', 'previousButton', 'nextButton', 'modeButton', 'muteButton', 'volume', 'volumeValue', 'playlist', 'trackCount', 'toast', 'connectionStatus'].map((id) => [id, document.getElementById(id)]));
    this.toastTimer = null;
  }
  renderPlaylist(tracks) {
    this.elements.trackCount.textContent = `${tracks.length} 首`;
    this.elements.playlist.innerHTML = tracks.map((track, index) => `<li><button class="playlist-item" type="button" data-index="${index}" aria-label="播放 ${this.escape(track.title)}"><span class="item-index">${String(index + 1).padStart(2, '0')}</span><img src="${this.escape(track.cover)}" alt="" /><span class="item-copy"><strong>${this.escape(track.title)}</strong><small>${this.escape(track.artist)}</small></span><span class="format">${track.format}</span></button></li>`).join('');
  }
  renderTrack() {
    const track = this.controller.currentTrack;
    if (!track) return;
    this.elements.coverArt.src = track.cover;
    this.elements.coverArt.alt = `${track.title} 封面`;
    this.elements.trackTitle.textContent = track.title;
    this.elements.trackArtist.textContent = track.artist;
    [...this.elements.playlist.querySelectorAll('.playlist-item')].forEach((item, index) => item.classList.toggle('active', index === this.controller.index));
  }
  renderProgress() {
    const { audio } = this.controller;
    const percent = Number.isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0;
    this.elements.progress.value = percent || 0;
    this.paintRange(this.elements.progress, percent || 0);
    this.elements.currentTime.textContent = time(audio.currentTime);
    this.elements.duration.textContent = time(audio.duration);
  }
  renderPlayback() {
    const playing = this.controller.isPlaying;
    this.elements.playIcon.textContent = playing ? 'Ⅱ' : '▶';
    this.elements.playButton.setAttribute('aria-label', playing ? '暂停' : '播放');
    this.elements.record.classList.toggle('is-playing', playing);
    this.elements.soundBars.classList.toggle('is-playing', playing);
  }
  renderVolume() {
    const { audio } = this.controller;
    const value = audio.muted ? 0 : audio.volume;
    this.elements.volume.value = value;
    this.elements.volumeValue.textContent = `${Math.round(value * 100)}%`;
    this.elements.muteButton.textContent = value === 0 ? '◯' : '◖';
    this.elements.muteButton.setAttribute('aria-label', value === 0 ? '取消静音' : '静音');
    this.paintRange(this.elements.volume, value * 100);
  }
  renderMode() {
    const { mode } = this.controller;
    this.elements.modeButton.textContent = mode.icon;
    this.elements.modeButton.title = mode.label;
    this.elements.modeButton.setAttribute('aria-label', `当前模式：${mode.label}，点击切换`);
  }
  showStatus(message, isError = false) {
    this.elements.connectionStatus.innerHTML = `<span class="status-dot ${isError ? 'error' : ''}"></span>${message}`;
  }
  notify(message) {
    const toast = this.elements.toast;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }
  paintRange(input, percent) { input.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, percent))}%`); }
  escape(value) { const element = document.createElement('span'); element.textContent = value; return element.innerHTML; }
}
