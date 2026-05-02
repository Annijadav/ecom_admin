import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../../redux/Slice/loginSlice";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isLoading, isError, errorMessage, isSuccess } = useSelector(
    (state) => state.login
  );

  useEffect(() => {
    if (!token) {
      toast.error(
        "Invalid or missing reset token. Please request a new password reset.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password reset successful! Redirecting to login...", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  }, [isSuccess]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    confirmpassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmpassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const requestData = {
          token,
          password: values.password,
          confirmPassword: values.confirmpassword,
        };

        const resultAction = await dispatch(resetPassword(requestData));

        if (resetPassword.fulfilled.match(resultAction)) {
          toast.success("Password has been reset successfully!", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast.error(
            resultAction.payload ||
              "Failed to reset password. Please try again.",
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
        console.error(error);
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Reset Password
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Set a new password for your account
            </p>
          </div>

          {isError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-md mb-4 text-center text-sm">
              {errorMessage ||
                "An error occurred while resetting your password."}
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-2 rounded-md mb-4 text-center text-sm">
              Password has been reset successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter new password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  className={`w-full pl-4 pr-10 py-2 bg-gray-50 border rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-sm sm:text-base ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmpassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmpassword"
                  name="confirmpassword"
                  placeholder="Confirm new password"
                  value={formik.values.confirmpassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  className={`w-full pl-4 pr-10 py-2 bg-gray-50 border rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-sm sm:text-base ${
                    formik.touched.confirmpassword &&
                    formik.errors.confirmpassword
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.confirmpassword &&
                formik.errors.confirmpassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.confirmpassword}
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className={`w-full bg-indigo-500 text-white font-medium py-2 rounded-md transition-all hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 text-sm sm:text-base ${
                isLoading || !formik.isValid
                  ? "opacity-60 cursor-not-allowed"
                  : ""
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
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="flex justify-center space-x-4 text-sm">
              <Link
                to="/login"
                className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Back to Login
              </Link>
              <Link
                to="/forgot-password"
                className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
