'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

function Create() {
    const [formData, setFormData] = useState({
        topic: '',
        courseType: '',
        difficultyLevel: ''
    })
    const [loading, setLoading] = useState(false)
    const { user } = useUser()
    const router = useRouter()

    const handleUserInput = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }))
    }

    const GenerateCourseOutline = async () => {
        try {
            if (!formData.topic || !formData.courseType || !formData.difficultyLevel) {
                toast.error("Please fill in all fields");
                return;
            }

            setLoading(true);
            const courseId = uuidv4();
    
            const result = await axios.post('/api/generate-course-outline', {
                courseId,
                ...formData,
                createdBy: user?.primaryEmailAddress?.emailAddress
            });
    
            if (!result.data?.success) {
                throw new Error('Course generation failed');
            }

            toast.success("Course content is being generated!");
            router.push('/');
    
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(error.response?.data?.error || "Failed to generate course content");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className='flex flex-col items-center p-5 md:px-24 lg:px-36 mt-20'>
            <h2 className='font-bold text-4xl text-primary'>Start Generating Your Study Material</h2>
            <p className='text-gray-500 text-lg'>Fill all the details</p>

            <div className='w-full max-w-xl mt-8 space-y-6'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Topic</label>
                    <Textarea
                        placeholder="Enter the topic you want to study"
                        value={formData.topic}
                        onChange={(e) => handleUserInput('topic', e.target.value)}
                    />
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Course Type</label>
                    <Select
                        value={formData.courseType}
                        onValueChange={(value) => handleUserInput('courseType', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Exam">Exam</SelectItem>
                            <SelectItem value="Study">Study</SelectItem>
                            <SelectItem value="Revision">Revision</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Difficulty Level</label>
                    <Select
                        value={formData.difficultyLevel}
                        onValueChange={(value) => handleUserInput('difficultyLevel', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={GenerateCourseOutline}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Generating..." : "Generate Course"}
                </Button>
            </div>
        </div>
    )
}

export default Create