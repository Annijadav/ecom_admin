import React from "react";

const AppFooter = () => {
  return (
    <footer className="px-4 py-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
      <div className="flex text-center sm:ml-auto">
        <span className="mr-1 text-gray-600">Powered by</span>
        <a
          href="https://coreui.io/react"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
        >
          copyright &copy; 2025 Misha brands factory. All rights reserved.
        </a>
      </div>
    </footer>
  );
};

export default React.memo(AppFooter);
