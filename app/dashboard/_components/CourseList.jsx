'use client'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import CourseCardItem from './CourseCardItem'
import { RefreshCw } from 'lucide-react'

function CourseList() {
    const { user } = useUser()
    const [courseList, setCourseList] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const coursesPerPage = 6  // Number of courses per page

    useEffect(() => {
        if (user) {
            GetCourseList()
        }
    }, [user])

    const GetCourseList = async () => {
        try {
            setLoading(true)
            const result = await axios.post('/api/courses', {
                createdBy: user?.primaryEmailAddress?.emailAddress
            });
            setCourseList(result.data.result);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter courses based on searchQuery
    const filteredCourses = courseList.filter(course =>
        course?.courseLayout?.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Pagination Logic
    const indexOfLastCourse = currentPage * coursesPerPage
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)

    return (
        <div>
            <h2 className='font-bold text-2xl mt-10 flex items-center justify-between'>
                Your Study Material
                <Button 
                    variant='outline'
                    onClick={GetCourseList} 
                    className='border-primary text-primary flex items-center gap-2'
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> 
                    Refresh
                </Button>
            </h2>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);  // Reset to first page on search
                }}
                className="w-full p-2 mt-3 border rounded-md"
            />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-5'>
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <div key={index} className="p-5 border rounded-lg shadow-lg animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"/>
                                <div className="w-20 h-6 bg-gray-200 rounded-full"/>
                            </div>
                            <div className="mt-3 w-3/4 h-6 bg-gray-200 rounded"/>
                            <div className="mt-2 space-y-2">
                                <div className="w-full h-4 bg-gray-200 rounded"/>
                                <div className="w-2/3 h-4 bg-gray-200 rounded"/>
                            </div>
                            <div className="mt-3">
                                <div className="w-full h-2 bg-gray-200 rounded"/>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <div className="w-16 h-8 bg-gray-200 rounded"/>
                            </div>
                        </div>
                    ))
                ) : (
                    currentCourses.length > 0 ? (
                        currentCourses.map((course, index) => (
                            <CourseCardItem course={course} key={index} />
                        ))
                    ) : (
                        <p className="col-span-3 text-center mt-4 text-gray-500">No courses found.</p>
                    )
                )}
            </div>

            {/* Pagination Controls */}
{totalPages > 1 && (
    <div className="flex w-full mt-10 items-center justify-center">
        <Button 
            variant="outline"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex-1 mx-5"
        >
            Previous
        </Button>
        <span className="px-6 py-2 text-lg font-medium">
            Page {currentPage} of {totalPages}
        </span>
        <Button 
            variant="outline"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex-1 mx-5"
        >
            Next
        </Button>
    </div>
)}
        </div>
    )
}

export default CourseList
