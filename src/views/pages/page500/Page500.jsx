import React from "react";
import { Search } from "lucide-react";

const Page500 = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full md:w-1/2">
            <span className="clearfix block mb-6">
              <h1 className="float-left text-6xl font-bold mr-4 text-gray-800">
                500
              </h1>
              <h4 className="pt-3 text-xl font-semibold text-gray-700">
                Houston, we have a problem!
              </h4>
              <p className="text-gray-500 clear-left mt-2">
                The page you are looking for is temporarily unavailable.
              </p>
            </span>
            <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
              <div className="flex items-center justify-center px-3 bg-gray-50 border-r border-gray-300">
                <Search className="w-4 h-4 text-gray-600" />
              </div>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-200">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page500;
