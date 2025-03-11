'use client'
import React, { useEffect, useState, use } from 'react'
import ChapterList from './_components/ChapterList'
import { Progress } from '@/components/ui/progress'
import { BrainCogIcon } from 'lucide-react'
import axios from 'axios'
import StudyMaterialSection from './_components/StudyMaterialSection'

function CoursePage({ params }) {
    const courseId = use(params).courseId
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)

    const getCourse = async () => {
        try {
            setLoading(true)
            const result = await axios.post('/api/get-course', {
                courseId: courseId
            })
            setCourse(result.data.result)
        } catch (error) {
            console.error('Error fetching course:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getCourse()
    }, [courseId])

    if (loading) {
        return (
            <div className='max-w-3xl mx-auto p-5'>
                <div className='flex gap-5 items-start'>
                    <div className='h-12 w-12 bg-gray-200 rounded-lg animate-pulse'/>
                    <div className='w-full'>
                        <div className='h-8 bg-gray-200 rounded-lg w-[40%] animate-pulse'/>
                        <div className='h-4 bg-gray-200 rounded-lg w-[80%] animate-pulse mt-4'/>
                        <div className='h-4 bg-gray-200 rounded-lg w-[60%] animate-pulse mt-3'/>
                        <div className='mt-5'>
                            <div className='h-2 bg-gray-200 rounded-lg w-full animate-pulse'/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-3xl mx-auto p-5'>
            <div className='flex gap-5 items-start'>
                <BrainCogIcon className='w-12 h-12'/>
                <div className='w-full'>
                    <div>
                        <h2 className='text-2xl font-bold'>{course?.courseLayout?.course_name}</h2>
                        <p className='text-gray-500 mt-1 text-sm'>{course?.courseLayout?.course_summary}</p>
                    </div>
                    <div className='mt-5'>
                        {/* Dividing Line */}
                        <div className='border-t border-gray-300 mt-5'></div>
                    </div>
                </div>
            </div>
            {/* Study Material Section */}
            <StudyMaterialSection course={course} loading={loading} courseId={courseId}/>
            
            {/* Dividing Line Between Sections */}
            <div className='border-t border-gray-300 my-5'></div>

            {/* Chapter List */}
            <ChapterList course={course} loading={loading}/>
        </div>
    )
}

export default CoursePage
