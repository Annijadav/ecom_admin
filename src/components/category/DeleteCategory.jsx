import React, { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { DELETE } from "../../config/api_helper";
import { DELETE_CATEGORY_URL } from "../../config/url_helper";
import { toast } from "react-toastify";
const DeleteCategory = ({
  categoryId,
  deleteLoading,
  setDeleteLoading,
  searchTerm,
  fetchCategoriesThunk,
  pagination,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Delete category with API call
  const deleteCategory = async () => {
    try {
      setDeleteLoading(categoryId);
      localStorage.setItem("isModalOpen", false);
      setShowConfirmModal(false);

      // Call DELETE API
      const response = await DELETE(`${DELETE_CATEGORY_URL}/${categoryId}`);

      if (response.statusCode === 200) {
        toast.success(response.message || "Category deleted successfully");
        setErrorMessage("");
      } else {
        toast.error(response.message || "Failed to delete category");
      }

      // Refresh current page after deletion
      await fetchCategoriesThunk(searchTerm, pagination.page);

      // Show success modal
      setShowSuccessModal(true);
      localStorage.setItem("isModalOpen", true);
    } catch (error) {
      console.error("Error deleting category:", error);
      setErrorMessage("Failed to delete category. Please try again.");
      setShowErrorModal(true);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    localStorage.setItem("isModalOpen", true);
  };

  const handleConfirm = () => {
    deleteCategory();
  };

  const handleCancel = () => {
    localStorage.setItem("isModalOpen", false);
    setShowConfirmModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    localStorage.setItem("isModalOpen", true);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={handleDeleteClick}
        disabled={deleteLoading === categoryId}
        className={`p-1 rounded hover:cursor-pointer hover:cursor-pointer${
          deleteLoading === categoryId
            ? "text-red-600 hover:text-red-900 cursor-not-allowed"
            : "text-red-600 hover:text-red-900 "
        }`}
        title="Delete Category"
      >
        {deleteLoading === categoryId ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        ) : (
          <Trash2 className="w-4 h-4 text-red-600" />
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Success</h3>
            </div>
            <p className="text-gray-600 mb-6">Category deleted successfully!</p>
            <div className="flex justify-end">
              <button
                onClick={closeSuccessModal}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors hover:cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <X className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            </div>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={closeErrorModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors hover:cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteCategory;
