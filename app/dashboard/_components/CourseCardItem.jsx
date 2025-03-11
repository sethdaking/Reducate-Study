import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { BrainCogIcon, RefreshCw } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'

function CourseCardItem({ course }) {
  // Get today's date in the desired format (e.g., "DD MMM YYYY")
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className='p-5 border rounded-lg shadow-lg'>
      <div>
        <div className='flex items-center justify-between'>
          <BrainCogIcon width={50} height={50} />
          {/* Display today's date */}
          <h2 className='text-[10px] p-1 px-2 rounded-full bg-primary text-white'>
            {formattedDate}
          </h2>
        </div>
        <h2 className='mt-3 font-medium text-lg'>
          {course?.courseLayout?.course_name}
        </h2>
        <p className='text-sm line-clamp-2 text-gray-500 mt-2'>
          {course?.courseLayout?.course_summary}
        </p>

        <div className='mt-3 flex justify-end'>
          {course?.status === 'Generating' ? (
            <h2 className='text-sm p-1 px-2 flex gap-2 items-center rounded-full bg-gray-500 text-white'>
              <RefreshCw className='h-5 w-5 animate-spin' />
              Generating...
            </h2>
          ) : (
            <Link href={`/course/${course?.courseId}`}>
              <Button>View</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCardItem;
