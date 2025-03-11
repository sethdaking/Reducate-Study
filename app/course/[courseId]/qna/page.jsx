// app/course/[courseId]/qna/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, RotateCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import QNACard from '../_components/QNACard';

export default function QNAView() {
    const [qnaItems, setQnaItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        fetchQNAContent();
    }, []);

    const fetchQNAContent = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/study-type', {
                courseId: params.courseId
            });

            if (response.data.qna?.length > 0) {
                setQnaItems(response.data.qna);
            } else {
                toast.error('No Q&A content available yet');
                router.push(`/course/${params.courseId}`);
            }
        } catch (error) {
            console.error('Error fetching Q&A content:', error);
            toast.error('Failed to load Q&A content');
            router.push(`/course/${params.courseId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setIsAnswerVisible(false);
        setCurrentIndex((prev) => Math.min(qnaItems.length - 1, prev + 1));
    };

    const handlePrevious = () => {
        setIsAnswerVisible(false);
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
                        Question {currentIndex + 1} of {qnaItems.length}
                    </span>
                </div>

                <QNACard 
                    qnaItem={qnaItems[currentIndex]}
                    isAnswerVisible={isAnswerVisible}
                    onToggle={() => setIsAnswerVisible(!isAnswerVisible)}
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
                        disabled={currentIndex === qnaItems.length - 1}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
