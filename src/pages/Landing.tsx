import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';

export default function Landing() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">DukaManager</h1>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="#about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="#contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <div className="flex space-x-4">
              <Button
                variant={showSignIn ? "default" : "outline"}
                onClick={() => setShowSignIn(true)}
              >
                Sign In
              </Button>
              <Button
                variant={!showSignIn ? "default" : "outline"}
                onClick={() => setShowSignIn(false)}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Left side - Content */}
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 md:pr-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Manage Your Shop Efficiently
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Track inventory, manage sales, and grow your business with DukaManager's comprehensive shop management system.
          </p>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full md:w-1/2 max-w-md">
          {showSignIn ? <SignIn /> : <SignUp />}
        </div>
      </div>
    </div>
  );
}