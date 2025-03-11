import React from 'react'

function ChapterList({ course, loading }) {
    if (loading) {
        return (
            <div className="mt-5 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="mt-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                        <div className="p-4 border shadow-md rounded-lg flex flex-col gap-2">
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                            <div className="h-4 w-96 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const chapters = course?.courseLayout?.chapters || []

    return (
        <div className="mt-5">
            <h2 className="font-medium text-xl">Chapters</h2>
            <div>
                {chapters.map((chapter, index) => (
                    <div key={index} className="mt-3">
                        <div className="p-4 border shadow-md rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            {/* Title & Emoji on the same line */}
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-2xl">{chapter?.emoji || '📚'}</span>
                                <h2 className="font-medium text-lg">{chapter?.chapter_title || `Chapter ${index + 1}`}</h2>
                            </div>
                            {/* Description Below */}
                            <p className="text-gray-500 text-sm mt-3">
                                {chapter?.chapter_summary || 'No summary available'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChapterList
