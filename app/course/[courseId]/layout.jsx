import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

function CourseViewLayout({ children }) {
  return (
    <div>
      <div className="mx-10 md:mx-36 lg:px-44 mt-10">
        {/* Back to Dashboard Button */}
        <Link href="/">
          <Button variant="outline" className="mb-6">
            ← Back to Dashboard
          </Button>
        </Link>

        {children}
      </div>
    </div>
  );
}

export default CourseViewLayout;
