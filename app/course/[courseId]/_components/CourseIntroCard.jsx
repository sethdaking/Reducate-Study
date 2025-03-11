import React from 'react';
import { BrainCogIcon } from 'lucide-react';

function CourseIntroCard({ course }) {

    
    // Calculate progress percentage
    return (
        <div>
            <BrainCogIcon width={70} height={70} />
            <div className="flex flex-col gap-3 p-10 border shadow-medium rounded-lg">
                <h2 className="font-bold text-2xl">{course?.courseLayout?.course_title}</h2>
                <p>{course?.courseLayout?.summary}</p>
                <h2 className="mt-3 text-lg text-primary">Total Chapters: {totalChapters}</h2>
            </div>
        </div>
    );
}

export default CourseIntroCard;
