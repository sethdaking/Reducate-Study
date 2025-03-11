// app/course/[courseId]/_components/QNACard.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function QNACard({ qnaItem, isAnswerVisible, onToggle }) {
    if (!qnaItem) {
        return null;
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="p-6 bg-white">
                    <h3 className="text-xl font-medium mb-4">{qnaItem.question}</h3>
                    
                    <Button 
                        onClick={onToggle}
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                    >
                        {isAnswerVisible ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Hide Answer
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Show Answer
                            </>
                        )}
                    </Button>
                </div>

                {isAnswerVisible && (
                    <div className="p-6 bg-gray-50 border-t">
                        <div className="prose max-w-none">
                            <p>{qnaItem.answer}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
