// app/course/[courseId]/qna/loading.jsx

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-10 w-1/3 mb-6" />
      <Skeleton className="h-12 w-full mb-6" />
      
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="mb-4">
          <Skeleton className="h-16 w-full mb-2" />
        </div>
      ))}
    </div>
  );
}
