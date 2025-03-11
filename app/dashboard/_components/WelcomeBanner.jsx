'use client'
import React from 'react'
import { useUser } from '@clerk/nextjs';
import { Globe } from 'lucide-react'; // Icon from lucide-react

function WelcomeBanner() {
    const { user } = useUser();

  return (
    <div className="p-6 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center gap-6 shadow-md">
        <Globe className="h-12 w-12 text-slate-300" /> {/* Icon in slate color */}
        <div className="text-center">
            <h2 className="font-bold text-3xl text-white">Hello, {user?.fullName}</h2>
            <p className="text-slate-300">It's time to get started with your gamification process</p>
        </div>
    </div>
  )
}

export default WelcomeBanner
