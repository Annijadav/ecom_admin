import React, { useState, useRef } from "react";
import { Heart, Eye, Star, Package, AlertCircle, Edit } from "lucide-react";

/**
 * ProductCard component displays a single product with actions.
 * @param {Object} props
 * @param {Object} props.product - Product data.
 * @param {string|null} props.updatingProduct - ID of product being updated.
 * @param {Object|null} props.deletingProduct - Product being deleted.
 * @param {Function} props.handleFileUpload - Handler for file upload.
 * @param {Function} props.handleViewProduct - Handler for viewing product.
 * @param {Function} props.handleEditProduct - Handler for editing product.
 * @param {Function} props.handleDeleteInitiate - Handler for initiating delete.
 * @returns {JSX.Element}
 */
const ProductCard = ({
  product,
  updatingProduct,
  deletingProduct,
  handleFileUpload,
  handleViewProduct,
  handleEditProduct,
  handleDeleteInitiate,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(product.id, file);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative group">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
          {product.primaryImage ? (
            <img
              src={`${import.meta.env.VITE_BASE_URL}${
                product.primaryImage.url
              }`}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
          {product.isSoldOut && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          )}
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
          aria-label={isLiked ? "Unlike product" : "Like product"}
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => handleViewProduct(product)}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
            {product.category?.name || "Uncategorized"}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="w-3 h-3" />
            {product.viewCount || 0}
          </div>
        </div>

        <h3
          className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
          onClick={() => handleViewProduct(product)}
        >
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-800">
              ${product.price}
            </span>
            <span className="text-xs text-gray-500">
              {product.whatsappInquiryCount || 0} inquiries
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEditProduct}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              title="Edit Product"
              aria-label="Edit product"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleViewProduct(product)}
              disabled={updatingProduct === product.id}
              className={`p-2 rounded-lg transition-colors ${
                updatingProduct === product.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title="View Product"
              aria-label="View product"
            >
              {updatingProduct === product.id ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            <DeleteProduct
              productId={product.id}
              productName={product.name}
              onDeleteInitiate={() => handleDeleteInitiate(product)}
              isDeleting={deletingProduct?.id === product.id}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              title="Delete Product"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
