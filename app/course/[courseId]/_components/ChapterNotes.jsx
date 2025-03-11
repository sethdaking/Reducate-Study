import React from 'react';
import { Card } from '@/components/ui/card';

function ChapterNotes({ note }) {
    return (
        <Card className="p-6 mb-8 shadow-lg border border-gray-200">
            {/* Title Row with Emoji */}
            <div className="flex items-center gap-3 mb-2">
                {note.emoji && <span className="text-3xl">{note.emoji}</span>}
                <h2 className="text-xl font-bold text-primary">{note.chapterTitle}</h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-4">Chapter {note.chapterId + 1}</p>

            {/* Notes Content */}
            <div className="prose prose-lg max-w-none">
                <div 
                    dangerouslySetInnerHTML={{ 
                        __html: note.notes
                            .replace(/<h1/g, '<h1 class="text-2xl font-bold mb-4 text-primary"')
                            .replace(/<h2/g, '<h2 class="text-xl font-semibold mb-3 mt-6"')
                            .replace(/<h3/g, '<h3 class="text-lg font-medium mb-2 mt-4"')
                            .replace(/<p>/g, '<p class="mb-4 text-gray-700">')
                            .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 space-y-2">')
                            .replace(/<ol>/g, '<ol class="list-decimal pl-6 mb-4 space-y-2">')
                            .replace(/<li>/g, '<li class="text-gray-700">')
                            .replace(/<code>/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">')
                    }} 
                />
            </div>
        </Card>
    );
}

export default ChapterNotes;
