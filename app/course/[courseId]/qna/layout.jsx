// app/course/[courseId]/qna/layout.jsx

import React from 'react';
import { CourseNavbar } from '@/components/course-navbar';

export default function QNALayout({ children }) {
  return (
    <div>
      <CourseNavbar />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
