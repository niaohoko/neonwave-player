import { PlaylistDataManager } from './data-manager.js';
import { PlayerController } from './player-controller.js';
import { UIRenderer } from './ui-renderer.js';

const audio = document.getElementById('audio');
const controller = new PlayerController(audio);
const ui = new UIRenderer(controller);

function wireControls() {
  document.getElementById('playButton').addEventListener('click', () => controller.toggle());
  document.getElementById('previousButton').addEventListener('click', () => controller.previous());
  document.getElementById('nextButton').addEventListener('click', () => controller.next());
  document.getElementById('modeButton').addEventListener('click', () => controller.cycleMode());
  document.getElementById('muteButton').addEventListener('click', () => controller.toggleMute());
  document.getElementById('progress').addEventListener('input', (event) => controller.seek(event.target.value));
  document.getElementById('volume').addEventListener('input', (event) => controller.setVolume(event.target.value));
  document.getElementById('playlist').addEventListener('click', (event) => {
    const item = event.target.closest('[data-index]');
    if (item) controller.load(Number(item.dataset.index), { autoplay: true });
  });
}

function wireEvents() {
  controller.addEventListener('trackchange', () => { ui.renderTrack(); ui.renderProgress(); ui.showStatus('正在载入音频…'); });
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach((event) => controller.addEventListener(event, () => ui.renderProgress()));
  ['play', 'pause'].forEach((event) => controller.addEventListener(event, () => ui.renderPlayback()));
  controller.addEventListener('volumechange', () => ui.renderVolume());
  controller.addEventListener('modechange', () => { ui.renderMode(); ui.notify(`已切换为${controller.mode.label}`); });
  controller.addEventListener('waiting', () => ui.showStatus('正在缓冲…'));
  controller.addEventListener('canplay', () => ui.showStatus('音乐已就绪'));
  controller.addEventListener('error', (event) => { ui.showStatus('播放出现问题', true); ui.notify(event.detail.message); });
}

async function init() {
  wireControls(); wireEvents(); ui.renderVolume(); ui.renderMode();
  try {
    const tracks = await new PlaylistDataManager().load();
    controller.setTracks(tracks); ui.renderPlaylist(tracks); ui.renderTrack();
  } catch (error) {
    ui.showStatus('播放列表不可用', true);
    ui.notify(`${error.message} 刷新页面后可重试。`);
  }
}
init();
