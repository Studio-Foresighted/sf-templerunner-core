import { WebGLRenderer, PerspectiveCamera } from 'three';

import RunningScene from './scenes/RunningScene';
import MainMenuScene from './scenes/MainMenuScene';
import CharacterSelectionScene from './scenes/CharacterSelectionScene';
import FreshScene from './scenes/FreshScene';

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement,
  antialias: true,
  precision: 'mediump',
});

renderer.setSize(width, height);

let currentScene:MainMenuScene | RunningScene | CharacterSelectionScene | FreshScene;

const mainCamera = new PerspectiveCamera(60, width / height, 0.1, 1000);

function onWindowResize() {
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

const runningScene = new RunningScene();
const mainMenuScene = new MainMenuScene();
const characterSelectionScene = new CharacterSelectionScene();
const freshScene = new FreshScene();

// Expose for texture updates
(window as any).gameScenes = {
  running: runningScene,
  mainMenu: mainMenuScene,
  fresh: freshScene,
};

const switchToRunningScene = () => {
  currentScene.hide();
  currentScene = runningScene;
  currentScene.initialize();
  const exitFsBtn = document.getElementById('exit-fullscreen-button');
  if (exitFsBtn) exitFsBtn.style.display = 'flex';
};

const switchToMainMenuScene = () => {
  currentScene.hide();
  currentScene = mainMenuScene;
  currentScene.initialize();
  const exitFsBtn = document.getElementById('exit-fullscreen-button');
  if (exitFsBtn) exitFsBtn.style.display = 'none';
};

const switchToCharacterSelectionScene = () => {
  currentScene.hide();
  currentScene = characterSelectionScene;
  currentScene.initialize();
};

const switchToFreshScene = () => {
  currentScene.hide();
  currentScene = freshScene;
  currentScene.initialize();
};

const requestFullscreenSafe = () => {
  const el = document.documentElement as any;
  try {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch((e: any) => console.log('Fullscreen error:', e));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  } catch (e) {
    console.log('Fullscreen request failed:', e);
  }
};

const exitFullscreenSafe = () => {
  const doc = document as any;
  try {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch((e: any) => console.log('Exit fullscreen error:', e));
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  } catch (e) {
    console.log('Exit fullscreen failed:', e);
  }
};

// (document.getElementById('play-game-button')as HTMLInputElement).onclick = () => {
//   requestFullscreenSafe();
//   runningScene.setDemoModeEnabled(false);
//   switchToRunningScene();
// };

// (document.getElementById('demo-game-button')as HTMLInputElement).onclick = () => {
//   // requestFullscreenSafe(); // Disabled for Demo Mode
//   runningScene.setDemoModeEnabled(true);
//   switchToRunningScene();
// };

(document.getElementById('exit-fullscreen-button')as HTMLInputElement).onclick = () => {
  exitFullscreenSafe();
};

(document.querySelector('#quit-button')as HTMLInputElement).onclick = () => {
  (document.getElementById('game-paused-modal')as HTMLInputElement).style.display = 'none'; // Fix: Hide paused modal, not game over
  switchToMainMenuScene();
};

(document.querySelector('#game-over-quit-button')as HTMLInputElement).onclick = () => {
  (document.getElementById('game-over-modal')as HTMLInputElement).style.display = 'none';
  switchToMainMenuScene();
};

currentScene = mainMenuScene;
const render = (time: number = 0) => {
  currentScene.update();
  // TWEEN.update(time); // Moved to scene update for better control
  renderer.render(currentScene, mainCamera);
  requestAnimationFrame(render);
};

// (document.querySelector('#Characters-selection-button')as HTMLInputElement).onclick = () => {
//   switchToCharacterSelectionScene();
// };

const freshBtn = document.getElementById('fresh-mode-button');
if (freshBtn) {
  freshBtn.onclick = () => {
    switchToFreshScene();
  };
}

(document.querySelector('.home-menu')as HTMLInputElement).onclick = () => {
  switchToMainMenuScene();
};

window.addEventListener('returnToMainMenu', () => {
  switchToMainMenuScene();
});

const main = async () => {
  await runningScene.load();
  await mainMenuScene.load();
  await characterSelectionScene.load();

  // Pre-compile shaders to avoid pop-in delay
  runningScene.warmUp(renderer, mainCamera);

  (document.querySelector('.loading-container') as HTMLInputElement).style.display = 'none';
  currentScene.initialize();
  render();
};

main();
