'use client'
import React, { useState } from 'react';
import WelcomeBanner from '@/app/dashboard/_components/WelcomeBanner';
import CourseList from '@/app/dashboard/_components/CourseList';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <WelcomeBanner />
      <CourseList searchQuery={searchQuery} />
    </div>
  );
}

export default Dashboard;
