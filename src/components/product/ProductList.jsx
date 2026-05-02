import React, { useEffect, useState, useRef, useCallback } from "react";
import Switch from "react-switch";
import {
  Edit,
  Search,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Filter,
  RotateCcw,
} from "lucide-react";
import { GET, DELETE, POST } from "../../config/api_helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  GET_PRODUCTS_URL,
  GET_CATEGORIES_URL,
  DELETE_PRODUCT_URL,
  GET_COLORS_URL,
} from "../../config/url_helper";
import Pagination from "../../components/Pagination";
import UpdateProduct from "./UpdateProduct";
import DeleteProduct from "./DeleteProduct";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    colors: [],
    brands: [],
    collections: [],
    tags: [],
    minPrice: "",
    maxPrice: "",
    category: "",
    status: "",
    inStock: "",
    isSoldOut: "",
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    product: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    brands: [],
    collections: [],
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [colorsRes, categoriesRes, productsRes] = await Promise.all([
        GET(GET_COLORS_URL),
        GET(GET_CATEGORIES_URL),
        GET(GET_PRODUCTS_URL),
      ]);

      const collectionsSet = new Set();
      const tagsSet = new Set();

      productsRes?.data?.products?.forEach((product) => {
        if (Array.isArray(product.collections)) {
          product.collections.forEach((collection) =>
            collectionsSet.add(
              typeof collection === "string" ? collection : collection.name
            )
          );
        }
      });

      setFilterOptions({
        colors: colorsRes?.data?.colors || [],
        collections: Array.from(collectionsSet),
        tags: Array.from(tagsSet),
      });

      setCategories(categoriesRes?.data?.categories || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Failed to load filter options");
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const fetchProducts = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery.trim() }),
        ...(filters.colors.length > 0 && {
          colors: filters.colors.map((color) => color._id).join(","),
        }),
        ...(filters.brands.length > 0 && {
          brands: filters.brands.map((brand) => brand._id).join(","),
        }),
        ...(filters.collections.length > 0 && {
          collections: JSON.stringify(filters.collections),
        }),
        ...(filters.tags.length > 0 && { tags: JSON.stringify(filters.tags) }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.inStock && { inStock: filters.inStock }),
        ...(filters.isSoldOut && { isSoldOut: filters.isSoldOut }),
      };

      const response = await GET(GET_PRODUCTS_URL, params);
      if (!response?.data?.products) {
        throw new Error("Invalid API response");
      }
      setProducts(response.data.products || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total:
          response.data.pagination?.total || response.data.products.length || 0,
        totalPages:
          response.data.pagination?.totalPages ||
          Math.ceil((response.data.products.length || 0) / pagination.limit) ||
          1,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterType === "colors" || filterType === "brands") {
        if (value === "") {
          newFilters[filterType] = [];
        } else {
          const obj = filterOptions[filterType].find(
            (item) => item._id === value
          );
          newFilters[filterType] = obj ? [obj] : [];
        }
      } else if (filterType === "collections" || filterType === "tags") {
        newFilters[filterType] = newFilters[filterType].includes(value)
          ? newFilters[filterType].filter((item) => item !== value)
          : [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      colors: [],
      brands: [],
      collections: [],
      tags: [],
      minPrice: "",
      maxPrice: "",
      category: "",
      status: "",
      inStock: "",
      isSoldOut: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  const sortProducts = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...products].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === "category") {
        aVal = a.category?.name || "Uncategorized";
        bVal = b.category?.name || "Uncategorized";
      } else if (field === "stock") {
        aVal = calculateTotalStock(a.variants);
        bVal = calculateTotalStock(b.variants);
      } else if (field === "price") {
        aVal = a.base_price || 0;
        bVal = b.base_price || 0;
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      return direction === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });

    setProducts(sorted);
  };

  const startEdit = (product) => {
    setModalState({ isOpen: true, product });
    localStorage.setItem("isModalOpen", true);
  };

  const viewProduct = (productId) => {
    const product = products.find((p) => p._id === productId);
    navigate(`/product/${productId}`, { state: { product } });
  };

  const onDeleteInitiate = async (productId) => {
    try {
      setLoading(true);
      const response = await DELETE(`${DELETE_PRODUCT_URL}/${productId}`);
      if (response.statusCode === 200) {
        toast.success("Product deleted successfully!");
        await fetchProducts();
      } else {
        toast.error(response.message || "Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (productId, field, currentStatus) => {
    try {
      // setLoading(true);
      const newStatus = !currentStatus;
      const isSoldOut =
        field === "isSoldOut"
          ? newStatus
          : products.find((p) => p._id === productId).isSoldOut;
      const isActive =
        field === "isActive"
          ? newStatus
          : products.find((p) => p._id === productId).isActive;

      const response = await POST(
        `/api/v1/products/togal/${productId}?isSoldOut=${isSoldOut}&isActive=${isActive}`,
        {}
      );

      if (response.statusCode === 200) {
        toast.success(`Product status updated successfully!`);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, [field]: newStatus }
              : product
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

  const calculateTotalStock = (variants) => {
    return (
      variants?.reduce(
        (sum, variant) =>
          sum + (variant.sizes?.reduce((s, size) => s + size.stock, 0) || 0),
        0
      ) || 0
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    );
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value) =>
      Array.isArray(value) ? value.length > 0 : value !== ""
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg min-h-screen max-w-full mx-auto">
      <header className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h1 className="text-xl sm:text-3xl font-semibold text-gray-800 text-center">
          Product Management
        </h1>
      </header>

      {!modalState.isOpen && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                aria-label="Search products"
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:cursor-pointer"
                  disabled={loading}
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
              {loading && searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg transition-all duration-200 w-full sm:w-auto hover:cursor-pointer ${
                showFilters || hasActiveFilters()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <Filter size={20} />
              Filters
              {hasActiveFilters() && (
                <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:cursor-pointer"
                >
                  <RotateCcw size={16} />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sold Out Status
                  </label>
                  <select
                    value={filters.isSoldOut}
                    onChange={(e) =>
                      handleFilterChange("isSoldOut", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  >
                    <option value="">All Products</option>
                    <option value="true">Sold Out</option>
                    <option value="false">Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    isActive Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Color
                  </label>
                  <select
                    value={
                      filters.colors.length > 0 ? filters.colors[0]._id : ""
                    }
                    onChange={(e) =>
                      handleFilterChange("colors", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  >
                    <option value="">All Colors</option>
                    {filterOptions.colors.map((color) => (
                      <option key={color._id} value={color._id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4"></div>

              {(filters.colors.length > 0 ||
                filters.brands.length > 0 ||
                filters.collections.length > 0 ||
                filters.tags.length > 0 ||
                filters.minPrice ||
                filters.maxPrice ||
                filters.category ||
                filters.status ||
                filters.inStock ||
                filters.isSoldOut) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Applied Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Category:{" "}
                        {categories.find((c) => c._id === filters.category)
                          ?.name || filters.category}
                        <button
                          onClick={() => handleFilterChange("category", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove category filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.colors.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        <span
                          className="w-4 h-4 rounded-full inline-block"
                          style={{ backgroundColor: filters.colors[0].hex }}
                        ></span>
                        Color: {filters.colors[0].name}
                        <button
                          onClick={() => handleFilterChange("colors", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove ${filters.colors[0].name} filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.brands.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Brand: {filters.brands[0].name}
                        <button
                          onClick={() => handleFilterChange("brands", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove ${filters.brands[0].name} filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.collections.map((collection) => (
                      <div
                        key={collection}
                        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                      >
                        Collection: {collection}
                        <button
                          onClick={() =>
                            handleFilterChange("collections", collection)
                          }
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove ${collection} filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {filters.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                      >
                        Tag: {tag}
                        <button
                          onClick={() => handleFilterChange("tags", tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove ${tag} filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {filters.minPrice && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Min Price: ${filters.minPrice}
                        <button
                          onClick={() => handleFilterChange("minPrice", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove min price filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.maxPrice && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Max Price: ${filters.maxPrice}
                        <button
                          onClick={() => handleFilterChange("maxPrice", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove max price filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.status && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Status:{" "}
                        {filters.status.charAt(0).toUpperCase() +
                          filters.status.slice(1)}
                        <button
                          onClick={() => handleFilterChange("status", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove ${filters.status} filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.inStock && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Stock:{" "}
                        {filters.inStock === "true"
                          ? "In Stock"
                          : "Out of Stock"}
                        <button
                          onClick={() => handleFilterChange("inStock", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove stock filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {filters.isSoldOut && (
                      <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Sold Out:{" "}
                        {filters.isSoldOut === "true"
                          ? "Sold Out"
                          : "Available"}
                        <button
                          onClick={() => handleFilterChange("isSoldOut", "")}
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                          aria-label={`Remove sold out filter`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">
                Items per page:
              </label>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                disabled={loading}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <button
              onClick={() => navigate("/create-product")}
              disabled={loading}
              className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium w-full sm:w-auto ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-lg mt-2 font-medium">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg font-medium">
                {searchQuery || hasActiveFilters()
                  ? "No products found for current search or filters"
                  : "No products found"}
              </p>
              {(searchQuery || hasActiveFilters()) && (
                <div className="mt-4 space-x-2">
                  {searchQuery && (
                    <button
                      onClick={handleSearchClear}
                      className="text-blue-500 hover:text-blue-600 font-medium hover:cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                  {hasActiveFilters() && (
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-500 hover:text-blue-600 font-medium hover:cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer min-w-[150px]"
                    onClick={() => sortProducts("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Product Name</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer min-w-[100px]"
                    onClick={() => sortProducts("category")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <SortIcon field="category" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer min-w-[80px]"
                    onClick={() => sortProducts("price")}
                  ></th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer min-w-[80px]"
                    onClick={() => sortProducts("isActive")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-center">Status</span>
                      <SortIcon field="isActive" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer min-w-[80px]"
                    onClick={() => sortProducts("stock")}
                  ></th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px] ">
                    Sold Out
                  </th>
                  <th className="pl-9 py-3 text-left text-sm font-semibold text-gray-700 min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          {product.variants?.[0]?.images?.[0]?.url
                            ? (() => {
                                const mediaUrl = `${import.meta.env.VITE_BASE_URL}${product.variants[0].images[0].url}`;
                                const isVideo = /\.(mp4|webm|ogg)$/i.test(
                                  mediaUrl
                                );

                                return isVideo ? (
                                  <video
                                    src={mediaUrl}
                                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      const fallback = e.target.nextSibling;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={mediaUrl}
                                    alt={product.name}
                                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      const fallback = e.target.nextSibling;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                );
                              })()
                            : null}

                          {/* Fallback icon (first letter) */}
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 items-center justify-center text-white font-bold hidden">
                            {product.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="ml-3">
                          <div className="text-sm font-medium capitalize text-gray-800 truncate max-w-[150px]">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            Slug: {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 truncate max-w-[100px]">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800"></td>
                    <td className="px-4 py-3">
                      <Switch
                        onChange={() =>
                          handleToggle(
                            product._id,
                            "isActive",
                            product.isActive
                          )
                        }
                        height={20}
                        width={40}
                        checked={product.isActive}
                        disabled={loading}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800"></td>
                    <td className="px-4 py-3 text-sm text-gray-800 truncate max-w-[120px]">
                      <div>
                        <Switch
                          onChange={() =>
                            handleToggle(
                              product._id,
                              "isSoldOut",
                              product.isSoldOut
                            )
                          }
                          height={20}
                          width={40}
                          checked={product.isSoldOut}
                          disabled={loading}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewProduct(product._id)}
                          disabled={loading || modalState.isOpen}
                          className={`p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors duration-200 hover:cursor-pointer${
                            loading || modalState.isOpen
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title="View product"
                          aria-label={`View ${product.name}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => startEdit(product)}
                          disabled={loading || modalState.isOpen}
                          className={`p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors duration-200 hover:cursor-pointer${
                            loading || modalState.isOpen
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <DeleteProduct
                          productId={product._id}
                          productName={product.name}
                          isLoading={loading}
                          setIsLoading={setLoading}
                          searchQuery={searchQuery}
                          onDeleteInitiate={onDeleteInitiate}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors duration-200 hover:cursor-pointer"
                          title="Delete product"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          showFirstLast={true}
          showInfo={true}
          className="text-gray-800 bg-gray-50 hover:cursor-pointer"
        />
      </footer>

      {modalState.isOpen && modalState.product && (
        <UpdateProduct
          product={modalState.product}
          categories={categories}
          onClose={() => {
            setModalState({ isOpen: false, product: null });
            localStorage.setItem("isModalOpen", false);
          }}
          onSuccess={async () => {
            setModalState({ isOpen: false, product: null });
            await fetchProducts();
          }}
          updating={loading}
          setUpdating={setLoading}
        />
      )}
    </div>
  );
};

export default ProductList;
