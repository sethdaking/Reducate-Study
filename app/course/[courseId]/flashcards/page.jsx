'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, RotateCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import FlashCard from '../_components/FlashCard';

export default function FlashcardsView() {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/study-type', {
                courseId: params.courseId
            });

            if (response.data.flashcards?.length > 0) {
                setFlashcards(response.data.flashcards);
            } else {
                toast.error('No flashcards available yet');
                router.push(`/course/${params.courseId}`);
            }
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            toast.error('Failed to load flashcards');
            router.push(`/course/${params.courseId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <Card className="p-6 min-h-[400px] animate-pulse">
                    <div className="h-full flex items-center justify-center">
                        <RotateCw className="w-8 h-8 animate-spin text-primary/30" />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button 
                        variant="ghost"
                        onClick={() => router.push(`/course/${params.courseId}`)}
                        className="text-primary hover:bg-primary/10"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                    <span className="text-sm text-gray-500">
                        Card <strong className="font-bold text-primary">{currentIndex + 1}</strong> of <strong className="font-bold text-primary">{flashcards.length}</strong>
                    </span>
                </div>

                <FlashCard 
                    flashcard={flashcards[currentIndex]}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                />

                <div className="flex items-center justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
