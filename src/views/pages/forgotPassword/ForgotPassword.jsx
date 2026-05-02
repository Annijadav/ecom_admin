import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword } from "../../../redux/Slice/loginSlice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showEmail, setShowEmail] = useState(false);
  const { isLoading, isError, errorMessage } = useSelector(
    (state) => state.login
  );

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        const resultAction = await dispatch(forgotPassword(values));
        if (forgotPassword.fulfilled.match(resultAction)) {
          toast.success("Password reset email sent! Please check your inbox.", {
            position: "top-right",
            autoClose: 2000,
          });
          navigate("/login");
        } else {
          toast.error(
            resultAction?.payload?.message || "Failed to send reset email",
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again later.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Forgot Password
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Reset your password via email
            </p>
          </div>

          {isError && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  type={showEmail ? "text" : "email"}
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  className={`w-full pl-4 pr-10 py-2 bg-gray-50 border rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-sm sm:text-base ${
                    formik.errors.email && formik.touched.email
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowEmail(!showEmail)}
                >
                  {showEmail ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-500 text-white font-medium py-2 rounded-md transition-all hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 text-sm sm:text-base ${
                isLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
