import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { CREATE_CATEGORY_URL } from "../../config/url_helper";

const CreateCategory = () => {
  const navigate = useNavigate();

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploadErrors, setUploadErrors] = useState({});

  const { isLoading, error } = useSelector((state) => state.category || {});

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      isActive: true,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .required("Name is required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("isActive", values.isActive);

      if (bannerFile) {
        formData.append("bannerImage", bannerFile);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}${CREATE_CATEGORY_URL}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (response.data.statusCode === 201) {
          toast.success(
            response.data.message || "Category created successfully"
          );
          navigate("/category");
        } else {
          toast.error(response.data.message || "Failed to create category");
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
  });

  const handleBannerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadErrors((prev) => ({ ...prev, banner: null }));

    if (!file.type.startsWith("image/")) {
      setUploadErrors((prev) => ({
        ...prev,
        banner: "Please select an image file",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        banner: "File size must be less than 10MB",
      }));
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const removeBannerFile = () => {
    setBannerFile(null);
    setBannerPreview("");
    setUploadErrors((prev) => ({ ...prev, banner: null }));
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Create New Category</h1>
            <button
              onClick={() => navigate("/category")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 hover:cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Categories
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            Fill in the details below to create a new category
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-lg font-medium text-black flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Category Information
            </h2>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          )}

          {uploadErrors.banner && (
            <div className="mx-6 mt-4 space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500 text-sm">
                  Banner Error: {uploadErrors.banner}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-300"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Enter category name"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Enter category description"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue("isActive", !formik.values.isActive)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formik.values.isActive ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formik.values.isActive
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      formik.values.isActive
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formik.values.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image 
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-start w-full">
                    <label
                      className={`flex flex-col items-center justify-center w-50 h-22 border-2 border-dashed rounded-lg transition-all duration-200 ${
                        bannerFile
                          ? "border-green-400 bg-green-50"
                          : uploadErrors.banner
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {bannerFile ? (
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 text-green-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-sm text-green-600">
                              Banner selected successfully
                            </span>
                          </div>
                        ) : uploadErrors.banner ? (
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 text-red-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm text-red-500">
                              Invalid file - Try again
                            </span>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-6 h-6 text-gray-600 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="mb-1 text-sm text-gray-700">
                              <span className="font-medium">
                                Click to select banner
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                      />
                    </label>
                  </div>

                  {bannerPreview && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-40 h-40 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {bannerFile?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(bannerFile?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-green-600">
                            ✓ Ready to upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeBannerFile}
                        className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
             <button
    type="button" // Use type="button" to prevent form submission
     onClick={() => navigate("/category")} // Example callback to close modal
    className="w-50 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-all hover:cursor-pointer duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
  >
    Cancel
  </button>

               <button
                type="submit"
                disabled={isLoading}
                className={`w-50 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all hover:cursor-pointer duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;