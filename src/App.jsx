import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Ensure your global styles are imported
// Components
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Containers
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));


// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const ForgotPassword = React.lazy(() =>
  import("./views/pages/forgotPassword/ForgotPassword")
);
const Resetpassword = React.lazy(() =>
  import("./views/pages/resetPassword/Resetpassword")
);
// const Register = React.lazy(() => import("./views/pages//Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    const theme =
      urlParams.get("theme") &&
      urlParams.get("theme").match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      document.documentElement.classList.add(theme);
    } else {
      document.documentElement.classList.add(storedTheme);
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={
                  localStorage.getItem("authToken") &&
                  localStorage.getItem("userData")
                    ? "/dashboard"
                    : "/login"
                }
                replace
              />
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute restricted={true}>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute restricted={true}>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute restricted={true}>
                <Resetpassword />
              </PublicRoute>
            }
          />

          <Route
            path="/404"
            element={
              <PublicRoute>
                <Page404 />
              </PublicRoute>
            }
          />
          <Route
            path="/500"
            element={
              <PublicRoute>
                <Page500 />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <DefaultLayout />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <DefaultLayout />
              </PrivateRoute>
            }
          />
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
      />
    </BrowserRouter>
  );
};

export default App;
