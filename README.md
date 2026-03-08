# 3D Music Visualizer

A real-time 3D music visualizer where particles react to the frequencies of an uploaded MP3 in 3D space. Built for fun and as a learning project for Three.js and the Web Audio API.

## Features

- **Audio-Reactive Particles**: Stars pulse outward with bass intensity and shift color with mid frequencies (warm = low mids, cool = high mids)
- **Idle Animation**: Stars slowly cycle through a rainbow color spectrum when no audio is playing
- **Playback Bar**: Tracks current position and total duration of the playing audio
- **Free Camera**: Orbit, zoom, and pan around the scene freely

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/JJohnson183/3d-music-visualizer.git
   cd 3d-music-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Three.js** - 3D rendering engine
- **Web Audio API** - Real-time FFT audio analysis

## Credits

Created by **Jordan S. Johnson**
