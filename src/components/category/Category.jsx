import React, { useEffect, useState, useCallback } from "react";
import Switch from "react-switch";
import {
  Eye,
  Edit,
  ChevronUp,
  ChevronDown,
  X,
  Search,
  Plus,
} from "lucide-react";
import { GET, POST } from "../../config/api_helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GET_CATEGORIES_URL } from "../../config/url_helper";
import Pagination from "../../components/Pagination";
import UpdateCategory from "./UpdateCategory";
import DeleteCategory from "./DeleteCategory";

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState("productCount");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const sizeOptions = [
    { label: "Small", symbol: "S" },
    { label: "Medium", symbol: "M" },
    { label: "Large", symbol: "L" },
    { label: "ExtraLarge", symbol: "XL" },
    { label: "2XLarge", symbol: "2XL" },
    { label: "3XLarge", symbol: "3XL" },
  ];
  const [category, setCategory] = useState([]);
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    sortOrder: 0,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateCategoryId, setUpdateCategoryId] = useState(null);

  const fetchCategoriesThunk = useCallback(
    async (searchQuery = "", page = 1, limit = pagination.limit, size) => {
      try {
        setSearchLoading(true);
        const params = {
          page,
          limit,
          ...(size && { sizes: size }),
          ...(searchQuery && { search: searchQuery.trim() }),
        };
        const response = await GET(GET_CATEGORIES_URL, params);
        if (!response?.data?.categories) {
          throw new Error("Invalid API response");
        }
        let filteredCategories = response.data.categories || [];
        if (
          searchQuery &&
          filteredCategories.length === response.data.categories.length
        ) {
          filteredCategories = filteredCategories.filter((cat) =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        console.log("Fetched categories:", filteredCategories);
        setCategories(filteredCategories);
        setPagination({
          page,
          limit,
          total:
            response.data?.pagination?.totalItems || filteredCategories.length,
          totalPages: response.data?.pagination?.totalPages || 1,
        });
        setError(null);
      } catch (error) {
        console.error("Error fetching categories:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch categories";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setSearchLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    setLoading(true);
    fetchCategoriesThunk("", 1, pagination.limit).finally(() =>
      setLoading(false)
    );
  }, [fetchCategoriesThunk, pagination.limit]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCategoriesThunk(searchTerm, 1, pagination.limit);
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, fetchCategoriesThunk, pagination.limit]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim()) {
      fetchCategoriesThunk(searchTerm, 1, pagination.limit);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCategoriesThunk("", 1, pagination.limit);
  };

  const handlePageChange = (newPage) => {
    fetchCategoriesThunk(searchTerm, newPage, pagination.limit);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    fetchCategoriesThunk(searchTerm, 1, newLimit);
  };

  const sortCategories = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
    const sorted = [...categories].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    setCategories(sorted);
  };

  const viewCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
    localStorage.setItem("isModalOpen", true);
  };

  const openUpdateModal = (category) => {
    setSelectedCategory(category);
    setUpdateFormData({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      sortOrder: category.sortOrder || 0,
    });
    setUpdateCategoryId(category._id);
    setShowUpdateModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateCategory = () => {
    navigate("/create-category");
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
  const formatDate2 = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // January = 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleToggle = async (productId, field, currentStatus) => {
    console.log("Toggling", field, "for product:", productId);
    try {
      // setLoading(true);
      const newStatus = !currentStatus;
      const isActive =
        field === "isActive"
          ? newStatus
          : categories.find((c) => c._id === productId).isActive; // Fixed: Changed from products to categories

      const response = await POST(
        `/api/v1/category/togal/${productId}?isActive=${isActive}`,
        {}
      );

      if (response.statusCode === 200) {
        toast.success(`Category status updated successfully!`);
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === productId
              ? { ...category, [field]: newStatus }
              : category
          )
        );
      } else {
        toast.error(response.message || `Failed to update ${field} status.`);
      }
    } catch (error) {
      console.error(`Error updating ${field} status:`, error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to update ${field} status`;
      toast.error(errorMessage);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg min-h-screen">
      <header className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h1 className="sm:text-3xl text-xl font-semibold text-gray-800 text-center">
          Category Management
        </h1>
      </header>
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              placeholder="Search categories..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                disabled={loading || searchLoading}
              >
                <X size={20} />
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
              </div>
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
              disabled={loading || searchLoading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <button
            onClick={handleCreateCategory}
            disabled={loading || searchLoading}
            className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
              loading || searchLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>
      </div>
      <div className="overflow-x-auto mb-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-lg mt-2 font-medium">Loading categories...</p>
          </div>
        ) : error && categories.length === 0 ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg font-medium">
              {searchTerm
                ? `No categories found for "${searchTerm}"`
                : "No categories found"}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-500 hover:text-blue-600 font-medium hover:cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => sortCategories("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category Name</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => sortCategories("isActive")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon field="isActive" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => sortCategories("productCount")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Products</span>
                    <SortIcon field="productCount" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => sortCategories("viewCount")}
                ></th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => sortCategories("createdAt")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {category.bannerImage ? (
                          <img
                            src={category.bannerImage}
                            alt={category.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium capitalize text-gray-800">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Slug: {category.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      onChange={() =>
                        handleToggle(
                          category._id,
                          "isActive",
                          category.isActive
                        )
                      }
                      height={20}
                      width={40}
                      checked={category.isActive}
                      disabled={loading}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {category.productCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {category.viewCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate2(category.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openUpdateModal(category)}
                        disabled={loading || searchLoading || deleteLoading}
                        className={`p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors hover:cursor-pointer${
                          loading || searchLoading || deleteLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="Edit category"
                      >
                        <Edit size={16} />
                      </button>
                      <DeleteCategory
                        categoryId={category._id}
                        deleteLoading={deleteLoading}
                        setDeleteLoading={setDeleteLoading}
                        searchTerm={searchTerm}
                        fetchCategoriesThunk={fetchCategoriesThunk}
                        pagination={pagination}
                      />
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
          className="text-gray-800 bg-gray-50"
        />
      </footer>
      {showModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 mx-4 sm:mx-10">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                Category Details
              </h1>
              <button
                onClick={() => {
                  setShowModal(false);
                  localStorage.setItem("isModalOpen", false);
                }}
                className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-all duration-200"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <p className="text-gray-800 capitalize">
                    {selectedCategory.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <p className="text-gray-800">
                    {selectedCategory.description || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug
                  </label>
                  <p className="text-gray-800">{selectedCategory.slug}</p>
                </div>
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Icon
                  </label>
                  {selectedCategory.icon ? (
                    <div className="mt-1">
                      <img
                        src={`${selectedCategory.icon}`}
                        alt="Category Icon"
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <p className="text-gray-500 text-xs mt-1 hidden">
                        Failed to load icon
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-800">N/A</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedCategory.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedCategory.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Count
                  </label>
                  <p className="text-gray-800">
                    {selectedCategory.productCount || 0}
                  </p>
                </div>
                {selectedCategory.sizes &&
                  selectedCategory.sizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Available Sizes ({selectedCategory.sizes.length})
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedCategory.sizes.map((size, index) => (
                          <span
                            key={size._id || index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            title={size.label}
                          >
                            {size.symbol ? `${size.symbol} (cm)` : size.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Banner Image
                  </label>
                  {selectedCategory.bannerImage ? (
                    <div className="mt-1">
                      <img
                        src={`${selectedCategory.bannerImage}`}
                        alt="Category Banner"
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <p className="text-gray-500 text-xs mt-1 hidden">
                        Failed to load image
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-800">N/A</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
                <div>
                  <strong>Created:</strong>{" "}
                  {formatDate(selectedCategory.createdAt)}
                </div>
                <div>
                  <strong>Updated:</strong>{" "}
                  {formatDate(selectedCategory.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <UpdateCategory
        showUpdateModal={showUpdateModal}
        selectedCategory={selectedCategory}
        updateFormData={updateFormData}
        setUpdateFormData={setUpdateFormData}
        updateLoading={updateLoading}
        setUpdateLoading={setUpdateLoading}
        setShowUpdateModal={setShowUpdateModal}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        fetchCategoriesThunk={fetchCategoriesThunk}
        pagination={pagination}
        updateCategoryId={updateCategoryId}
      />
    </div>
  );
};

export default Category;
