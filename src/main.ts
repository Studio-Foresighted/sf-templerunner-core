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

const switchToRunningScene = async () => {
  // Ensure loaded before switching
  if (!runningScene.loaded) {
      console.log('⏳ Waiting for RunningScene to finish loading...');
      const loader = document.querySelector('.loading-container') as HTMLElement;
      if (loader) loader.style.display = 'flex';
      
      runningScene.showProgressInUI = true;
      await runningScene.load(); 
      
      // Wait a tiny bit for the 100% bar to be seen
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (loader) loader.style.display = 'none';
  }
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

const switchToCharacterSelectionScene = async () => {
  if (!characterSelectionScene.loaded) {
      const loader = document.querySelector('.loading-container') as HTMLElement;
      if (loader) loader.style.display = 'flex';
      
      characterSelectionScene.showProgressInUI = true;
      await characterSelectionScene.load();
      
      await new Promise(resolve => setTimeout(resolve, 400));
      if (loader) loader.style.display = 'none';
  }
  currentScene.hide();
  currentScene = characterSelectionScene;
  currentScene.initialize();
};

const switchToFreshScene = async () => {
  if (!freshScene.loaded) {
      console.log('⏳ Waiting for FreshScene to finish loading...');
      const loader = document.querySelector('.loading-container') as HTMLElement;
      if (loader) loader.style.display = 'flex';

      freshScene.showProgressInUI = true;
      await freshScene.load();

      // Wait a tiny bit for the 100% bar to be seen
      await new Promise(resolve => setTimeout(resolve, 400));

      if (loader) loader.style.display = 'none';
  }
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

let hasWarmedUp = false;
let warmUpFrame = 0;

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
  // 1. Configure Split Loading
  // Main Menu takes 0% -> 50%
  mainMenuScene.loadingOffset = 0;
  mainMenuScene.loadingScale = 0.5;
  
  // Running Scene takes 50% -> 100%
  runningScene.loadingOffset = 50;
  runningScene.loadingScale = 0.5;
  runningScene.showProgressInUI = true;

  // 2. Load Both (Sequentially to ensure bar is smooth)
  await mainMenuScene.load();
  await runningScene.load();
  
  // 3. Wait a tiny bit for the 100% bar to be seen
  await new Promise(resolve => setTimeout(resolve, 400));

  // 4. Hide Loader immediately
  (document.querySelector('.loading-container') as HTMLInputElement).style.display = 'none';
  currentScene.initialize();
  render();

  // 5. Start loading others in background (Delayed & Sequenced)
  startBackgroundLoading();
};

const startBackgroundLoading = async () => {
    // Wait 3 seconds for initial smooth experience (Intro Animation)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // RunningScene is already loaded in main()

    // Removed FreshScene and CharacterSelectionScene background loading to prevent Main Menu lag.
    // They will load on-demand when the user clicks their respective buttons.

    console.log('✅ Background loading complete. Triggering WarmUp.');
    
    // Now trigger warmUp to prevent pop-in
    runningScene.warmUp(renderer, mainCamera);
};

main();
