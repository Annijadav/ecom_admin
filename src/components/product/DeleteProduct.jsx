import React, { useState } from "react";
import { Trash2,AlertTriangle } from "lucide-react";
const DeleteProduct = ({
  productId,
  productName,
  isLoading,
  setIsLoading,
  onDeleteInitiate,
  className,
  title,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
    localStorage.setItem("isModalOpen", true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDeleteInitiate(productId);
      setShowConfirmDialog(false);
      localStorage.setItem("isModalOpen", false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    localStorage.setItem("isModalOpen", false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={isLoading}
        className={`${className} ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        } hover:cursor-pointer`}
        title={title}
      >
        <Trash2 size={16} />
      </button>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-gray">
    <div className="flex items-center mb-4">
  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
  <h3 className="text-lg font-semibold">Confirm Deletion</h3>
</div>

            <p className="mb-4 text-gray-600">
              Are you sure you want to delete <strong>{productName}</strong>?.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-700 rounded-md hover:cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md hover:cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteProduct;
