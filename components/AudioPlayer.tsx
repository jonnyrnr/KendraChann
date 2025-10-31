import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayIcon, PauseIcon, MusicIcon } from './Icons';

// A royalty-free meditative audio track URL from a reliable CDN
const audioSrc = "https://archive.org/download/ambient-meditation-music/ambient-meditation-music.mp3";

const AudioPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(error => {
                    console.error("Audio playback failed:", error);
                });
                setIsPlaying(true);
            }
        }
    };
    
    useEffect(() => {
        if(audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }
    }, []);

    return (
        <div className="flex items-center">
             <audio ref={audioRef} src={audioSrc} preload="auto" />
             <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className="p-2.5 rounded-full bg-gray-800/50 text-purple-300 hover:bg-purple-900/50 transition-colors border border-white/10"
                aria-label={isPlaying ? "Pause background music" : "Play background music"}
                title="Toggle background music"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isPlaying ? (
                        <motion.div
                            key="pause"
                            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <PauseIcon className="w-5 h-5" />
                        </motion.div>
                    ) : (
                         <motion.div
                            key="play"
                            initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MusicIcon className="w-5 h-5" />
                         </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default AudioPlayer;