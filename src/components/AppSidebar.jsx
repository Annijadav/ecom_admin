import React from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import AppSidebarNav from "./AppSidebarNav";
import navigation from "../Navigation";

const AppSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  unfoldable,
  setUnfoldable,
}) => {
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleUnfoldableToggle = () => {
    setUnfoldable(!unfoldable);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile & Laptop Toggle Button - Show on screens smaller than 1280px */}
{/*       <button
        className="xl:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        onClick={handleSidebarToggle}
      >
        <Menu className="w-5 h-5" />
      </button> */}

      {/* Sidebar Content */}
      <div className="h-full bg-gray-900 text-white border-r border-gray-700 flex flex-col transition-all duration-500 ease-in-out">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 min-h-[4rem]">
          {/* Brand/Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-all duration-300"
          >
            {unfoldable ? (
              <div className="w-8 h-8 rounded flex items-center justify-center transition-all duration-300">
                <img src="MishaBrandsFaetory.png" className="h-8 w-10" alt="" />
              </div>
            ) : (
              <>
                <span className="flex justify-center items-center font-semibold text-center transition-all duration-300">
                  <img
                    src="MishaBrandsFaetory.png"
                    className="h-8 w-10"
                    alt=""
                  />
                </span>
              </>
            )}
          </Link>

          {/* Close Button (Mobile & Laptop) */}
          <button
            className="xl:hidden p-1 rounded hover:bg-gray-800 transition-colors"
            onClick={handleCloseSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <AppSidebarNav items={navigation} unfoldable={unfoldable} />
        </div>

        {/* Sidebar Footer */}
        {/* <div className="hidden lg:flex border-t border-gray-700 p-2">
          <button
            onClick={handleUnfoldableToggle}
            className="w-full flex items-center justify-center p-2 rounded hover:bg-gray-800 transition-all duration-300"
            title={unfoldable ? "Expand sidebar" : "Collapse sidebar"}
          >
            {unfoldable ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div> */}
      </div>
    </>
  );
};

export default React.memo(AppSidebar);
