"use client";

interface MenuProps {
  onFileInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onPlaybackToggle: () => void;
  onAudioClear: () => void;
  onDemoPlay: () => void;
}

//=============================================================//
//===================== Menu Component ========================//
export default function Menu({ onFileInputClick, onFileUpload, onPlaybackToggle, onAudioClear, onDemoPlay }: MenuProps) {
  return (
    <div className="mt-4 bg-white/50 p-4">
      {/* Title */}
      <h1 className="text-xl font-bold mb-2">
        3D Particle Music Visualizer
      </h1>

      {/* MP3 add button */}
      <div className="space-y-2 text-sm">
        <p>Upload MP3 Here</p>
        
        {/* File input*/}
        <input
          id="file-input"
          type="file"
          accept="audio/mp3,audio/mpeg"
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 cursor-pointer focus:outline-none"
          onClick={onFileInputClick}
          onChange={onFileUpload}
        />
        
        {/* Demo track button */}
        <button
          onClick={onDemoPlay}
          className="w-full py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          ▶ Play Demo
        </button>
      </div>

      {/* Playback Bar */}
      <div className="mt-4 space-y-1">
        {/* MP3 Title (Empty with no audio loaded) */}
        <div id="playback-title" className="text-sm text-white/80 truncate"></div>

        {/* Progress bar track */}
        <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div id="playback-fill" className="h-full bg-white rounded-full transition-none" style={{ width: '0%' }}></div>
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs font-mono text-white/80">
          <span id="playback-current">0:00</span>
          <span id="playback-total">0:00</span>
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls onPlaybackToggle={onPlaybackToggle} onAudioClear={onAudioClear} />

      {/* Reaction Info */}
      <ReactionInfo />

      {/* Credits */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span>Made by Jordan S. Johnson</span>
        <a
          href="https://github.com/JJohnson183/3d-music-visualizer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="View on GitHub"
        >
          <img src="/github.svg" alt="GitHub" className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

//=============================================================//
//===================== Sub-components ========================//
function PlaybackControls({ onPlaybackToggle, onAudioClear }: { onPlaybackToggle: () => void, onAudioClear: () => void }) {
  return (
    <div className="flex justify-center gap-2 mt-2">
      {/* Play/Pause Button */}
      <button
        id="playback-toggle-btn"
        onClick={onPlaybackToggle}
        className="px-4 py-1 text-sm bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
      >
        ▶
      </button>

      {/* Clear Audio Button */}
      <button
        id="playback-clear-btn"
        onClick={onAudioClear}
        className="px-4 py-1 text-sm bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

function ReactionInfo() {
  return (
    <div className="mt-4 pt-3 border-t border-white/20 space-y-2 text-xs text-white/80">
      <p className="font-semibold text-white">Reactions</p>

      {/* Bass - Pulse */}
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0">Pulse</span>
        <span className="text-white/50">Stars expand with bass</span>
      </div>

      {/* Mid - Color */}
      <div className="flex items-start gap-2">
        <span className="w-14 shrink-0 mt-1">Color</span>
        <div className="flex-1 space-y-1">

          <div
            className="w-full h-2 rounded"
            style={{ background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%))' }}
          />

          <div className="flex justify-between text-white/40" style={{ fontSize: '10px' }}>
            <span>Low mids</span>
            <span>High mids</span>
          </div>
          
        </div>
      </div>
      <p className="text-white/40 text-xs">No audio - colors cycle automatically</p>
    </div>
  );
}
