import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MoveLeft } from "lucide-react";

// Utility function to prepend base URL to image/video paths
const getFullMediaUrl = (url) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:4000"; // Fallback to localhost if env variable is not set
  if (!url) return "";
  // Check if the URL already includes a protocol (http:// or https://)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `${baseUrl}/${cleanUrl}`;
};

const ProductDetail = () => {
  const location = useLocation();
  const { product } = location.state || {};

  // Fallback for when no product data is passed
  const displayProduct = product || {
    name: "Sample Product",
    discount: 0,
    rating: 4,
    description: "This is a sample product description.",
    specifications: { material: "Cotton", fit: "Regular" },
    variants: [],
  };

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMedia, setSelectedMedia] = useState("");

  // Helper to detect if a URL points to a video file
  const isVideo = (url) => {
    return url?.match(/\.(mp4|webm|ogg)$/i);
  };

  // Effect to initialize state when the component mounts or product data changes
  useEffect(() => {
    if (displayProduct.variants?.length > 0) {
      const firstVariant = displayProduct.variants[0];
      setSelectedVariant(firstVariant);

      const primaryImage =
        firstVariant.images?.find((img) => img.isPrimary) ||
        firstVariant.images?.[0];

      setSelectedMedia(primaryImage?.url || "");
      setSelectedSize(firstVariant.sizes?.[0]?.size || "");
    }
  }, [displayProduct]);

  // Handler for selecting a new product variant (e.g., from color swatches)
  const handleVariantSelect = (variant) => {
    const primaryImage =
      variant.images?.find((img) => img.isPrimary) || variant.images?.[0];
    setSelectedVariant(variant);
    setSelectedMedia(primaryImage?.url || ""); // Show the primary image of the new variant
    setSelectedSize(variant.sizes?.[0]?.size || ""); // Default to the first size
  };

  // Handler for selecting a size
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Utility to get price info for the selected variant
  const getCurrentPriceInfo = () => {
    if (!selectedVariant) return { price: 0, discount: 0, finalPrice: 0 };
    return {
      price: selectedVariant.price || 0,
      discount: selectedVariant.discount || 0,
      finalPrice: selectedVariant.finalPrice || selectedVariant.price || 0,
    };
  };

  const { price, discount, finalPrice } = getCurrentPriceInfo();

  return (
    <div className="bg-gray-50 font-sans p-6 mt-20 m-6 rounded-lg shadow-md">
      {/* Back Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => window.history.back()}
          className="text-black px-4 py-2 rounded-lg transition-colors border border-gray-300 hover:bg-gray-100 hover:border-black hover:cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MoveLeft /> Back
          </span>
        </button>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Media Section */}
        <div className="flex flex-row gap-4 w-full md:w-1/2">
          {/* Thumbnails show all media for ALL variants. */}
          <div className="flex flex-col gap-2 w-25 h-100 overflow-y-auto">
            {displayProduct.variants?.map((variant) => (
              <React.Fragment key={variant._id || variant.color.name}>
                {variant.images?.map((image, idx) => (
                  <div
                    key={image.url || idx}
                    className={`h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden border ${
                      selectedMedia === image.url
                        ? "border-black border-2"
                        : "border-gray-300"
                    } cursor-pointer transition-all`}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setSelectedMedia(image.url);
                    }}
                  >
                    {isVideo(image.url) ? (
                      <video
                        src={getFullMediaUrl(image.url)} // Use utility function
                        muted
                        autoPlay
                        loop
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={getFullMediaUrl(image.url)} // Use utility function
                        alt="product thumbnail"
                        className="max-h-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Main Media Display */}
          <div className="bg-gray-200 h-110 flex items-center justify-center rounded-lg overflow-hidden flex-1">
            {selectedMedia ? (
              isVideo(selectedMedia) ? (
                <video
                  src={getFullMediaUrl(selectedMedia)} // Use utility function
                  controls
                  muted
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={getFullMediaUrl(selectedMedia)} // Use utility function
                  alt={displayProduct.name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <span className="text-gray-500">No media available</span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-semibold text-gray-800">
            {displayProduct.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < (selectedVariant?.rating || displayProduct.rating || 0)
                      ? "fill-current"
                      : "fill-gray-300"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">
              ({selectedVariant?.rating || displayProduct.rating || 0})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 text-xl font-bold text-gray-800">
            ₹{finalPrice.toFixed(2)}{" "}
            {discount > 0 && (
              <span className="text-gray-500 line-through text-base">
                ₹{price.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-green-600 text-base ml-2">
                ({discount}% off)
              </span>
            )}
          </div>

          {/* Stock Status */}
          {displayProduct.isSoldOut && (
            <div className="mt-2">
              <p className="text-red-600 font-semibold">Out of Stock</p>
            </div>
          )}

          {/* Size Selection */}
          {selectedVariant?.sizes?.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Size:</p>
              <div className="flex gap-2 mt-2">
                {selectedVariant.sizes.map((sizeObj, index) => (
                  <button
                    key={sizeObj.size || index}
                    className={`border px-4 py-2 rounded-lg text-sm transition-colors hover:cursor-pointer ${
                      selectedSize === sizeObj.size
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-black"
                    }`}
                    onClick={() => handleSizeSelect(sizeObj.size)}
                  >
                    {sizeObj.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {displayProduct.variants?.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Color:</p>
              <div className="flex gap-2 mt-2">
                {displayProduct.variants.map((variant) => (
                  <button
                    key={variant._id || variant.color?.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedVariant?._id === variant._id
                        ? "border-black scale-110"
                        : "border-gray-300 hover:border-gray-600 hover:scale-105"
                    } ${
                      displayProduct.variants.length === 1
                        ? "cursor-default"
                        : "hover:cursor-pointer"
                    }`}
                    style={{
                      backgroundColor:
                        variant.color?.hex || variant.color?.name,
                    }}
                    onClick={() =>
                      displayProduct.variants.length > 1 &&
                      handleVariantSelect(variant)
                    }
                    title={`${variant.color?.name} - ₹${
                      variant.finalPrice || variant.price
                    }`}
                  >
                    {selectedVariant?._id === variant._id && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedVariant?.color?.name && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedVariant.color.name}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {displayProduct.description && (
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Description:</p>
              <p className="text-gray-700 text-sm mt-1">
                {displayProduct.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {displayProduct.specifications && (
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Specifications:</p>
              <div className="text-sm text-gray-700 mt-1">
                {displayProduct.specifications.material && (
                  <p>
                    <span className="font-medium">Material:</span>{" "}
                    {displayProduct.specifications.material}
                  </p>
                )}
                {displayProduct.specifications.fit && (
                  <p>
                    <span className="font-medium">Fit:</span>{" "}
                    {displayProduct.specifications.fit}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;