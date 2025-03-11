import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'


function MaterialCardItem({ item, studyTypeContent, courseId }) {
    const router = useRouter();
    // Check for content based on type
    const hasContent = item.type === 'notes' 
        ? studyTypeContent.notes.length > 0 
        : item.type === 'quiz'
            ? studyTypeContent.quiz.length > 0
            : studyTypeContent[item.type]?.length > 0
            ? studyTypeContent.notes.length > 0 
            : item.type === 'qna'
                ? studyTypeContent.qna.length > 0
                : studyTypeContent[item.type]?.length > 0
    
    const isDisabled = !hasContent;

    const handleViewClick = () => {
        if (!isDisabled) {
            router.push(`/course/${courseId}/${item.type}`);
        }
    };

    return (
        <div 
            className={`border shadow-md rounded-lg p-5 flex flex-col items-center text-center
                ${isDisabled ? 'opacity-50' : 'hover:shadow-lg transition-shadow cursor-pointer'}`}
            onClick={handleViewClick}
        >
            <div className="flex justify-center">
                <span className={`
                    px-2 py-1 rounded-full text-[8px] mb-3 text-white
                    ${hasContent ? 'bg-green-500' : 'bg-gray-400'}
                `}>
                    {hasContent ? 'Ready' : 'Generating...'}
                </span>
            </div>

            <div className={isDisabled ? 'grayscale' : ''}>
                {item.icon}
            </div>

            <h2 className="font-medium mt-3">{item.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
            
            <Button 
                className="mt-4 w-full"
                variant={hasContent ? 'default' : 'outline'}
                disabled={isDisabled}
                onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick();
                }}
            >
                {hasContent ? 'View' : 'Generating...'}
            </Button>
        </div>
    );
}

export default MaterialCardItem