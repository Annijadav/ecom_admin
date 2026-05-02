import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import routes from "../routes"; // Ensure routes.js exports an array of route objects
import PrivateRoute from "../components/PrivateRoute"; // Component for protected routes
import { Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import "../index.css"; // Global styles

const AppContent = () => {
  return (
    <div className="container mx-auto px-4 lg:max-w-7xl">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) {
              console.warn(`Route at index ${idx} is missing element`);
              return null;
            }

            const Element = route.element;

            return (
              <Route
                key={idx}
                path={route.path}
                element={
                  <PrivateRoute>
                    <Element />
                  </PrivateRoute>
                }
              />
            );
          })}
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{ marginTop: "70px" }}
      />
    </div>
  );
};

export default React.memo(AppContent);
