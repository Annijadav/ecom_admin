import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Switch from "react-switch"; // Adjust based on your Switch component library
// import UPDATE_CATEGORY_URL from "D:\Misha Brand Factory\admin-frontend\src\config\url_helper.js"
import {UPDATE_CATEGORY_URL} from "../../config/url_helper"

const UpdateCategory = ({
  showUpdateModal,
  selectedCategory,
  updateFormData,
  setUpdateFormData,
  updateLoading,
  setUpdateLoading,
  setShowUpdateModal,
  setSelectedCategory,
  searchQuery,
  fetchCategoriesThunk,
  pagination,
  updateCategoryId,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(
    selectedCategory?.bannerImage || ""
  );
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    if (selectedCategory) {
      setUpdateFormData({
        name: selectedCategory.name || "",
        description: selectedCategory.description || "",
        isActive: selectedCategory.isActive ?? true,
        sortOrder: selectedCategory.sortOrder || 0,
        metaTitle: selectedCategory.metaTitle || "",
        metaDescription: selectedCategory.metaDescription || "",
        sizes: selectedCategory.sizes || [],
      });
      setBannerPreview(selectedCategory.bannerImage || "");
    }
  }, [selectedCategory, setUpdateFormData]);

  const validateForm = () => {
    const errors = {};
    if (!updateFormData.name) {
      errors.name = "Category name is required";
    } else if (updateFormData.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (updateFormData.name.length > 50) {
      errors.name = "Category name cannot exceed 50 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBannerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadErrors((prev) => ({ ...prev, banner: null }));
    setFormErrors((prev) => ({ ...prev, banner: "" }));
    if (!file.type.startsWith("image/")) {
      const error = "Please select an image file";
      setUploadErrors((prev) => ({ ...prev, banner: error }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const error = "File size must be less than 10MB";
      setUploadErrors((prev) => ({ ...prev, banner: error }));
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

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !updateCategoryId) return;
    if (!validateForm()) {
      return;
    }
    try {
      setUpdateLoading(true);
      const formData = new FormData();
      formData.append("name", updateFormData.name);
      formData.append("description", updateFormData.description);
      formData.append("isActive", updateFormData.isActive);
      const sizesWithoutId = updateFormData.sizes.map((size) => {
        const { _id, ...sizeWithoutId } = size;
        return sizeWithoutId;
      });
     

      formData.append("sizes", JSON.stringify(sizesWithoutId));
      if (bannerFile) {
        formData.append("bannerImage", bannerFile);
      }
      const res = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }${UPDATE_CATEGORY_URL}/${updateCategoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      await fetchCategoriesThunk(searchQuery, pagination.page);
      setShowUpdateModal(false);
      setSelectedCategory(null);
      setFormErrors({});
      setBannerFile(null);
      setBannerPreview("");
      toast.success("Category updated successfully!");
    } catch (error) {
     console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
    } finally {
      setUpdateLoading(false);
    }
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedCategory(null);
    setUpdateFormData({
      name: "",
      description: "",
      isActive: true,
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
      sizes: [],
    });
    setFormErrors({});
    setBannerFile(null);
    setBannerPreview("");
    setUploadErrors({});
  };

  if (!showUpdateModal || !selectedCategory) return null;

  return (
    <div className="fixed top-8 inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl max-h-[75vh] overflow-y-auto shadow-xl xl:ml-40">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Update Category
          </h3>
          <button
            onClick={closeUpdateModal}
            className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-all duration-200 hover:cursor-pointer"
            title="Close"
            disabled={updateLoading}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={updateCategory} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
             <label className="block text-sm font-medium text-gray-700 mb-1.5">
  Category Name <span className="text-red-500">*</span>
</label>

              <input
                type="text"
                name="name"
                value={updateFormData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  formErrors.name ? "border-red-400" : "border-gray-300"
                } rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
                placeholder="Enter category name"
                disabled={updateLoading}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description 
            </label>
            <textarea
              name="description"
              value={updateFormData.description}
              onChange={handleInputChange}
              rows="3"
              className={`w-full px-3 py-2.5 border ${
                formErrors.description ? "border-red-400" : "border-gray-300"
              } rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
              placeholder="Enter category description"
              disabled={updateLoading}
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.description}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <Switch
              onChange={(checked) =>
                handleInputChange({
                  target: { name: "isActive", type: "checkbox", checked },
                })
              }
              height={20}
              width={40}
              checked={updateFormData.isActive}
              disabled={updateLoading}
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Active Category
            </label>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image 
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-start w-full">
                <label
                  htmlFor="banner-upload"
                  className={`flex flex-col items-center justify-center w-50 h-22 border-2 border-dashed rounded-lg transition-all duration-200 hover:cursor-pointer ${
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
                    id="banner-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    disabled={updateLoading}
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
                        {bannerFile?.name || "Current Banner"}
                      </p>
                      {bannerFile && (
                        <p className="text-xs text-gray-500">
                          {(bannerFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                      <p className="text-xs text-green-600">
                        ✓ Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeBannerFile}
                    className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                    disabled={updateLoading}
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
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeUpdateModal}
              disabled={updateLoading}
              className={`px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg hover:cursor-pointer hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 ${
                updateLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateLoading}
              className={`px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
                updateLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {updateLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategory;