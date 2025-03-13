"use client";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon, XIcon, LayoutDashboard, UserCircle } from "lucide-react"; // Added icons
import Link from "next/link";
import { Button } from "@/components/ui/button"; // SHADCN Button
import { usePathname } from "next/navigation"; // to manage active states
import { GiPodiumWinner } from "react-icons/gi";

function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current pathname

  // Handle body overflow when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup on component unmount or isOpen change
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define menu items for the sidebar
  const MenuList = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Profile",
      icon: UserCircle,
      path: "/profile",
    },
    {
      name: "Leaderboard",
      icon: GiPodiumWinner,
      path: "/leaderboard",
    }
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile toggle button */}
            <button className="flex items-center justify-center p-2 mr-10 bg-white" onClick={toggleSidebar}>
              {isOpen ? (
                <XIcon className="h-6 w-6 text-gray-700" /> // XIcon for closing
              ) : (
                <MenuIcon className="h-6 w-6 text-gray-700" /> // Hamburger menu for opening
              )}
            </button>
            {/* Title - Reducate */}
            <h1 className="text-xl font-bold text-gray-700">Reducate</h1>
          </div>

          {/* DarkMode toggle and User button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <SignedIn>
              <UserButton />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="default">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut> {/* User Button */}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-[1000px] shadow-md bg-white ${
          isOpen ? "transform translate-x-0" : "transform -translate-x-full"
        } transition-transform duration-300 ease-in-out`} // Sidebar transition
      >
        {/* Close Button inside the sidebar */}
        <div className="flex justify-end p-4">
          <button onClick={toggleSidebar}>
            <XIcon className="h-6 w-6 text-gray-700" /> {/* X icon inside sidebar to close */}
          </button>
        </div>

        {/* Mobile Sidebar content */}
        <div className="p-5 bg-white">
          {MenuList.map((menu, index) => (
            <Link
              key={index}
              href={menu.path}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md mt-3 ${
                pathname === menu.path ? "bg-gray-200" : ""
              }`}
            >
              <menu.icon className="h-5 w-5" />
              <span className="ml-3">{menu.name}</span>
            </Link>
          ))}
          <Link href="/create" className="block p-2 mt-5">
            <Button variant="outline" className="w-full">
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Apply overlay when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black opacity-50 ${isOpen ? "block" : "hidden"} z-30`}
        onClick={toggleSidebar}
      ></div>
    </header>
  );
}

export default DashboardHeader;
