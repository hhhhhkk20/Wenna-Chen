import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MainScene } from './components/MainScene';
import { PhotoData } from './types';
import { MotionDetector } from './services/gestureService';
import { Camera, Upload, Music, Gift, Sparkles, Hand, Pause, Play, Plus, Volume2, VolumeX } from 'lucide-react';

const DEFAULT_PHOTOS: PhotoData[] = [
  { id: '1', url: 'https://picsum.photos/seed/zootopia1/400/400', caption: 'First Patrol' },
  { id: '2', url: 'https://picsum.photos/seed/nick/400/400', caption: 'Nick\'s Hustle' },
  { id: '3', url: 'https://picsum.photos/seed/judy/400/400', caption: 'Bunnyburrow' },
  { id: '4', url: 'https://picsum.photos/seed/clawhauser/400/400', caption: 'Donut Time' },
  { id: '5', url: 'https://picsum.photos/seed/bogo/400/400', caption: 'Briefing' },
  { id: '6', url: 'https://picsum.photos/seed/gazelle/400/400', caption: 'Concert Night' },
  { id: '7', url: 'https://picsum.photos/seed/flash/400/400', caption: 'DMV Speed' },
  { id: '8', url: 'https://picsum.photos/seed/winter/400/400', caption: 'Tundratown' },
  { id: '9', url: 'https://picsum.photos/seed/rainforest/400/400', caption: 'Rainforest' },
  { id: '10', url: 'https://picsum.photos/seed/sahara/400/400', caption: 'Sahara Square' },
  { id: '11', url: 'https://picsum.photos/seed/train/400/400', caption: 'Express Train' },
  { id: '12', url: 'https://picsum.photos/seed/pawpsicle/400/400', caption: 'Pawpsicles' },
];

export default function App() {
  const [photos, setPhotos] = useState<PhotoData[]>(DEFAULT_PHOTOS);
  const [expansion, setExpansion] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [gestureMode, setGestureMode] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const detector = useMemo(() => new MotionDetector(), []);
  const detectorRef = useRef<MotionDetector>(detector);
  const rafRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to trigger file upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=christmas-magic-127393.mp3'); 
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  const toggleMusic = () => {
      if (audioRef.current) {
          if (isPlaying) {
              audioRef.current.pause();
          } else {
              audioRef.current.play().catch(e => console.log("Audio play failed, user interaction needed first"));
          }
          setIsPlaying(!isPlaying);
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newPhoto: PhotoData = {
        id: Date.now().toString(),
        url: url,
        caption: 'My Memory'
      };
      setPhotos(prev => [newPhoto, ...prev]);
    }
  };

  const updateGesture = useCallback(() => {
    if (detectorRef.current) {
      const motion = detectorRef.current.detect();
      setExpansion(prev => {
        const target = motion > 0.3 ? 1.0 : 0.0;
        return prev + (target - prev) * 0.05;
      });
    }
    rafRef.current = requestAnimationFrame(updateGesture);
  }, []);

  const toggleGestureMode = async () => {
    if (gestureMode) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      detectorRef.current.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setGestureMode(false);
      setExpansion(0);
      setAutoRotate(true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
            detectorRef.current.start(videoRef.current!);
            rafRef.current = requestAnimationFrame(updateGesture);
          };
        }
        setGestureMode(true);
        setAutoRotate(false);
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Camera access is required for gesture control.");
      }
    }
  };

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      {/* Main 3D Scene */}
      <div className="absolute inset-0 z-0">
        <MainScene photos={photos} expansion={expansion} autoRotate={autoRotate} />
      </div>

      {/* Hidden Video for Analysis */}
      <video 
        ref={videoRef} 
        className="fixed bottom-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-green-500 opacity-50 z-50 pointer-events-none"
        style={{ display: gestureMode ? 'block' : 'none', transform: 'scaleX(-1)' }} 
        muted 
        playsInline
      />

      {/* UI Layer */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] font-bold tracking-wider">
              ZOOTOPIA
            </h1>
            <p className="text-green-300 text-sm md:text-base tracking-[0.2em] uppercase mt-1">
              Grand Luxury Interactive Tree
            </p>
          </div>
          
          {/* Music Control */}
          <button 
            onClick={toggleMusic}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm border border-white/10 transition-all"
          >
             {isPlaying ? <Volume2 size={24} className="text-yellow-400" /> : <VolumeX size={24} />}
          </button>
        </header>

        {/* Controls Panel (Bottom Left) */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-64 md:w-80 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-yellow-100 font-bold mb-3 flex items-center gap-2">
              <Sparkles size={16} /> Tree Controls
            </h3>
            
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">
                Tree Expansion
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                disabled={gestureMode}
                value={expansion}
                onChange={(e) => setExpansion(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 disabled:opacity-50"
              />
            </div>

            <button
              onClick={toggleGestureMode}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold text-sm mb-3 ${
                gestureMode 
                  ? 'bg-red-500/80 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-green-600/80 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              }`}
            >
              <Camera size={18} />
              {gestureMode ? 'Stop AI Gesture' : 'Start AI Gesture'}
            </button>
            
            {gestureMode && (
              <p className="text-xs text-center text-green-300 animate-pulse">
                Wave your hands to expand the tree!
              </p>
            )}

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              disabled={gestureMode}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {autoRotate ? <Pause size={14} /> : <Play size={14} />}
              {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            </button>
          </div>
        </div>

        {/* Memory Gallery Actions (Right Side) */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
            accept="image/*"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-yellow-500/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all group relative"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Add Memory
            </span>
          </button>

          <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-yellow-200">
             <span className="text-xs font-bold">{photos.length}</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setShowUI(!showUI)}
        className="absolute bottom-4 right-4 z-50 text-white/30 hover:text-white/80 transition-colors"
      >
        {showUI ? 'Hide UI' : 'Show UI'}
      </button>
    </div>
  );
}