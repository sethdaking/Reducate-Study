'use client'
import React, { useEffect, useState } from 'react'
import MaterialCardItem from './MaterialCardItem'
import { BookOpen, Book, BrainCircuit, MessagesSquare } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const materials = [
    {
        type: 'notes',
        name: 'Study Notes',
        description: 'Comprehensive notes from your course content',
        icon: <BookOpen className="w-10 h-10 text-primary" />
    },
    {
        type: 'flashcards',
        name: 'Flashcards',
        description: 'Interactive flashcards for quick revision',
        icon: <Book className="w-10 h-10 text-primary" />
    },
    {
        type: 'quiz',
        name: 'Quiz',
        description: 'Test your knowledge with practice questions',
        icon: <BrainCircuit className="w-10 h-10 text-primary" />
    },

]

const StudyMaterialSection = ({ courseId }) => {
    const [studyTypeContent, setStudyTypeContent] = useState({
        notes: [],
        flashcards: [],
        quiz: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (courseId) {
            getStudyMaterial()
        }
    }, [courseId])

    const getStudyMaterial = async () => {
        try {
            setLoading(true)
            console.log("Fetching study materials for courseId:", courseId)
            
            const result = await axios.post('/api/study-type', { courseId })
            console.log("Study material response:", result.data)
            
            setStudyTypeContent({
                notes: result.data.notes || [],
                flashcards: result.data.flashcards || [],
                quiz: result.data.quiz || [],
            })
        } catch (error) {
            console.error('Error:', error)
            toast.error("Failed to load study materials")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"/>
                        <div className="mt-4 h-10 w-10 bg-gray-200 rounded-full mx-auto"/>
                        <div className="mt-3 h-4 bg-gray-200 rounded w-3/4 mx-auto"/>
                        <div className="mt-2 h-3 bg-gray-200 rounded w-full"/>
                        <div className="mt-4 h-9 bg-gray-200 rounded w-full"/>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {materials.map((material, index) => (
                <MaterialCardItem 
                    key={index}
                    item={material}
                    studyTypeContent={studyTypeContent}
                    courseId={courseId}
                />
            ))}
        </div>
    )
}

export default StudyMaterialSection