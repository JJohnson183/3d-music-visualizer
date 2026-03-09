# 3D Music Visualizer

A real-time 3D music visualizer built with Three.js and the Web Audio API. Upload an MP3 and watch 300 particles pulse, orbit, and shift color in sync with the music.

> Built as a learning project for Three.js and the Web Audio API.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Three.js](https://img.shields.io/badge/Three.js-latest-white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Audio-Reactive** - Bass drives 3D pulse, mid frequencies drive color shifts
- **Bloom Glow** - Post-processing using `UnrealBloomPass`
- **Idle Animation** - Rainbow color cycle when no audio is loaded
- **Playback Controls** - Pause/resume, progress bar, track name, and timestamps
- **Free Camera** - Orbit, zoom, and pan freely around the scene
- **Optimized** - 300 particles rendered in 2 GPU draw calls via `InstancedMesh`

## How It Works

Audio is decoded and analyzed each frame using the Web Audio API's Fast Fourier Transform (FFT). Frequency bins are split into bass (0–10%), mid (20–40%), and treble (60–80%) ranges. Bass controls the radial pulse intensity, mids map to HSL hue, and all 300 stars orbit the center on the XZ plane.

## How to Run Locally
```bash
git clone https://github.com/JJohnson183/3d-music-visualizer.git
cd 3d-music-visualizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload an MP3 to start.

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| 3D Rendering | Three.js (InstancedMesh, EffectComposer, UnrealBloomPass) |
| Audio | Web Audio API (FFT analysis) |
| Styling | Tailwind CSS 4 |

## Credits

Created by **Jordan S. Johnson** - [GitHub](https://github.com/JJohnson183/3d-music-visualizer)