'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Home, ArrowRight, Trophy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Quiz from '../_components/Quiz';

export default function QuizView() {
    const [quiz, setQuiz] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [loading, setLoading] = useState(true);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [results, setResults] = useState({
        correct: 0,
        incorrect: 0,
        score: 0,
        answers: [],
        timeStarted: new Date(),
        timeCompleted: null
    });

    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/study-type', {
                courseId: params.courseId
            });

            if (response.data.quiz?.length > 0) {
                setQuiz(response.data.quiz);
            } else {
                toast.error('No quiz available yet');
                router.push(`/course/${params.courseId}`);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz');
            router.push(`/course/${params.courseId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (index) => {
        const isCorrect = index === (quiz[currentIndex].correctAnswer.charCodeAt(0) - 65);
        
        setResults(prev => {
            const newCorrect = prev.correct + (isCorrect ? 1 : 0);
            const newIncorrect = prev.incorrect + (isCorrect ? 0 : 1);
            
            return {
                ...prev,
                correct: newCorrect,
                incorrect: newIncorrect,
                score: Math.round((newCorrect / quiz.length) * 100),
                answers: [...prev.answers, {
                    questionIndex: currentIndex,
                    selectedAnswer: String.fromCharCode(65 + index),
                    correctAnswer: quiz[currentIndex].correctAnswer,
                    isCorrect
                }]
            };
        });

        setSelectedAnswer(index);
        setShowFeedback(true);
    };

    const handleNext = async () => {
        if (currentIndex === quiz.length - 1) {
            const timeCompleted = new Date();
            
            try {
                const updatedResults = {
                    ...results,
                    timeCompleted,
                    totalQuestions: quiz.length
                };
                
                setResults(updatedResults); // Ensure results state is updated
                await axios.post('/api/quiz-results', {
                    courseId: params.courseId,
                    results: updatedResults
                });
                
                setQuizCompleted(true);
                toast.success('Quiz completed! Results saved.');
            } catch (error) {
                console.error('Error saving results:', error);
                toast.error('Failed to save results');
            }
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <Card className="p-8 max-w-3xl mx-auto">
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                </Card>
            </div>
        );
    }

    if (quizCompleted) {
        return (
            <div className="container mx-auto p-8">
                <Card className="p-8 max-w-2xl mx-auto">
                    <div className="text-center space-y-6">
                        <Trophy className="w-16 h-16 text-primary mx-auto" />
                        <h2 className="text-2xl font-bold text-primary">Quiz Completed!</h2>
                        <div className="space-y-4">
                            <p className="text-4xl font-bold text-primary">{results.score}%</p>
                            <Progress value={results.score} className="w-full h-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-green-600">Correct</p>
                                    <p className="text-2xl font-bold text-green-700">{results.correct}</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-red-600">Incorrect</p>
                                    <p className="text-2xl font-bold text-red-700">{results.incorrect}</p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            onClick={() => router.push(`/course/${params.courseId}`)}
                            className="mt-6"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return to Course
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Button 
                        variant="ghost"
                        onClick={() => router.push(`/course/${params.courseId}`)}
                        className="text-primary hover:bg-primary/10"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                </div>

                <Progress 
                    value={((currentIndex + 1) / quiz.length) * 100} 
                    className="mb-8"
                />

                <Quiz
                    question={quiz[currentIndex]}
                    selectedAnswer={selectedAnswer}
                    onAnswerSelect={handleAnswerSelect}
                    showFeedback={showFeedback}
                    currentQuestion={currentIndex + 1}
                    totalQuestions={quiz.length}
                />

                {showFeedback && (
                    <div className="flex justify-end">
                        <Button onClick={handleNext}>
                            {currentIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}