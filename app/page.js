'use client'
import React, { useState, useEffect } from 'react';
import WelcomeBanner from '@/app/dashboard/_components/WelcomeBanner';
import CourseList from '@/app/dashboard/_components/CourseList';
import WelcomePopup from '@/app/dashboard/_components/WelcomePopup';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    // Show the welcome popup only if it hasn’t been shown in this session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcomePopup(true);
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <div>
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      <WelcomeBanner />
      <CourseList searchQuery={searchQuery} />
    </div>
  );
}

export default Dashboard;
