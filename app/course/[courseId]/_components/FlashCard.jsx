import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

function FlashCard({ flashcard, isFlipped, onFlip }) {
    // Function to replace *(variable text)* with bold and text-primary
    const formatText = (text) => {
        return text.replace(/\*\((.*?)\)\*/g, '<strong class="font-bold text-primary">$1</strong>');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl mx-auto" // Added width control
        >
            <Card 
                className="p-8 cursor-pointer min-h-[500px] max-h-[600px] hover:shadow-lg transition-shadow relative" 
                onClick={onFlip}
            >
                <div className="absolute inset-0 w-full h-full perspective-1000">
                    <div 
                        className={`
                            relative w-full h-full transition-transform duration-500 transform-style-3d
                            ${isFlipped ? 'rotate-y-180' : ''}
                        `}
                    >
                        {/* Front of card */}
                        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl border-2 border-primary/20">
                            <div className="h-full flex flex-col items-center p-8">
                                <strong className="text-lg text-primary/60 mb-6">Question</strong>
                                <ScrollArea className="flex-1 w-full px-4">
                                    <div className="text-center max-w-2xl mx-auto">
                                        <div 
                                            className="text-lg text-gray-800 flashcard-content"
                                            dangerouslySetInnerHTML={{ __html: formatText(flashcard.front) }}
                                        />
                                    </div>
                                </ScrollArea>
                                <strong className="text-sm text-gray-400 mt-6">Click to flip</strong>
                            </div>
                        </div>

                        {/* Back of card */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-primary/5 rounded-xl border-2 border-primary/20">
                            <div className="h-full flex flex-col items-center p-8">
                                <strong className="text-lg text-primary/60 mb-6">Answer</strong>
                                <ScrollArea className="flex-1 w-full px-4">
                                    <div className="text-center max-w-3xl mx-auto">
                                        <div 
                                            className="text-md text-gray-800 flashcard-content"
                                            dangerouslySetInnerHTML={{ __html: formatText(flashcard.back) }}
                                        />
                                    </div>
                                </ScrollArea>
                                <strong className="text-sm text-gray-400 mt-6">Click to flip back</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default FlashCard;
