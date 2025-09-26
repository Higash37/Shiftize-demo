import React, { useState, useEffect } from "react";
import { Link } from "expo-router";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">Shiftize</span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-black/80 hover:text-blue-600 font-medium transition-colors"
            >
              機能
            </a>
            <a
              href="#benefits"
              className="text-black/80 hover:text-blue-600 font-medium transition-colors"
            >
              導入効果
            </a>
            <a
              href="#screenshots"
              className="text-black/80 hover:text-blue-600 font-medium transition-colors"
            >
              画面
            </a>
            <a
              href="#pricing"
              className="text-black/80 hover:text-blue-600 font-medium transition-colors"
            >
              料金
            </a>
            <Link
              href="/(auth)/login?demo=true"
              className="btn-secondary text-sm py-2 px-4"
            >
              デモを試す
            </Link>
            <Link href="/(main)" className="btn-primary text-sm py-2 px-4">
              アプリを開く
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="メニューを開く"
            title="メニューを開く"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
            <div className="py-4 space-y-4">
              <a
                href="#features"
                className="block px-4 py-2 text-black/80 hover:text-blue-600 font-medium"
              >
                機能
              </a>
              <a
                href="#benefits"
                className="block px-4 py-2 text-black/80 hover:text-blue-600 font-medium"
              >
                導入効果
              </a>
              <a
                href="#screenshots"
                className="block px-4 py-2 text-black/80 hover:text-blue-600 font-medium"
              >
                画面
              </a>
              <a
                href="#pricing"
                className="block px-4 py-2 text-black/80 hover:text-blue-600 font-medium"
              >
                料金
              </a>
              <div className="px-4 space-y-3">
                <Link
                  href="/(auth)/login?demo=true"
                  className="block text-center btn-secondary text-sm py-2 px-4"
                >
                  デモを試す
                </Link>
                <Link
                  href="/(main)"
                  className="block text-center btn-primary text-sm py-2 px-4"
                >
                  アプリを開く
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
