import { GoogleGenAI, Type } from "@google/genai";
import type { YouTubePlan, VideoIdeaDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

export const getPsychicReading = async (question: string) => {
    try {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: question,
            config: {
                systemInstruction: "You are 'The Digital Oracle,' an AI psychic advisor for The Enigma Channel. Your persona is mystical, wise, and slightly enigmatic. Provide short, insightful, and encouraging responses (2-3 sentences max) that feel like a channeled message. Do not break character. Do not mention you are an AI. Frame your answers for entertainment and quick insights. Begin your response without any preamble.",
            },
        });
        return response;
    } catch (error) {
        console.error("Error getting psychic reading:", error);
        throw new Error("The Digital Oracle is currently clouded. Please try again later.");
    }
};


const planSchema = {
    type: Type.OBJECT,
    properties: {
        channelBranding: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                nameIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                taglineIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualIdentity: { type: Type.STRING },
            },
        },
        contentStrategy: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                contentPillars: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            pillar: { type: Type.STRING },
                            ideas: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                    },
                },
                videoFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        videoIdeas: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                ideas: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        automationWorkflow: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.STRING },
                            details: { type: Type.STRING },
                            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                    },
                },
            },
        },
        socialMediaPromotion: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                twitterPosts: { type: Type.ARRAY, items: { type: Type.STRING } },
                instagramCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                tiktokIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                facebookPosts: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        trafficGeneration: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                strategies: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            strategy: { type: Type.STRING },
                            details: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        monetization: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                methods: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            method: { type: Type.STRING },
                            details: { type: Type.STRING },
                            cta: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        merchandiseOfferings: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                products: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            product: { type: Type.STRING },
                            details: { type: Type.STRING },
                            fulfillment: { type: Type.STRING },
                        },
                    },
                },
            },
        },
    },
};

export const generateYouTubePlan = async (request: string): Promise<YouTubePlan> => {
    const prompt = `Analyze the following request for a new YouTube channel and generate a comprehensive business and content plan. The channel will focus on psychic abilities, tarot, art, and "witchy" topics. Provide actionable strategies for content, automation, traffic, and monetization. For each monetization method, also provide a specific, actionable call to action (CTA) that the creator can use in their videos. Generate a dedicated section with 5-7 specific, creative, and trend-aware video ideas, each with an engaging title and a brief description. Also generate a social media promotion plan with specific post ideas for Twitter, Instagram, TikTok, and Facebook to drive traffic to the YouTube channel. Finally, suggest a list of merchandise and sacred offerings the creator could sell. For each item, suggest a practical fulfillment method (e.g., 'Print-on-Demand' for custom tarot decks and art, 'Handmade', 'Dropshipping' for crystals). Ensure the entire plan is detailed, practical, and inspiring.

    User's Request: "${request}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are a world-class YouTube growth strategist and content automation expert with a deep understanding of esoteric and spiritual niches. Your goal is to create a comprehensive, actionable plan for launching and growing a successful YouTube channel. The plan should be structured, detailed, and encouraging. Respond in the requested JSON format.",
                responseMimeType: "application/json",
                responseSchema: planSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedPlan = JSON.parse(jsonText) as YouTubePlan;
        
        return parsedPlan;

    } catch (error) {
        console.error("Error generating YouTube plan with Gemini:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError' || error.message.toLowerCase().includes('json')) {
                throw new Error("The AI's response was not in the expected format. This can be a temporary issue. Please try generating the plan again.");
            }
            if (error.message.toLowerCase().includes('api key')) {
                throw new Error("There is an issue with the AI service configuration. Please contact support.");
            }
            throw new Error("The digital oracle is currently unavailable. Please check your connection and try again in a few moments.");
        }
        throw new Error("An unknown error occurred while generating the plan. Please try again.");
    }
};

const videoIdeaDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        scriptOutline: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key talking points or a brief script outline." },
        visualSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ideas for B-roll, on-screen graphics, or filming style." },
        cta: { type: Type.STRING, description: "A specific call-to-action for the end of this video." },
        followUpPrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Related prompts for further AI generation." },
        seoSuggestions: {
            type: Type.OBJECT,
            properties: {
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-7 relevant SEO keywords." },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 10-15 relevant YouTube tags." },
                optimalLength: { type: Type.STRING, description: "A suggestion for the optimal video length, e.g., '8-12 minutes'." },
            }
        }
    }
};

export const getVideoIdeaDetails = async (channelRequest: string, videoTitle: string, videoDescription: string): Promise<VideoIdeaDetails> => {
    const prompt = `Based on a YouTube channel concept described as "${channelRequest}", expand on the following video idea:
    - Title: "${videoTitle}"
    - Description: "${videoDescription}"

    Generate a detailed breakdown for this video. Provide:
    1.  A brief script outline with 3-5 key talking points.
    2.  3-4 suggestions for visuals, B-roll, or on-screen graphics.
    3.  A specific call-to-action (CTA) suitable for the end of this video.
    4.  2-3 related prompts that could be used to generate more content with another AI.
    5.  A set of SEO suggestions including: a list of 5-7 relevant keywords, a list of 10-15 relevant YouTube tags, and a suggestion for the optimal video length (e.g., "8-12 minutes").

    Keep the response concise and actionable.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are a creative YouTube producer and SEO expert. Your task is to flesh out a video concept with practical, creative details and actionable SEO advice to improve discoverability. Respond in the requested JSON format.",
                responseMimeType: "application/json",
                responseSchema: videoIdeaDetailsSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as VideoIdeaDetails;
    } catch (error) {
        console.error("Error generating video idea details:", error);
        throw new Error("The oracle could not provide deeper insights for this idea. Please try again.");
    }
};