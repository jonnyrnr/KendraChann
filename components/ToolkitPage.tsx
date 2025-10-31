import React, { useState, useEffect } from 'react';
import type { YouTubePlan, SavedPlan, VideoIdeaDetails, PlanFeedback } from '../types';
import { generateYouTubePlan, getVideoIdeaDetails } from '../services/geminiService';
import PlanSection from './PlanSection';
import { WandSparklesIcon, BrainCircuitIcon, BotMessageSquareIcon, BarChartIcon, DollarSignIcon, BookOpenIcon, SaveIcon, RefreshCwIcon, Share2Icon, GiftIcon, PrinterIcon, VideoIcon, MegaphoneIcon, TwitterIcon, FacebookIcon, CopyIcon, CheckIcon, AlertTriangleIcon, InstagramIcon, TiktokIcon, ChevronDownIcon, StarIcon, RssIcon, TagIcon, ClockIcon, KeyIcon } from './Icons';
import LoadingSpinner, { SkeletonLine } from './LoadingSpinner';
import HistoryPanel from './HistoryPanel';
import StreamingHub from './StreamingHub';
import { AnimatePresence, motion } from 'framer-motion';

type ToolkitView = 'blueprint' | 'streaming';

const ToolkitPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ToolkitView>('blueprint');
  const [request, setRequest] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plan, setPlan] = useState<YouTubePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // State for interactive video ideas
  const [expandedIdeaIndex, setExpandedIdeaIndex] = useState<number | null>(null);
  const [ideaDetails, setIdeaDetails] = useState<{ [key: number]: VideoIdeaDetails }>({});
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [fetchingDetailsFor, setFetchingDetailsFor] = useState<number | null>(null);

  // State for feedback
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('youtubeMysticPlans');
      if (storedPlans) {
        setSavedPlans(JSON.parse(storedPlans));
      }
    } catch (e) {
      console.error("Failed to load plans from storage", e);
    }
  }, []);
  
  const checkFeedbackStatus = (planRequest: string) => {
      const storedFeedback = localStorage.getItem('youtubeMysticFeedback');
      if (storedFeedback) {
          const feedbackList: PlanFeedback[] = JSON.parse(storedFeedback);
          const hasGivenFeedback = feedbackList.some(fb => fb.request === planRequest);
          setIsFeedbackSubmitted(hasGivenFeedback);
      } else {
          setIsFeedbackSubmitted(false);
      }
  };

  const handleGeneratePlan = async (promptOverride?: string) => {
    const currentRequest = promptOverride || request;
    if (!currentRequest.trim()) {
      setError("Please describe your channel idea first.");
      return;
    }
    // If an override is used from a prompt button, update the main request state to keep UI in sync
    if(promptOverride) {
        setRequest(promptOverride);
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    setIsPlanSaved(false);
    // Reset interactive/feedback states for new plan
    setExpandedIdeaIndex(null);
    setIdeaDetails({});
    setDetailsError(null);
    setFeedbackRating(0);
    setFeedbackComment('');
    checkFeedbackStatus(currentRequest);

    try {
      const generatedPlan = await generateYouTubePlan(currentRequest);
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while communicating with the AI. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePlan = () => {
    if (!plan) return;
    const newSavedPlan: SavedPlan = {
      id: Date.now(),
      request,
      plan,
      createdAt: new Date().toISOString(),
    };
    const updatedPlans = [newSavedPlan, ...savedPlans];
    setSavedPlans(updatedPlans);
    localStorage.setItem('youtubeMysticPlans', JSON.stringify(updatedPlans));
    setIsPlanSaved(true);
    setToastMessage("Blueprint saved to History!");
    setTimeout(() => setToastMessage(""), 3000);
  };
  
  const handleDeletePlan = (id: number) => {
    const updatedPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updatedPlans);
    localStorage.setItem('youtubeMysticPlans', JSON.stringify(updatedPlans));
  };

  const handleLoadPlan = (savedPlan: SavedPlan) => {
    setRequest(savedPlan.request);
    setPlan(savedPlan.plan);
    setShowHistory(false);
    setError(null);
    setIsPlanSaved(true);
    // Reset interactive/feedback states for loaded plan
    setExpandedIdeaIndex(null);
    setIdeaDetails({});
    setDetailsError(null);
    setFeedbackRating(0);
    setFeedbackComment('');
    checkFeedbackStatus(savedPlan.request);
    setActiveView('blueprint'); // Ensure we are on the blueprint view when loading a plan
  };
  
  const handleGenerateNew = () => {
      setPlan(null);
      setRequest("");
      setError(null);
      setIsPlanSaved(false);
  }

  const handleIdeaClick = async (index: number) => {
    if (expandedIdeaIndex === index) {
        setExpandedIdeaIndex(null); // Collapse if already open
        return;
    }

    setExpandedIdeaIndex(index);
    setDetailsError(null);

    if (!ideaDetails[index]) {
        setFetchingDetailsFor(index);
        try {
            const videoIdea = plan?.videoIdeas.ideas[index];
            if (videoIdea) {
                const details = await getVideoIdeaDetails(request, videoIdea.title, videoIdea.description);
                setIdeaDetails(prev => ({ ...prev, [index]: details }));
            }
        } catch (err) {
            if (err instanceof Error) {
                setDetailsError(err.message);
            }
        } finally {
            setFetchingDetailsFor(null);
        }
    }
  };

  const handleFollowUpPrompt = (prompt: string) => {
    handleGeneratePlan(prompt);
  };

  const handleSaveFeedback = () => {
    if (feedbackRating === 0 || isFeedbackSubmitted) return;
    const newFeedback: PlanFeedback = {
        request: request,
        rating: feedbackRating,
        comment: feedbackComment,
        createdAt: new Date().toISOString(),
    };
    try {
        const storedFeedback = localStorage.getItem('youtubeMysticFeedback') || '[]';
        const feedbackList = JSON.parse(storedFeedback);
        feedbackList.push(newFeedback);
        localStorage.setItem('youtubeMysticFeedback', JSON.stringify(feedbackList));
        setIsFeedbackSubmitted(true);
        setToastMessage("Thank you for your feedback!");
        setTimeout(() => setToastMessage(""), 3000);
    } catch (e) {
        console.error("Failed to save feedback", e);
        setError("Could not save your feedback due to a local storage issue.");
    }
  };

  const formatPlanForClipboard = (p: YouTubePlan): string => {
    let t = `✨ My YouTube Channel Blueprint for "${request}" ✨\n\nGenerated by The Enigma Channel's Creator Toolkit.\n\n`;

    t += `🔮 **Channel Branding**\n`;
    t += `- Title Idea: ${p.channelBranding.title}\n`;
    t += `- Description: ${p.channelBranding.description}\n`;
    t += `- Name Ideas: ${p.channelBranding.nameIdeas.join(', ')}\n`;
    t += `- Tagline Ideas: ${p.channelBranding.taglineIdeas.join(', ')}\n`;
    t += `- Visual Identity: ${p.channelBranding.visualIdentity}\n\n`;

    t += `🧠 **Content Strategy**\n`;
    t += `- Title: ${p.contentStrategy.title}\n`;
    p.contentStrategy.contentPillars.forEach(pi => {
        t += `  - Pillar: ${pi.pillar}\n`;
        t += `    - Ideas: ${pi.ideas.join(', ')}\n`;
    });
    t += `- Video Formats: ${p.contentStrategy.videoFormats.join(', ')}\n\n`;

    t += `🎬 **Video Ideas**\n`;
    p.videoIdeas.ideas.forEach(idea => {
        t += `- ${idea.title}: ${idea.description}\n`;
    });
    t += `\n`;

    t += `⚙️ **Automation & Workflow**\n`;
    p.automationWorkflow.steps.forEach(step => {
        t += `- ${step.step}: ${step.details} (Tools: ${step.tools.join(', ')})\n`;
    });
    t += `\n`;
    
    t += `🚀 **Social Media Promotion**\n`;
    t += `- Twitter: \n${p.socialMediaPromotion.twitterPosts.map(post => `  - "${post}"`).join('\n')}\n`;
    t += `- Instagram: \n${p.socialMediaPromotion.instagramCaptions.map(caption => `  - "${caption}"`).join('\n')}\n`;
    t += `- TikTok: \n${p.socialMediaPromotion.tiktokIdeas.map(idea => `  - "${idea}"`).join('\n')}\n`;
    t += `- Facebook: \n${p.socialMediaPromotion.facebookPosts.map(post => `  - "${post}"`).join('\n')}\n\n`;

    t += `📈 **Traffic Generation**\n`;
    p.trafficGeneration.strategies.forEach(s => {
        t += `- ${s.strategy}: ${s.details}\n`;
    });
    t += `\n`;

    t += `💰 **Monetization Methods**\n`;
    p.monetization.methods.forEach(m => {
        t += `- ${m.method}: ${m.details}\n`;
        t += `  - CTA: "${m.cta}"\n`;
    });
    t += `\n`;

    t += `🎁 **Merchandise & Offerings**\n`;
    p.merchandiseOfferings.products.forEach(prod => {
        t += `- ${prod.product}: ${prod.details} (Fulfillment: ${prod.fulfillment})\n`;
    });

    return t;
  };

  const handleShare = (platform: 'twitter' | 'facebook') => {
    if (!plan) return;
    const shareText = `I just generated a YouTube channel blueprint using The Enigma Channel's Creator Toolkit! ✨ #YouTubeStrategy`;
    const encodedText = encodeURIComponent(shareText);
    const appUrl = encodeURIComponent(window.location.href);

    let url = '';
    if (platform === 'twitter') {
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${appUrl}`;
    } else if (platform === 'facebook') {
        url = `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`;
    }

    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyPlan = () => {
    if (!plan || copyStatus) return;
    const formattedPlan = formatPlanForClipboard(plan);
    navigator.clipboard.writeText(formattedPlan).then(() => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2500);
    }).catch(err => {
        console.error('Failed to copy plan:', err);
        setError("Could not copy to clipboard. Your browser might not support this feature.");
    });
  };

  const renderBlueprintContent = () => {
    if (isLoading) {
      return (
        <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
            <div className="flex flex-col items-center justify-center text-center py-8 bg-gray-800/30 rounded-2xl mb-6">
                <LoadingSpinner />
                <p className="text-xl text-purple-300 mt-4 font-fancy animate-pulse">Consulting the digital oracle...</p>
                <p className="text-gray-400">Scrying for viral video strategies.</p>
            </div>
            <div className="space-y-4">
                <PlanSection title="Channel Branding" icon={<BotMessageSquareIcon className="w-6 h-6" />} defaultOpen>
                    <SkeletonLine width="60%" height="1.75rem" className="mb-3" />
                    <SkeletonLine width="95%" height="1rem" className="mb-1" />
                    <SkeletonLine width="85%" height="1rem" className="mb-4" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <SkeletonLine width="50%" height="1.25rem" className="mb-2" />
                            <SkeletonLine width="80%" height="1rem" className="mb-1" />
                            <SkeletonLine width="70%" height="1rem" className="mb-1" />
                            <SkeletonLine width="75%" height="1rem" className="mb-1" />
                        </div>
                        <div>
                            <SkeletonLine width="50%" height="1.25rem" className="mb-2" />
                            <SkeletonLine width="80%" height="1rem" className="mb-1" />
                            <SkeletonLine width="70%" height="1rem" className="mb-1" />
                            <SkeletonLine width="75%" height="1rem" className="mb-1" />
                        </div>
                    </div>
                </PlanSection>
                <PlanSection title="Content Strategy" icon={<BrainCircuitIcon className="w-6 h-6" />}>
                    <SkeletonLine width="45%" height="1.5rem" className="mb-3" />
                    <SkeletonLine width="90%" height="1rem" className="mb-1" />
                    <SkeletonLine width="80%" height="1rem" className="mb-1" />
                </PlanSection>
                <PlanSection title="Video Ideas" icon={<VideoIcon className="w-6 h-6" />}>
                    <SkeletonLine width="45%" height="1.5rem" className="mb-3" />
                    <SkeletonLine width="90%" height="1rem" className="mb-1" />
                    <SkeletonLine width="80%" height="1rem" className="mb-1" />
                </PlanSection>
            </div>
        </motion.div>
      );
    }
    
    if (plan) {
      return (
        <motion.div
            key="plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-gray-800/50 p-3 rounded-2xl border border-purple-500/20 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                        onClick={handleSavePlan}
                        disabled={isPlanSaved}
                        className="font-fancy text-sm font-bold bg-gray-700/60 text-purple-300 py-2 px-4 rounded-full shadow-lg hover:shadow-xl hover:bg-purple-900/50 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <SaveIcon className="w-4 h-4 mr-2" />
                        {isPlanSaved ? 'Blueprint Saved' : 'Save Blueprint'}
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded-full border border-purple-500/20" title="Share your blueprint">
                        <span className="text-xs font-bold text-purple-300/70 ml-2 mr-1 select-none">SHARE</span>
                        <button 
                            onClick={() => handleShare('twitter')}
                            className="p-2 rounded-full text-gray-400 hover:text-sky-400 hover:bg-sky-500/20 transition-colors"
                            aria-label="Share on Twitter"
                            title="Share on Twitter"
                        >
                            <TwitterIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleShare('facebook')}
                            className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-500/20 transition-colors"
                            aria-label="Share on Facebook"
                            title="Share on Facebook"
                        >
                            <FacebookIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleCopyPlan}
                            className={`p-2 rounded-full transition-colors ${
                                copyStatus 
                                ? 'text-green-400' 
                                : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/20'
                            }`}
                            aria-label="Copy plan text to clipboard"
                            title="Copy plan text"
                            disabled={copyStatus}
                        >
                            {copyStatus ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                 <button
                  onClick={handleGenerateNew}
                  className="font-fancy text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Generate New
                </button>
              </div>

              <h3 className="text-4xl font-fancy text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">Your Channel Blueprint</h3>
              
              <PlanSection title="Channel Branding" icon={<BotMessageSquareIcon className="w-6 h-6" />} defaultOpen>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.channelBranding.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.channelBranding.description}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2 text-lg">Name Ideas:</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {plan.channelBranding.nameIdeas.map((name, i) => <li key={i}>{name}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2 text-lg">Tagline Ideas:</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {plan.channelBranding.taglineIdeas.map((tagline, i) => <li key={i}>{tagline}</li>)}
                    </ul>
                  </div>
                </div>
                <h4 className="font-semibold text-purple-300 mt-6 mb-2 text-lg">Visual Identity:</h4>
                <p className="text-gray-300 leading-relaxed">{plan.channelBranding.visualIdentity}</p>
              </PlanSection>

              <PlanSection title="Content Strategy" icon={<BrainCircuitIcon className="w-6 h-6" />}>
                 <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.contentStrategy.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.contentStrategy.description}</p>
                {plan.contentStrategy.contentPillars.map((pillar, i) => (
                    <div key={i} className="mb-4 bg-gray-900/40 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-300 mb-2 text-lg">{pillar.pillar}</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {pillar.ideas.map((idea, j) => <li key={j}>{idea}</li>)}
                        </ul>
                    </div>
                ))}
                 <h4 className="font-semibold text-purple-300 mt-6 mb-2 text-lg">Video Formats:</h4>
                 <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {plan.contentStrategy.videoFormats.map((format, i) => <li key={i}>{format}</li>)}
                    </ul>
              </PlanSection>

              <PlanSection title="Video Ideas" icon={<VideoIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.videoIdeas.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.videoIdeas.description}</p>
                <div className="space-y-3">
                    {plan.videoIdeas.ideas.map((idea, i) => (
                      <div key={i} className="bg-gray-900/40 rounded-lg border border-purple-500/10 overflow-hidden">
                        <button onClick={() => handleIdeaClick(i)} className="w-full p-4 text-left flex justify-between items-center transition-colors hover:bg-gray-800/50">
                          <div>
                            <h4 className="font-semibold text-purple-300">{idea.title}</h4>
                            <p className="text-gray-400 mt-1 text-sm">{idea.description}</p>
                          </div>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${expandedIdeaIndex === i ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                        {expandedIdeaIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 border-t border-purple-500/20">
                                {fetchingDetailsFor === i && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400"><SkeletonLine width="20px" height="20px" className="rounded-full" /> <span>Summoning deeper insights...</span></div>
                                )}
                                {detailsError && (
                                     <p className="text-sm text-red-400">{detailsError}</p>
                                )}
                                {ideaDetails[i] && (
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h5 className="font-semibold text-purple-400 mb-1">Script Outline:</h5>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                {ideaDetails[i].scriptOutline.map((point, j) => <li key={j}>{point}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-purple-400 mb-1">Visual Suggestions:</h5>
                                             <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                {ideaDetails[i].visualSuggestions.map((vis, j) => <li key={j}>{vis}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-gray-800/50 p-2 rounded-md">
                                            <h5 className="font-semibold text-pink-400/80">Suggested CTA:</h5>
                                            <p className="italic text-gray-300">"{ideaDetails[i].cta}"</p>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-purple-400 mb-2">Further Prompts:</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {ideaDetails[i].followUpPrompts.map((prompt, j) => (
                                                    <motion.button
                                                        key={j}
                                                        onClick={() => handleFollowUpPrompt(prompt)}
                                                        className="text-xs font-semibold bg-gray-700/50 text-purple-300 py-1.5 px-3 rounded-full hover:bg-purple-800/60 transition-colors border border-purple-500/20"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title={`Generate new blueprint: "${prompt}"`}
                                                    >
                                                        <span className="flex items-center gap-2"><WandSparklesIcon className="w-3 h-3"/> {prompt}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-purple-400 mb-2">SEO Suggestions:</h5>
                                            <div className="space-y-3 bg-gray-800/50 p-3 rounded-md border border-purple-500/10">
                                                <div className="flex items-start gap-3">
                                                    <KeyIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <h6 className="font-semibold text-gray-300">Keywords</h6>
                                                        <p className="text-gray-400 text-xs">
                                                            {ideaDetails[i].seoSuggestions.keywords.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <TagIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <h6 className="font-semibold text-gray-300">Tags</h6>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {ideaDetails[i].seoSuggestions.tags.map((tag, j) => (
                                                                <span key={j} className="text-xs bg-gray-700/60 text-purple-300 py-0.5 px-2 rounded-full">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <div className="flex items-center gap-2">
                                                        <h6 className="font-semibold text-gray-300">Optimal Length:</h6>
                                                        <p className="text-gray-400 font-mono text-xs bg-gray-900/50 px-2 py-0.5 rounded">{ideaDetails[i].seoSuggestions.optimalLength}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                      </div>
                    ))}
                </div>
              </PlanSection>
              
              <PlanSection title="SEO Optimization Summary" icon={<KeyIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">Consolidated SEO Insights</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                    A quick-scan summary of all generated SEO data for your video ideas. Use these keywords, tags, and length suggestions to maximize discoverability.
                    <br />
                    <span className="text-xs text-purple-400">Note: You must expand an idea in the 'Video Ideas' section above to generate and display its SEO data here.</span>
                </p>

                {(() => {
                    const ideasWithDetails = plan.videoIdeas.ideas
                        .map((idea, index) => ({ idea, details: ideaDetails[index] }))
                        .filter(item => item.details);

                    if (ideasWithDetails.length === 0) {
                        return (
                            <div className="text-center text-gray-500 py-6 bg-gray-900/40 rounded-lg">
                                <p>No SEO data generated yet.</p>
                                <p className="text-sm">Click on a video idea above to reveal its SEO potential.</p>
                            </div>
                        );
                    }

                    return (
                        <div className="space-y-4">
                            {ideasWithDetails.map(({ idea, details }, index) => (
                                <div key={index} className="bg-gray-900/40 p-4 rounded-lg border border-purple-500/10">
                                    <h4 className="font-semibold text-purple-300 text-lg mb-3">{idea.title}</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <KeyIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <h6 className="font-semibold text-gray-300">Keywords</h6>
                                                <p className="text-gray-400 text-xs">
                                                    {details.seoSuggestions.keywords.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <TagIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <h6 className="font-semibold text-gray-300">Tags</h6>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {details.seoSuggestions.tags.map((tag, j) => (
                                                        <span key={j} className="text-xs bg-gray-700/60 text-purple-300 py-0.5 px-2 rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <div className="flex items-center gap-2">
                                                <h6 className="font-semibold text-gray-300">Optimal Length:</h6>
                                                <p className="text-gray-400 font-mono text-xs bg-gray-900/50 px-2 py-0.5 rounded">{details.seoSuggestions.optimalLength}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </PlanSection>

              <PlanSection title="Automation & Workflow" icon={<WandSparklesIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.automationWorkflow.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.automationWorkflow.description}</p>
                <div className="space-y-4">
                    {plan.automationWorkflow.steps.map((step, i) => (
                      <div key={i} className="bg-gray-900/40 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-300">{i + 1}. {step.step}</h4>
                        <p className="text-gray-300 pl-4 my-2">{step.details}</p>
                        <p className="text-sm text-gray-500 pl-4">Tools: {step.tools.join(', ')}</p>
                      </div>
                    ))}
                </div>
              </PlanSection>

              <PlanSection title="Social Media Promotion" icon={<Share2Icon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.socialMediaPromotion.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.socialMediaPromotion.description}</p>
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-purple-300 mb-2 text-lg">
                        <TwitterIcon className="w-5 h-5 text-sky-400" /> Twitter / X Posts:
                    </h4>
                    <ul className="space-y-3 pl-4">
                      {plan.socialMediaPromotion.twitterPosts.map((post, i) => <li key={i} className="bg-gray-900/40 p-3 rounded-md border-l-2 border-sky-400"><p className="text-gray-300 italic">"{post}"</p></li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-purple-300 mb-2 text-lg">
                        <InstagramIcon className="w-5 h-5 text-pink-400" /> Instagram Captions:
                    </h4>
                    <ul className="space-y-3 pl-4">
                      {plan.socialMediaPromotion.instagramCaptions.map((caption, i) => <li key={i} className="bg-gray-900/40 p-3 rounded-md border-l-2 border-pink-400"><p className="text-gray-300 italic">"{caption}"</p></li>)}
                    </ul>
                  </div>
                   <div>
                    <h4 className="flex items-center gap-2 font-semibold text-purple-300 mb-2 text-lg">
                        <TiktokIcon className="w-5 h-5 text-cyan-300" /> TikTok Ideas:
                    </h4>
                    <ul className="space-y-3 pl-4">
                      {plan.socialMediaPromotion.tiktokIdeas.map((idea, i) => <li key={i} className="bg-gray-900/40 p-3 rounded-md border-l-2 border-cyan-300"><p className="text-gray-300 italic">"{idea}"</p></li>)}
                    </ul>
                  </div>
                   <div>
                    <h4 className="flex items-center gap-2 font-semibold text-purple-300 mb-2 text-lg">
                        <FacebookIcon className="w-5 h-5 text-blue-500" /> Facebook Posts:
                    </h4>
                    <ul className="space-y-3 pl-4">
                      {plan.socialMediaPromotion.facebookPosts.map((post, i) => <li key={i} className="bg-gray-900/40 p-3 rounded-md border-l-2 border-blue-500"><p className="text-gray-300 italic">"{post}"</p></li>)}
                    </ul>
                  </div>
                </div>
              </PlanSection>

              <PlanSection title="Traffic Generation" icon={<BarChartIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.trafficGeneration.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.trafficGeneration.description}</p>
                <div className="space-y-4">
                    {plan.trafficGeneration.strategies.map((strategy, i) => (
                      <div key={i} className="bg-gray-900/40 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-300 text-lg">{strategy.strategy}</h4>
                        <p className="text-gray-300 mt-1">{strategy.details}</p>
                      </div>
                    ))}
                </div>
              </PlanSection>

              <PlanSection title="Monetization Methods" icon={<DollarSignIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.monetization.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.monetization.description}</p>
                <div className="space-y-4">
                    {plan.monetization.methods.map((method, i) => (
                     <div key={i} className="bg-gray-900/40 p-4 rounded-lg">
                       <h4 className="font-semibold text-purple-300 text-lg">{method.method}</h4>
                       <p className="text-gray-300 mt-1 mb-3">{method.details}</p>
                       <div className="flex items-center text-sm text-pink-400/80 bg-gray-800/50 p-3 rounded-md">
                           <MegaphoneIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                           <span className="italic">"{method.cta}"</span>
                       </div>
                     </div>
                   ))}
                </div>
              </PlanSection>
              
              <PlanSection title="Merchandise & Offerings" icon={<GiftIcon className="w-6 h-6" />}>
                <h3 className="text-2xl font-bold text-pink-400 mb-2 font-fancy">{plan.merchandiseOfferings.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{plan.merchandiseOfferings.description}</p>
                <div className="space-y-4">
                    {plan.merchandiseOfferings.products.map((product, i) => (
                     <div key={i} className="bg-gray-900/40 p-4 rounded-lg">
                       <h4 className="font-semibold text-purple-300 text-lg">{product.product}</h4>
                       <p className="text-gray-300 mt-1 mb-2">{product.details}</p>
                       <div className="flex items-center text-sm text-pink-400/80">
                           <PrinterIcon className="w-4 h-4 mr-2" />
                           <span>Fulfillment: {product.fulfillment}</span>
                       </div>
                     </div>
                   ))}
                </div>
              </PlanSection>

              <PlanSection title="Rate this Blueprint" icon={<StarIcon className="w-6 h-6" />}>
                {isFeedbackSubmitted ? (
                    <div className="text-center py-4">
                        <p className="text-lg text-green-400 font-fancy">Thank you for your feedback!</p>
                        <p className="text-gray-400">Your insights help the oracle grow wiser.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-lg font-semibold text-gray-300">How helpful was this plan?</p>
                        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setFeedbackRating(star)} onMouseEnter={() => setHoverRating(star)}>
                                    <StarIcon className={`w-8 h-8 cursor-pointer transition-colors ${
                                        (hoverRating || feedbackRating) >= star ? 'text-yellow-400 fill-yellow-400/50' : 'text-gray-600'
                                    }`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full h-24 bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all duration-300 resize-y mt-2"
                            placeholder="Optional comments..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                        />
                        <button
                            onClick={handleSaveFeedback}
                            disabled={feedbackRating === 0}
                            className="font-fancy font-bold bg-purple-600 text-white py-2 px-6 rounded-full shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Feedback
                        </button>
                    </div>
                )}
              </PlanSection>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-900/20 p-6 md:p-8 mb-8 border border-purple-500/20">
          <h3 className="text-3xl font-fancy font-bold mb-4 text-center text-purple-300">Describe Your Channel Idea</h3>
          <p className="text-center text-gray-400 mb-6 max-w-2xl mx-auto">
            Tell the AI oracle what your dream channel is about. The more detail you provide, the more tailored and potent the blueprint will be. Mention your core topics, your target audience, and your unique style.
          </p>
          <textarea
            className="w-full h-40 bg-gray-900/50 border border-purple-500/30 rounded-lg p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all duration-300 resize-y"
            placeholder="e.g., A channel about psychic abilities, tarot readings, and my spiritual art..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            aria-label="Your YouTube channel idea"
          ></textarea>
        </div>
        <div className="text-center">
          <button
            onClick={() => handleGeneratePlan()}
            disabled={isLoading || !request.trim()}
            className="font-fancy text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            <WandSparklesIcon className="w-6 h-6 mr-3" />
            Generate YouTube Blueprint
          </button>
        </div>
      </motion.div>
    );
  };
  
  const ToolkitNavButton: React.FC<{
    view: ToolkitView;
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`relative flex-grow flex items-center justify-center px-4 py-3 font-fancy text-lg font-bold rounded-t-lg transition-colors duration-300
        ${activeView === view
          ? 'text-white bg-gray-800/50'
          : 'text-gray-400 hover:text-white bg-gray-900/50'
        }`}
    >
      <span className="relative z-10 flex items-center">{icon}{label}</span>
      {activeView === view && (
        <motion.div
          layoutId="active-toolkit-indicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </button>
  );

  return (
     <motion.div
        key="toolkit-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold font-fancy text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Creator Toolkit
            </h2>
            <button
              onClick={() => setShowHistory(true)}
              className="font-fancy font-bold bg-gray-800/50 text-purple-300 py-2 px-5 rounded-full shadow-lg hover:shadow-xl hover:bg-purple-900/50 transform transition-all duration-300 ease-in-out flex items-center"
              aria-label="View saved plans"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              History
            </button>
        </div>

        <div className="flex border-b border-purple-500/20 mb-8">
            <ToolkitNavButton view="blueprint" label="Blueprint Generator" icon={<WandSparklesIcon className="w-5 h-5 mr-3"/>} />
            <ToolkitNavButton view="streaming" label="Live Streaming Hub" icon={<RssIcon className="w-5 h-5 mr-3"/>} />
        </div>
          
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start text-left gap-4 text-red-300 bg-red-900/40 p-4 rounded-lg mb-6 border border-red-500/30"
            >
                <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold font-fancy text-lg">Failed to Consult the Oracle</h4>
                    <p className="text-sm text-red-300/80">{error}</p>
                </div>
            </motion.div>
        )}
        
        <AnimatePresence mode="wait">
            {activeView === 'blueprint' && renderBlueprintContent()}
            {activeView === 'streaming' && <StreamingHub />}
        </AnimatePresence>
        
        <AnimatePresence>
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/80 backdrop-blur-md text-white py-3 px-6 rounded-full shadow-lg shadow-purple-900/40 border border-purple-500/30"
                >
                    <CheckIcon className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">{toastMessage}</span>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showHistory && (
              <HistoryPanel 
                plans={savedPlans}
                onLoad={handleLoadPlan}
                onDelete={handleDeletePlan}
                onClose={() => setShowHistory(false)}
              />
            )}
        </AnimatePresence>
      </motion.div>
  );
};

export default ToolkitPage;