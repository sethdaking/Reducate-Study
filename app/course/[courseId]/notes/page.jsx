'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Home } from 'lucide-react'
import ChapterTable from '../_components/ChapterTable'

function ViewNotes() {
    const [notes, setNotes] = useState([])
    const [selectedChapter, setSelectedChapter] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        getNotes()
    }, [])

    const getNotes = async () => {
        try {
            const result = await axios.post('/api/notes', {
                courseId: params.courseId
            })
            const sortedNotes = result.data.notes.sort((a, b) => a.chapterId - b.chapterId)
            setNotes(sortedNotes)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching notes:', error)
            setLoading(false)
        }
    }

    const handleChapterClick = (chapter, index) => {
        setSelectedChapter(chapter)
        setCurrentIndex(index)
    }

    const handleBack = () => {
        setSelectedChapter(null)
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedChapter(notes[currentIndex - 1])
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentIndex < notes.length - 1) {
            setSelectedChapter(notes[currentIndex + 1])
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handleReturnToCourse = () => {
        router.push(`/course/${params.courseId}`)
    }

    const cleanContent = (content) => {
        if (!content) return ''; // If content is null or undefined, return empty string
        
        // Your existing cleaning logic
        let cleanedContent = content
            .replace(/examNotes|revisionNotes|studyNotes/g, '') // Remove unwanted tags
            .replace(/{\s*"\s*"\s*:\s*"\s*"\s*}/g, ''); // Remove empty key-value pairs
        
        return cleanedContent;
    }

    const formatContent = (content) => {
        if (!content) return '';
        
        // Clean up the content before further processing
        let cleanedContent = cleanContent(content);
      
        // Convert markdown to HTML
        let html = cleanedContent
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/^\* (.*$)/gm, '<li>$1</li>')
          .replace(/^- (.*$)/gm, '<li>$1</li>')
          .replace(/^-("": ")/gm, '')
          .replace(/^-("})/g, '')
          .split(/\n\s*\n/)
          .map(para => para.trim())
          .filter(para => para.length > 0)
          .map(para => {
            if (para.startsWith('<')) return para;
            if (para.startsWith('* ') || para.startsWith('- ')) {
              return `<ul>${para}</ul>`;
            }
            return `<p>${para}</p>`;
          })
          .join('');
      
        // Apply Tailwind styles
        return html
          .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-primary mb-6 mt-8">')
          .replace(/<h2>/g, '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-6">')
          .replace(/<h3>/g, '<h3 class="text-xl font-medium text-gray-700 mb-3 mt-5">')
          .replace(/<p>/g, '<p class="text-gray-600 leading-relaxed mb-4">')
          .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 space-y-2 text-gray-600">')
          .replace(/<li>/g, '<li class="leading-relaxed">')
          .replace(/<pre>/g, '<pre class="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto font-mono">')
          .replace(/<code>/g, '<code class="bg-gray-100 text-gray-800 rounded px-1 py-0.5 font-mono text-sm">');
      }
    
    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <Card className="p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={`loading-${i}`} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-8">
            <Card className="p-6">
                {selectedChapter ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <Button 
                                variant="ghost"
                                onClick={handleBack}
                                className="text-primary hover:bg-primary/10 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Chapters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleReturnToCourse}
                                className="flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" /> Return to Course
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <span className="text-3xl">{selectedChapter.emoji}</span>
                            <h2 className="text-2xl font-bold text-primary">
                                {selectedChapter.chapterTitle}
                            </h2>
                        </div>

                        <div 
                            className="prose prose-lg max-w-none mb-8"
                            dangerouslySetInnerHTML={{ 
                                __html: selectedChapter ? formatContent(selectedChapter.notes) : ''  // Check if selectedChapter is defined
                            }}
                        />

                        <div className="flex items-center justify-between mt-8 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                                Chapter {currentIndex + 1} of {notes.length}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleNext}
                                disabled={currentIndex === notes.length - 1}
                                className="flex items-center gap-2"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-primary">
                                Course Chapters
                            </h1>
                            <Button
                                variant="outline"
                                onClick={handleReturnToCourse}
                                className="flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" /> Return to Course
                            </Button>
                        </div>
                        <ChapterTable 
                            chapters={notes} 
                            onChapterClick={handleChapterClick}
                        />
                    </>
                )}
            </Card>
        </div>
    )
}

export default ViewNotes
