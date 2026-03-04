//========= This file is used to handle all audio processing and related functionality ===============//

// Define main audio engine for the app (created lazily on first use)
let audioController: AudioContext | null = null;
let audioData: AudioBuffer | null = null; // Stores the decoded audio data

// Get or create the AudioContext for the app
const getAudioContext = () => {
  if (!audioController) {
    audioController = new AudioContext();
  }
  return audioController;
}


//==================================================================//
//========================= File Processing =============================//

/** Handles file uploads and processes audio to be used */
export async function uploadFile(event: React.ChangeEvent<HTMLInputElement>){
    // 1) Check if a file was selected and store it temporarily
    if(!event.target.files || event.target.files.length === 0) return; // No file selected, exit the function
    const file = event.target.files[0];
    
    // 2) Verify and process the audio file.
    try{
        audioData = await processAudioFile(file);
    } catch (error) {
        console.error('Error processing audio file:', error);
        return { success: false, error: "There was a problem while processing the audio file." };
    }

    // 3) Return processed audio
    return { success: true };
}

/** Verify the file is an audio file and decode it for use */
async function processAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer(); // Read file as ArrayBuffer
    const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer); // Decode the audio data since it is compressed
    
    return audioBuffer; // Return the decoded audio data
}

//==================================================================//
//========================= Audio Playback =============================//
export function playAudio() {
    const audioCtrl = getAudioContext();
    const source = audioCtrl.createBufferSource(); // Create a source node for the audio
    source.buffer = audioData;
    source.connect(audioCtrl.destination); // Connect the source to the audio output
    source.start(0); // Start playing the audio immediately
    
    //Loop the audio by restarting it when it ends
    source.onended = () => {
        playAudio(); // Restart the audio when it ends to create a loop
    };
}

export function stopAudio() {
    getAudioContext().suspend(); // Suspend the audio context to stop all audio playback
}

//==========================================================//
//===================== Helpers ============================//
export function clearAudioData(){
  audioData = null; // Clear the stored audio data

  if(audioController && audioController.state !== "closed") {
    audioController.close(); // Close the audio context to stop any playing audio and free memory
    audioController = null;
  }
}


