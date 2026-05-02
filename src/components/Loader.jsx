import React from "react";

const Loader = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-6 h-6 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
      <div
        className={`inline-block animate-spin rounded-full border-b-blue-400 border-t-blue-400 ${sizeClasses[size]}`}
      ></div>
      <p className="text-lg mt-2 font-medium">{message}</p>
    </div>
  );
};

export default Loader;
