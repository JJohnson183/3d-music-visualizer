//========= This file is used to handle all audio processing and related functionality ===============//


//======= Core Data =======//
let audioController: AudioContext | null = null;
let audioData: AudioBuffer | null = null; // The main audio engine for the app. Stores the decoded audio data

let analyser: AnalyserNode | null = null; // Analyzes audio frequencies for visualization
let frequencyData: Uint8Array | null = null; // Stores current frequency data (0-255 for each frequency bin)

const fftSize = 256; // Number of frequency bins for analysis (must be a power of 2, e.g. 256, 512, 1024)

let playbackStartTime: number = 0; // AudioContext time when the current play started
let currentSource: AudioBufferSourceNode | null = null; // The currently playing audio source node
let isPlaying: boolean = false; // Whether audio is playing or not
let currentFileName: string = ''; // Name of the currently loaded audio file

//======= Getters & Setters =======//
// Get or create the AudioContext for the app
const getAudioContext = () => {
  if (!audioController) {
    audioController = new AudioContext();
  }
  return audioController;
}

let smoothedBass = 0; // Smoothed bass value for more gradual pulsing of shapes
const smoothAmmount = 0.1; // How much to smooth the bass value (0-1, higher is more smoothing)
export const getSmoothedBass = () => {
    let bass = getBass(); // Get current bass value (0-255)

    // Smooth the bass value for more gradual pulsing (if bass is null, keep the previous smoothed value)
    if (bass !== null) smoothedBass += (bass - smoothedBass) * smoothAmmount;
    return smoothedBass;
}

//==================================================================//
//========================= File Processing =============================//

/** Handles file uploads and processes audio to be used */
export async function uploadFile(file: File) {
    // 1) Verify and process the audio file.
    try{
        audioData = await processAudioFile(file);
        currentFileName = file.name.replace(/\.[^/.]+$/, ''); // Store name without file extension
    } catch {
        return { success: false, error: "There was a problem while processing the audio file." };
    }

    // 2) Return processed audio
    return { success: true };
}

/** Verify the file is an audio file and decode it for use */
async function processAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer(); // Read file as ArrayBuffer
    const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer); // Decode the audio data since it is compressed
    
    return audioBuffer; // Return the decoded audio data
}

//==================================================================//
//========================= Audio Analysis =============================//

/** Set up Fast Fourier Transform (FFT) analyzer to analyze the audio data */
function setupAnalyser() {
    const audioCtrl = getAudioContext();
    
    if (!analyser) {
        analyser = audioCtrl.createAnalyser();
        // split the audio into fftSize/2 frequency bins to analyze as a range of frequencies (lower = more bass, higher = more treble)
        analyser.fftSize = fftSize;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
    }
    
    return analyser;
}

/** Get current frequency data at each moment in the audio (so things can react to details of each moment in the audio) */
export function getFrequencyData(): Uint8Array | null {
    if (!analyser || !frequencyData) return null;
    
    // Updates frequencyData with current values
    analyser.getByteFrequencyData(frequencyData as Uint8Array<ArrayBuffer>);
    return frequencyData;
}

/** Get average volume (0-255) */
export function getAverageVolume(): number | null {
    const data = getFrequencyData();
    if (!data) return null;
    
    // For every frequency bin, sum up the values and divide by the number of bins to get the average volume
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
}

/** Get bass frequencies (0-255) - lower frequency bins */
export function getBass(): number | null {
    const data = getFrequencyData();
    if (!data) return null;
    
    // Get the first 10% of frequency bins (Bass is typically in the first 10% of frequency bins)
    // Then sum up those values and divide by the number of bins to get the average bass level
    const bassData = data.slice(0, Math.floor(data.length * 0.1));
    const sum = bassData.reduce((a, b) => a + b, 0);
    return sum / bassData.length;
}

export function getMid(): number | null {
    const data = getFrequencyData();
    if (!data) return null;

    // Get the middle 20% of frequency bins. Mainly vocals and mid-range instruments
    const midData = data.slice(Math.floor(data.length * 0.2), Math.floor(data.length * 0.4));
    const sum = midData.reduce((a, b) => a + b, 0);
    return sum / midData.length;
}

export function getTreble(): number | null {
    const data = getFrequencyData();
    if (!data) return null;

    // Get the upper 20% of frequency bins. Mainly cymbals and other treble instruments
    const trebleData = data.slice(Math.floor(data.length * 0.6), Math.floor(data.length * 0.8));
    const sum = trebleData.reduce((a, b) => a + b, 0);
    return sum / trebleData.length;
}

//==================================================================//
//========================= Audio Playback =============================//
export function playAudio() {
    // 1) Define the audio controller and analyser
    const audioCtrl = getAudioContext();
    const analyzer = setupAnalyser(); 

    // 2) Create a buffer source for the audio data so it can be played and analyzed
    const source = audioCtrl.createBufferSource();
    source.buffer = audioData;
    currentSource = source; // Store the current source so we can stop it explicitly when needed
    
    // 3) Route audio through analyser so it can extract frequency data (source -> analyser -> destination)
    source.connect(analyzer);
    analyzer.connect(audioCtrl.destination);
    
    // 4) Start playing the audio and loop when it ends (only if still playing, not stopped)
    isPlaying = true;
    playbackStartTime = audioCtrl.currentTime;
    source.start(0);
    source.onended = () => { if (isPlaying) playAudio(); }; // Only loop if we haven't been stopped
}

export function stopAudio() {
    getAudioContext().suspend(); // Suspend the audio context to stop all audio playback
    isPlaying = false; // Mark as not playing
}

export function resumeAudio() {
    if (!audioController) return;
    audioController.resume();
    isPlaying = true;
}

export function getIsPlaying(): boolean {
    return isPlaying;
}

export function getFileName(): string {
    return currentFileName;
}

/** Get the current playback position and total duration in seconds */
export function getPlaybackTime(): { current: number, total: number } {
    if (!audioController || !audioData) return { current: 0, total: 0 };

    const elapsed = audioController.currentTime - playbackStartTime;
    return {
        current: Math.min(elapsed, audioData.duration), // Ensure current time does not exceed total duration for timing issues when looping
        total: audioData.duration
    };
}

//==========================================================//
//===================== Helpers ============================//
export function clearAudioData(){
    audioData = null;
    analyser = null;
    frequencyData = null;
    smoothedBass = 0;
    playbackStartTime = 0;
    currentFileName = '';
    isPlaying = false; // Prevent the onended callback from restarting playback

    // Stop the audio source before closing the context
    if (currentSource) {
        currentSource.onended = null; // Detach callback first so it doesn't fire on stop()
        try { currentSource.stop(); } catch (_) {} // Try/catch since stop() throws if already stopped
        currentSource = null;
    }

    // Close the audio context if it exists and is not already closed
    if(audioController && audioController.state !== "closed") {
        audioController.close(); // Close the audio context to stop any playing audio and free memory
        audioController = null;
    }
}