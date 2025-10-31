import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { StreamingPlatform } from '../types';
import { RssIcon, TwitchIcon, YoutubeIcon, FacebookIcon, CopyIcon, CheckIcon, AlertTriangleIcon } from './Icons';

const availablePlatforms: StreamingPlatform[] = [
    { name: 'Twitch', icon: <TwitchIcon className="w-6 h-6" />, brandColor: '#9146FF' },
    { name: 'YouTube', icon: <YoutubeIcon className="w-6 h-6" />, brandColor: '#FF0000' },
    { name: 'Facebook', icon: <FacebookIcon className="w-6 h-6" />, brandColor: '#1877F2' },
];

const StreamingHub: React.FC = () => {
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [streamKey, setStreamKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [streamTitle, setStreamTitle] = useState('');
    const [streamDescription, setStreamDescription] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [copyStatus, setCopyStatus] = useState<'url' | 'key' | 'title' | 'desc' | null>(null);

    useEffect(() => {
        try {
            const savedUrl = localStorage.getItem('enigmaRtmpUrl') || '';
            const savedKey = localStorage.getItem('enigmaStreamKey') || '';
            setRtmpUrl(savedUrl);
            setStreamKey(savedKey);
        } catch (e) {
            console.error("Failed to load streaming config from storage", e);
        }
    }, []);

    const handleSaveConfig = () => {
        try {
            localStorage.setItem('enigmaRtmpUrl', rtmpUrl);
            localStorage.setItem('enigmaStreamKey', streamKey);
        } catch (e) {
            console.error("Failed to save streaming config to storage", e);
        }
    };

    const handleCopyToClipboard = (text: string, type: 'url' | 'key' | 'title' | 'desc') => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus(type);
            setTimeout(() => setCopyStatus(null), 2000);
        });
    };
    
    const togglePlatform = (name: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
        );
    };

    return (
        <motion.div
            key="streaming-hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-3 gap-8"
        >
            {/* Left Column: Control Panel */}
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-900/20 p-6 border border-purple-500/20">
                    <h3 className="text-2xl font-fancy font-bold mb-4 text-purple-300 flex items-center gap-3"><RssIcon /> Broadcast Command Center</h3>
                    <p className="text-gray-400 mb-6">
                        Configure your stream details here, then use the credentials with your broadcasting software (like OBS, Streamlabs, or Streamyard) to go live. This hub centralizes your pre-stream workflow.
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Stream Title</label>
                            <div className="relative">
                                <input
                                  type="text"
                                  value={streamTitle}
                                  onChange={(e) => setStreamTitle(e.target.value)}
                                  placeholder="My Mystical Live Tarot Reading"
                                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 pr-10 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
                                />
                                <button onClick={() => handleCopyToClipboard(streamTitle, 'title')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-white">
                                    {copyStatus === 'title' ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Stream Description</label>
                            <div className="relative">
                                <textarea
                                  value={streamDescription}
                                  onChange={(e) => setStreamDescription(e.target.value)}
                                  rows={4}
                                  placeholder="Join me for a live session where we'll explore the week's energies through the cards..."
                                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 pr-10 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors resize-y"
                                />
                                 <button onClick={() => handleCopyToClipboard(streamDescription, 'desc')} className="absolute top-3 right-3 flex items-center text-gray-500 hover:text-white">
                                    {copyStatus === 'desc' ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-900/20 p-6 border border-purple-500/20">
                    <h3 className="text-xl font-fancy font-bold mb-4 text-purple-300">Target Platforms</h3>
                    <p className="text-gray-500 text-sm mb-4">Select the platforms you'll be streaming to for this session. This is a visual checklist to help you stay organized.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {availablePlatforms.map(platform => (
                            <button 
                                key={platform.name} 
                                onClick={() => togglePlatform(platform.name)}
                                className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 ${selectedPlatforms.includes(platform.name) ? 'border-purple-500 bg-purple-900/30' : 'border-transparent bg-gray-900/50 hover:bg-gray-700/50'}`}
                            >
                                {platform.icon}
                                <span className="font-semibold text-gray-200">{platform.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Configuration & Guide */}
            <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-fancy font-bold mb-4 text-purple-300">Streaming Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">RTMP Server URL</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={rtmpUrl}
                                    onChange={(e) => setRtmpUrl(e.target.value)}
                                    onBlur={handleSaveConfig}
                                    placeholder="rtmp://a.rtmp.youtube.com/live2"
                                    className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 pr-10 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
                                />
                                <button onClick={() => handleCopyToClipboard(rtmpUrl, 'url')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-white">
                                    {copyStatus === 'url' ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Stream Key</label>
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={streamKey}
                                    onChange={(e) => setStreamKey(e.target.value)}
                                    onBlur={handleSaveConfig}
                                    placeholder="••••••••••••••••••••"
                                    className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 pr-20 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button onClick={() => setShowKey(!showKey)} className="px-3 text-xs font-bold text-gray-400 hover:text-white">
                                        {showKey ? 'HIDE' : 'SHOW'}
                                    </button>
                                     <button onClick={() => handleCopyToClipboard(streamKey, 'key')} className="pr-3 pl-2 text-gray-500 hover:text-white">
                                        {copyStatus === 'key' ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                         <div className="flex items-start gap-3 text-amber-300 bg-amber-900/30 p-3 rounded-lg mt-4 border border-amber-500/30">
                            <AlertTriangleIcon className="w-8 h-8 flex-shrink-0" />
                            <p className="text-xs text-amber-200/80">
                                Your stream key is private. Never share it publicly. This information is saved only in your browser's local storage.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-fancy font-bold mb-4 text-purple-300">Quick Start Guide</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>
                            <strong>Get your credentials.</strong>
                            <p className="text-sm text-gray-400 pl-4">Use a multistreaming service like <a href="https://restream.io" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">Restream.io</a> for one key, or get a key directly from Twitch/YouTube.</p>
                        </li>
                        <li>
                            <strong>Configure this hub.</strong>
                             <p className="text-sm text-gray-400 pl-4">Paste your RTMP URL and Stream Key above. Set your title and description for this session.</p>
                        </li>
                        <li>
                            <strong>Setup your software.</strong>
                            <p className="text-sm text-gray-400 pl-4">Open your broadcast software (e.g., OBS), go to Settings &gt; Stream, and paste your credentials from here.</p>
                        </li>
                         <li>
                            <strong>Go Live!</strong>
                            <p className="text-sm text-gray-400 pl-4">Start the stream from your software. This hub does not start the stream itself; it's your command center.</p>
                        </li>
                    </ol>
                </div>

                 <div className="text-center p-4">
                     <div className="inline-flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-bold font-fancy text-red-400">STATUS: OFFLINE</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Manage your live status from your broadcast software.</p>
                </div>
            </div>
        </motion.div>
    );
};

export default StreamingHub;
