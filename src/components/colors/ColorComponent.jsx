import React, { useEffect, useState, useRef } from "react";
import { GET, POST, PUT, DELETE } from "../../config/api_helper";
import {
  CREATE_COLOR_URL,
  GET_COLORS_URL,
  DELETE_COLOR_URL,
  UPDATE_COLOR_URL,
} from "../../config/url_helper";
import { Edit2,Edit, Trash2, Plus, Save, X, Search,AlertTriangle } from "lucide-react";
import Pagination from "../Pagination";
import { toast } from "react-toastify";

const ColorComponent = () => {
  const [colors, setColors] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    colorId: null,
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    colorId: null,
  });
  const [formData, setFormData] = useState({ name: "", hex: "#000000" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const fetchColors = async () => {
      setIsLoading(true);
      try {
        const response = await GET(GET_COLORS_URL, {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery.trim(),
        });
        const fetchedColors = response.data.colors || [];
        const paginationData = response.data.pagination || {
          currentPage: response.data.pagination?.currentPage || 1,
          limit: response.data.pagination?.limit || 5,
          totalItems:
            response.data.pagination?.totalItems || fetchedColors.length,
          totalPages: response.data.pagination?.totalPages || 1,
        };
        const idSet = new Set(fetchedColors.map((color) => color._id));
        if (idSet.size !== fetchedColors.length) {
          console.warn("Duplicate color IDs detected:", fetchedColors);
        }
        setColors(fetchedColors);
        setPagination({
          page: paginationData.currentPage,
          limit: paginationData.limit,
          total: paginationData.totalItems,
          totalPages: paginationData.totalPages,
        });
        setError(null);
      } catch (error) {
        // console.error("Failed to fetch colors:", error);
        setError(error.message || "Failed to fetch colors");
      } finally {
        setIsLoading(false);
      }
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchColors();
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [pagination.page, pagination.limit, searchQuery]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setError("Color name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const newColor = {
        name: formData.name.trim(),
        hex: formData.hex,
      };
      const postResponse = await POST(CREATE_COLOR_URL, newColor);
      if (postResponse.statuscode === 201) {
        toast.success(postResponse.message || "Color created successfully");
      } else {
        // toast.error(postResponse.message || "Failed to create color");
      }
      setFormData({ name: "", hex: "#000000" });
      setModalState({ isOpen: false, mode: "add", colorId: null });
      localStorage.setItem("isModalOpen", false);
      const response = await GET(GET_COLORS_URL, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery.trim(),
      });
      setColors(response.data.colors || []);
      setPagination({
        page: response.data.pagination?.currentPage || 1,
        limit: response.data.pagination?.limit || 5,
        total: response.data.pagination?.totalItems || 0,
        totalPages: response.data.pagination?.totalPages || 1,
      });
      setError(null);
    } catch (error) {
      console.error("Failed to add color:", error);
      // setError(error.message || "Failed to add color");
      // toast.error(error.message || "Failed to add color");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      setError("Color name cannot be empty");
      return;
    }
    if (modalState.colorId) {
      setIsLoading(true);
      try {
        const updatedColor = {
          name: formData.name.trim(),
          hex: formData.hex,
        };
        const response = await PUT(
          `${UPDATE_COLOR_URL}/${modalState.colorId}`,
          updatedColor
        );
        setColors(
          colors.map((color) =>
            color._id === modalState.colorId
              ? { ...color, name: formData.name.trim(), hex: formData.hex }
              : color
          )
        );
        if (response.statuscode === 200) {
          toast.success(response.message || "Color updated successfully");
        } else {
          toast.error(response.message || "Failed to update color");
        }
        setFormData({ name: "", hex: "#000000" });
        setModalState({ isOpen: false, mode: "add", colorId: null });
        localStorage.setItem("isModalOpen", false);
        setError(null);
      } catch (error) {
        console.error("Failed to update color:", error);
        setError(error.message || "Failed to update color");
        toast.error(error.message || "Failed to update color");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = (_id) => {
    setDeleteModalState({ isOpen: true, colorId: _id });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const deleteResponse = await DELETE(`${DELETE_COLOR_URL}/${deleteModalState.colorId}`);
      if (deleteResponse.statuscode === 200) {
        toast.success(deleteResponse.message || "Color deleted successfully");
      } else {
        toast.error(deleteResponse.message || "Failed to delete color");
      }
      const response = await GET(GET_COLORS_URL, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery.trim(),
      });
      setColors(response.data.colors || []);
      setPagination({
        page: response.data.pagination?.currentPage || 1,
        limit: response.data.pagination?.limit || 5,
        total: response.data.pagination?.totalItems || 0,
        totalPages: response.data.pagination?.totalPages || 1,
      });
      setError(null);
    } catch (error) {
      console.error("Failed to delete color:", error);
      setError(error.message || "Failed to delete color");
      // toast.error(error.message || "Failed to delete color");
    } finally {
      setIsLoading(false);
      setDeleteModalState({ isOpen: false, colorId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModalState({ isOpen: false, colorId: null });
  };

  const startAdd = () => {
    setFormData({ name: "", hex: "#000000" });
    setModalState({ isOpen: true, mode: "add", colorId: null });
    localStorage.setItem("isModalOpen", true);
    setError(null);
  };

  const startEdit = (color) => {
    setFormData({ name: color.name, hex: color.hex });
    setModalState({ isOpen: true, mode: "update", colorId: color._id });
    localStorage.setItem("isModalOpen", true);
    setError(null);
  };

  const handleCancel = () => {
    setFormData({ name: "", hex: "#000000" });
    setModalState({ isOpen: false, mode: "add", colorId: null });
    localStorage.setItem("isModalOpen", false);
    setError(null);
  };

  const handleModalSubmit = () => {
    if (modalState.mode === "add") {
      handleAdd();
    } else {
      handleUpdate();
    }
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
  <style>{`
  .pagination-current {
    color: #1f2937 !important; /* text-gray-800 */
  }
`}</style>

      <header className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h1 className="sm:text-3xl text-xl font-semibold text-gray-800 text-center">
          Color Manager
        </h1>
      </header>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search colors..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Items per page:
            </label>
            <select
              value={pagination.limit}
              onChange={handleLimitChange}
              disabled={isLoading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <button
            onClick={startAdd}
            disabled={isLoading}
            className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Plus size={20} />
            Add Color
          </button>
        </div>
      </div>

      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {modalState.mode === "add" ? " Create Color" : "Update Color"}
            </h3>
            <div className="space-y-4">
              <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">
  Color Name <span className="text-red-500">*</span>
</label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter color name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}
              <div className="flex gap-2 justify-end">
              
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <X size={16} />
                  Cancel
                </button>
                  <button
                  onClick={handleModalSubmit}
                  disabled={isLoading}
                  className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={16} />
                  {isLoading
                    ? modalState.mode === "add"
                      ? "Creating..."
                      : "Updating..."
                    : modalState.mode === "add"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModalState.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-xl">
         <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
  Confirm Delete
</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this color? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Trash2 size={16} />
                {isLoading ? "Deleting..." : "Delete"}
              </button>
              
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mb-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-lg font-medium">Loading colors...</p>
          </div>
        ) : error && colors.length === 0 ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : colors.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg font-medium">No colors found.</p>
            <p className="text-sm text-gray-500">
              Add a color or adjust your search.
            </p>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Swatch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Hex Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr
                  key={color._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                  </td>
                  <td className="px-4 py-3 text-gray-800 capitalize">
                    {color.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-800">
                    {color.hex.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(color)}
                        disabled={isLoading || modalState.isOpen || deleteModalState.isOpen}
                        className={`p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors hover:cursor-pointer${
                          isLoading || modalState.isOpen || deleteModalState.isOpen
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="Edit color"
                      >
                           <Edit size={16} />
                        {/* <Edit2 size={16} /> */}
                      </button>
                      <button
                        onClick={() => handleDelete(color._id)}
                        disabled={isLoading || modalState.isOpen || deleteModalState.isOpen}
                        className={`p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors hover:cursor-pointer${
                          isLoading || modalState.isOpen || deleteModalState.isOpen
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="Delete color"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          showFirstLast={true}
          showInfo={true}
          className="text-gray-800 bg-gray-50 pagination-current"
        />
      </footer>
    </div>
  );
};

export default ColorComponent;