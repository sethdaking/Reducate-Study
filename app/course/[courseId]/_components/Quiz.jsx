import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Quiz({
    question,
    selectedAnswer,
    onAnswerSelect,
    showFeedback,
    currentQuestion,
    totalQuestions
}) {
    // Convert letter answer to index (A=0, B=1, etc)
    const correctIndex = question.correctAnswer.charCodeAt(0) - 65;

    return (
        <Card className="p-8 mb-8">
            <div className="space-y-6">
                {/* Question Header */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Question {currentQuestion} of {totalQuestions}</span>
                        <span>{Math.round((currentQuestion / totalQuestions) * 100)}% Complete</span>
                    </div>
                    <div 
                        className="text-xl font-medium text-primary"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                    />
                </div>

                {/* Options */}
                <div className="grid gap-3">
                    {question.options.map((option, index) => (
                        <Button
                            key={index}
                            variant={getOptionVariant(index, selectedAnswer, correctIndex, showFeedback)}
                            className={cn(
                                "w-full min-h-[3.5rem] h-auto py-3 px-4",
                                "flex items-start",
                                "whitespace-normal text-left",
                                "transition-all duration-200",
                                showFeedback && getOptionClasses(index, correctIndex)
                            )}
                            onClick={() => !showFeedback && onAnswerSelect(index)}
                            disabled={showFeedback}
                        >
                            <span className="mr-3 flex-shrink-0">
                                {String.fromCharCode(65 + index)}.
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: option }} />
                        </Button>
                    ))}
                </div>

                {/* Feedback */}
                {showFeedback && (
                    <div className={cn(
                        "mt-4 p-4 rounded-lg",
                        selectedAnswer === correctIndex 
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    )}>
                        <p className="font-medium mb-2">
                            {selectedAnswer === correctIndex ? "Correct!" : "Incorrect"}
                        </p>
                        <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: question.explanation }}
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function getOptionVariant(index, selected, correct, showFeedback) {
    if (!showFeedback) return selected === index ? "secondary" : "outline";
    if (index === correct) return "success";
    if (selected === index) return "destructive";
    return "outline";
}

function getOptionClasses(index, correctAnswer) {
    return index === correctAnswer ? "border-green-500 bg-green-50/50" : "";
}