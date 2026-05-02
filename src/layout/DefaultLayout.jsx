import React, { useState, useEffect } from "react";
import {
  AppContent,
  AppSidebar,
  AppFooter,
  AppHeader,
} from "../components/index";

const DefaultLayout = () => {
  // Initialize states - removing localStorage for compatibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unfoldable, setUnfoldable] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen((prev) => !prev);
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden relative">
      {/* Mobile sidebar overlay - positioned behind sidebar but above main content */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 bg-opacity-50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-transform duration-300 ease-in-out
          xl:relative xl:transform-none xl:transition-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
          ${unfoldable ? "w-16" : "w-64"}
          ${isModalOpen ? "xl:hidden" : ""}
        `}
      >
        <div className="h-full overflow-y-auto bg-gray-900 border-r border-gray-700">
          <AppSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            unfoldable={unfoldable}
            setUnfoldable={setUnfoldable}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex flex-col h-screen min-w-0 ${
        isModalOpen ? "w-full absolute inset-0 lg:relative lg:flex-1" : "flex-1"
      }`}>
        {/* Header */}
        <header className={`bg-gray-900 shadow-sm flex-shrink-0 relative ${
          isModalOpen ? "z-[101]" : "z-30"
        }`}>
          <AppHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userDropdownOpen={userDropdownOpen}
            toggleUserDropdown={toggleUserDropdown}
          />
        </header>

        {/* Main content */}
        <main className="flex-1 bg-white overflow-y-auto min-h-0 relative z-10">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <AppContent
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 flex-shrink-0 relative z-20">
          <AppFooter />
        </footer>
      </div>

      {/* Modal overlay - highest z-index when modal is open */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50" />
      )}
    </div>
  );
};

export default DefaultLayout;