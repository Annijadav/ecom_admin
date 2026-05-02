import React, { useEffect, useState, useCallback, useRef } from "react";
import { Upload, X, Plus } from "lucide-react";
import Switch from "react-switch";
import axios from "axios";
import { GET, POST } from "../../config/api_helper";
import { useNavigate } from "react-router-dom";
import {
  GET_CATEGORIES_URL,
  CREATE_PRODUCT_URL,
  GET_COLORS_URL,
} from "../../config/url_helper";
import { toast } from "react-toastify";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    isFeatured: false,
    isSoldOut: false,
    isVisible: true,
    isActive: true,
    price: "",
    discount: "",
    rating: "",
    specifications: {
      material: "",
      fit: "",
    },
    collections: [],
    tags: [],
    variants: [
      {
        price: "",
        sizes: [],
        color: [],
        images: [],
        discount: "",
        rating: "",
        newSize: "",
      },
    ],
  });

  const [categories, setCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState({
    categories: false,
    colors: false,
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState({});

const validateField = (
  name,
  value,
  variantIndex = null,
  sizeIndex = null
) => {
  let error = "";
  if (name === "category" && !value) {
    error = "Category is required";
  } else if (name === "name") {
    if (!value.trim()) error = "Product name is required";
    else if (value.length > 100)
      error = "Name must be 100 characters or less";
  } else if (name === "description") {
    if (!value.trim()) error = "Description is required";
    else if (value.length > 10000)
      error = "Description must be 10,000 characters or less";
  } else if (name === "material" && value) {
    if (value.length > 100) error = "Material must be 100 characters or less";
  } else if (name === "fit" && value) {
    if (value.length > 100) error = "Fit must be 100 characters or less";
  } 
  // else if (name === "price") {
  //   if (!value || value == "") error = "Price is required";
  //   // else {
  //   //   const numericValue = parseFloat(value);
  //   //   if (isNaN(numericValue)) error = "Price must be a valid number";
  //   //   else if (numericValue < 0) error = "Price must be a positive number";
  //   //   else if (numericValue > 999999.99) error = "Price must be less than 999999.99";
  //   //   else {
  //   //     // Normalize the value to handle browser formatting (e.g., "10.0" to "10")
  //   //     const normalizedValue = numericValue.toFixed(2);
  //   //     if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue))
  //   //       error = "Price must have at most 2 decimal places";
  //   //   }
  //   // }
  // } 
  else if (name === "discount" && value) {
    if (isNaN(value) || value < 0 || value > 100)
      error = "Discount must be between 0 and 100";
    else if (!/^\d+(\.\d{1,2})?$/.test(value))
      error = "Discount must have at most 2 decimal places";
  } else if (name === "rating" && value) {
    if (isNaN(value) || value < 0 || value > 5)
      error = "Rating must be between 0 and 5";
  } 
  else if (name === "variant_price" && variantIndex !== null) {
    
    if (!value ) error = "Price is required";
    // else {
    //   const numericValue = parseFloat(value);
    //   if (isNaN(numericValue)) error = "Price must be a valid number";
    //   else if (numericValue < 0) error = "Price must be a positive number";
    //   else if (numericValue > 999999.99) error = "Price must be less than 999999.99";
    //   else {
    //     // Normalize the value to handle browser formatting (e.g., "10.0" to "10")
    //     const normalizedValue = numericValue.toFixed(2);
    //     if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue))
    //       error = "Price must have at most 2 decimal places";
    //   }
    // }
  } 
  else if (name === "variant_images" && variantIndex !== null) {
    if (value.length === 0) error = "At least one image is required";
  } else if (name === "variant_discount" && variantIndex !== null && value) {
    if (isNaN(value) || value < 0 || value > 100)
      error = "Discount must be between 0 and 100";
    else if (!/^\d+(\.\d{1,2})?$/.test(value))
      error = "Discount must have at most 2 decimal places";
  } else if (name === "variant_rating" && variantIndex !== null && value) {
    if (isNaN(value) || value < 0 || value > 5)
      error = "Rating must be between 0 and 5";
  }
  return error;
};

  const validateForm = () => {
    const newErrors = {};

    newErrors.category = validateField("category", formData.category);
    newErrors.name = validateField("name", formData.name);
    newErrors.description = validateField("description", formData.description);
    newErrors.material = validateField(
      "material",
      formData.specifications.material
    );
    newErrors.fit = validateField("fit", formData.specifications.fit);
    newErrors.price = validateField("price", formData.price);
    newErrors.discount = validateField("discount", formData.discount);
    newErrors.rating = validateField("rating", formData.rating);

    formData.variants.forEach((variant, variantIndex) => {
      newErrors[`variant_${variantIndex}_price`] = validateField(
        "variant_price",
        variant.price,
        variantIndex
      );
      newErrors[`variant_${variantIndex}_color`] = validateField(
        "variant_color",
        variant.color,
        variantIndex
      );
      newErrors[`variant_${variantIndex}_sizes`] = validateField(
        "variant_sizes",
        variant.sizes,
        variantIndex
      );
      newErrors[`variant_${variantIndex}_images`] = validateField(
        "variant_images",
        variant.images,
        variantIndex
      );
      newErrors[`variant_${variantIndex}_discount`] = validateField(
        "variant_discount",
        variant.discount,
        variantIndex
      );
      newErrors[`variant_${variantIndex}_rating`] = validateField(
        "variant_rating",
        variant.rating,
        variantIndex
      );
      variant.sizes.forEach((sizeData, sizeIndex) => {
        newErrors[`variant_${variantIndex}_size_${sizeIndex}_stock`] =
          validateField("size_stock", sizeData.stock, variantIndex, sizeIndex);
      });
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const response = await GET(GET_CATEGORIES_URL);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading((prev) => ({ ...prev, colors: true }));
        const response = await GET(GET_COLORS_URL);
        setAvailableColors(response.data.colors || []);
      } catch (error) {
        console.error("Error fetching colors:", error);
        toast.error("Failed to load colors. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, colors: false }));
      }
    };
    fetchColors();
  }, []);

  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category
      );
      const sizes = selectedCategory?.sizes || [];
      setAvailableSizes(sizes.map((size) => size.label));

      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((variant) => ({
          ...variant,
          sizes: variant.sizes.filter((size) =>
            sizes.some((s) => s.label === size.size)
          ),
        })),
      }));
    } else {
      setAvailableSizes([]);
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((variant) => ({ ...variant, sizes: [] })),
      }));
    }
  }, [formData.category, categories]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  }, []);

  const handleInputBlur = useCallback(
    (e, variantIndex = null) => {
      const { name, value } = e.target;
      setErrors((prev) => ({
        ...prev,
        [variantIndex !== null ? `variant_${variantIndex}_${name}` : name]:
          validateField(
            variantIndex !== null ? `variant_${name}` : name,
            value,
            variantIndex
          ),
      }));
    },
    []
  );

  const handleSpecificationChange = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  }, []);

  const handleVariantChange = useCallback((variantIndex, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      if (field === "color") {
        const newColors = Array.from(new Set([...value]));
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          [field]: newColors,
        };
      } else {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          [field]: value,
        };
      }
      return { ...prev, variants: newVariants };
    });
    setErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_${field}`]: validateField(
        `variant_${field}`,
        value,
        variantIndex
      ),
    }));
  }, []);

  const removeColor = useCallback(
    (variantIndex, colorId) => {
      setFormData((prev) => {
        const newVariants = [...prev.variants];
        newVariants[variantIndex].color = newVariants[variantIndex].color.filter(
          (id) => id !== colorId
        );
        return { ...prev, variants: newVariants };
      });
      setErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_color`]: validateField(
          "variant_color",
          formData.variants[variantIndex].color.filter((id) => id !== colorId),
          variantIndex
        ),
      }));
    },
    [formData.variants]
  );

  const addSizeToVariant = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    const variant = updatedVariants[variantIndex];

    const newSizeValue = variant.newSize?.trim();
    if (!newSizeValue) {
      setErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_newSize`]: "Size cannot be empty",
      }));
      return;
    }

    if (!variant.sizes) variant.sizes = [];

    if (variant.sizes.some((s) => s.size === newSizeValue)) {
      setErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_newSize`]: `Size "${newSizeValue}" already exists`,
      }));
      return;
    }

    variant.sizes.push({ size: newSizeValue });
    variant.newSize = "";

    setFormData({ ...formData, variants: updatedVariants });
    setErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_newSize`]: "",
      [`variant_${variantIndex}_sizes`]: validateField(
        "variant_sizes",
        [...variant.sizes, { size: newSizeValue }],
        variantIndex
      ),
    }));
  };

  const removeSizeFromVariant = (variantIndex, sizeIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setFormData({ ...formData, variants: updatedVariants });
    setErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_sizes`]: validateField(
        "variant_sizes",
        updatedVariants[variantIndex].sizes,
        variantIndex
      ),
    }));
  };

  const addVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          price: "",
          sizes: [],
          color: [],
          images: [],
          discount: "",
          rating: "",
          newSize: "",
        },
      ],
    }));
    const newVariantIndex = formData.variants.length;
    setErrors((prev) => ({
      ...prev,
      [`variant_${newVariantIndex}_price`]: "",
      [`variant_${newVariantIndex}_color`]: "",
      [`variant_${newVariantIndex}_sizes`]: "",
      [`variant_${newVariantIndex}_images`]: "",
      [`variant_${newVariantIndex}_discount`]: "",
      [`variant_${newVariantIndex}_rating`]: "",
    }));
  }, [formData.variants]);

  const removeVariant = useCallback(
    (index) => {
      if (formData.variants.length > 1) {
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => {
          const newPreviews = { ...prev };
          delete newPreviews[index];
          return newPreviews;
        });
        setUploadErrors((prev) => {
          const newErrors = { ...prev };
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`image_variant_${index}_`)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });
        setErrors((prev) => {
          const newErrors = { ...prev };
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`variant_${index}_`)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });
      }
    },
    [formData.variants]
  );

  const handleImageUpload = useCallback(
    async (variantIndex, event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const errors = {};
      const validFiles = [];
      const newPreviews = [];
      const existingFiles = new Set(
        formData.variants[variantIndex].images.map(
          (img) => `${img.file.name}:${img.file.size}`
        )
      );

      const filePromises = files.map((file, index) => {
        return new Promise((resolve) => {
          if (file.size > 5 * 1024 * 1024) {
            errors[`image_variant_${variantIndex}_${index}`] =
              "File size must be less than 5MB";
            resolve();
            return;
          }
          const fileKey = `${file.name}:${file.size}`;
          if (
            existingFiles.has(fileKey) ||
            validFiles.some((vf) => `${vf.name}:${vf.size}` === fileKey)
          ) {
            errors[
              `image_variant_${variantIndex}_${index}`
            ] = `Duplicate file: ${file.name}`;
            resolve();
            return;
          }
          validFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push({
              preview: e.target.result,
              name: file.name,
              size: file.size,
              isPrimary:
                newPreviews.length === 0 && validFiles.length === index + 1,
            });
            resolve();
          };
          reader.onerror = () => {
            errors[`image_variant_${variantIndex}_${index}`] =
              "Error reading file";
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      await Promise.all(filePromises);
      if (validFiles.length > 0) {
        setFormData((prev) => {
          const newVariants = [...prev.variants];
          newVariants[variantIndex].images = [
            ...newVariants[variantIndex].images,
            ...validFiles.map((f, idx) => ({
              file: f,
              isPrimary:
                idx === 0 && newVariants[variantIndex].images.length === 0,
              alt: f.name,
            })),
          ];
          return { ...prev, variants: newVariants };
        });
        setImagePreviews((prev) => ({
          ...prev,
          [variantIndex]: [...(prev[variantIndex] || []), ...newPreviews],
        }));
        setErrors((prev) => ({
          ...prev,
          [`variant_${variantIndex}_images`]: validateField(
            "variant_images",
            [
              ...formData.variants[variantIndex].images,
              ...validFiles.map((f) => ({
                file: f,
                isPrimary: false,
                alt: f.name,
              })),
            ],
            variantIndex
          ),
        }));
      }
      if (Object.keys(errors).length > 0) {
        setUploadErrors((prev) => ({ ...prev, ...errors }));
        toast.error("Some images could not be uploaded. Check errors below.");
      }
      event.target.value = "";
    },
    [formData.variants]
  );

  const removeImage = useCallback(
    (variantIndex, imageIndex) => {
      setFormData((prev) => {
        const newVariants = [...prev.variants];
        const wasPrimary =
          newVariants[variantIndex].images[imageIndex].isPrimary;
        newVariants[variantIndex].images = newVariants[
          variantIndex
        ].images.filter((_, i) => i !== imageIndex);
        if (wasPrimary && newVariants[variantIndex].images.length > 0) {
          newVariants[variantIndex].images[0].isPrimary = true;
        }
        return { ...prev, variants: newVariants };
      });
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        newPreviews[variantIndex] = prev[variantIndex].filter(
          (_, i) => i !== imageIndex
        );
        if (
          newPreviews[variantIndex]?.length > 0 &&
          !newPreviews[variantIndex].some((img) => img.isPrimary)
        ) {
          newPreviews[variantIndex][0].isPrimary = true;
        }
        return newPreviews;
      });
      setUploadErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`image_variant_${variantIndex}_${imageIndex}`];
        return newErrors;
      });
      setErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_images`]: validateField(
          "variant_images",
          formData.variants[variantIndex].images.filter(
            (_, i) => i !== imageIndex
          ),
          variantIndex
        ),
      }));
    },
    [formData.variants]
  );

  const togglePrimaryImage = useCallback((variantIndex, imageIndex) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].images = newVariants[variantIndex].images.map(
        (image, i) => ({
          ...image,
          isPrimary: i === imageIndex,
        })
      );
      return { ...prev, variants: newVariants };
    });
    setImagePreviews((prev) => {
      const variantPreviews = [...(prev[variantIndex] || [])];
      variantPreviews.forEach((preview, i) => {
        preview.isPrimary = i === imageIndex;
      });
      return { ...prev, [variantIndex]: variantPreviews };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorSummary = Object.values(errors)
        .filter((error) => error)
        .join(", ");
      toast.error(
        errorSummary
          ? `Please fix the following errors: ${errorSummary}`
          : "Please fix all validation errors before submitting."
      );
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();

      submitData.append("category", formData.category);
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("discount", formData.discount || "");
      submitData.append("rating", formData.rating || "");
      submitData.append("isFeatured", formData.isFeatured.toString());
      submitData.append("isSoldOut", formData.isSoldOut.toString());
      submitData.append("isVisible", formData.isVisible.toString());
      submitData.append("isActive", formData.isActive.toString());
      submitData.append(
        "specifications",
        JSON.stringify(formData.specifications)
      );
      submitData.append("collections", JSON.stringify(formData.collections));

      formData.variants.forEach((variant, index) => {
        submitData.append(`variants[${index}][price]`, variant.price);
        variant.color.forEach((colorId, colorIndex) => {
          submitData.append(`variants[${index}][color][${colorIndex}]`, colorId);
        });
        submitData.append(
          `variants[${index}][discount]`,
          variant.discount || ""
        );
        submitData.append(`variants[${index}][rating]`, variant.rating || "");
        variant.sizes.forEach((sizeData, sizeIndex) => {
          submitData.append(
            `variants[${index}][sizes][${sizeIndex}][size]`,
            sizeData.size
          );
        });
        const seenFiles = new Set();
        variant.images.forEach((image, imgIndex) => {
          const fileKey = `${image.file.name}:${image.file.size}`;
          if (!seenFiles.has(fileKey)) {
            submitData.append(`variants[${index}][image]`, image.file);
            submitData.append(
              `variants[${index}][images][${imgIndex}][isPrimary]`,
              image.isPrimary.toString()
            );
            submitData.append(
              `variants[${index}][images][${imgIndex}][alt]`,
              image.alt
            );
            seenFiles.add(fileKey);
          } else {
            console.warn(`Duplicate image skipped: ${image.file.name}`);
          }
        });
      });

      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
      const response = await axios.post(
        `${BASE_URL}${CREATE_PRODUCT_URL}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success("Product created successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error creating product:", error);
      const message =
        error.response?.data?.message ||
        "Failed to create product. Please check your network or try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (variantIndex) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [variantIndex]: !prev[variantIndex],
    }));
  };

  const handleClickOutside = useCallback(
    (event, variantIndex, dropdownRef) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen((prev) => ({
          ...prev,
          [variantIndex]: false,
        }));
      }
    },
    []
  );

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Create New Product</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          aria-label="Back to products"
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Select Category <span className="text-red-500 ml-1">*</span>
            </label>
            {loading.categories ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">
                  Loading categories...
                </span>
              </div>
            ) : (
              <>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-2 border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {!cat.isActive && "(Disabled)"}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p id="category-error" className="text-red-500 text-xs mt-1">
                    {errors.category}
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`w-full px-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter product name"
              // required
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            rows={4}
            className={`w-full px-3 py-2 border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Product description"
            // required
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          {errors.description && (
            <p id="description-error" className="text-red-500 text-xs mt-1">
              {errors.description}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Product Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Featured</span>
              <Switch
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked }))
                }
                checked={formData.isFeatured}
                onColor="#16A34A"
                offColor="#6B7280"
                handleDiameter={20}
                height={24}
                width={48}
                aria-label="Toggle product featured status"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Sold Out</span>
              <Switch
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isSoldOut: checked }))
                }
                checked={formData.isSoldOut}
                onColor="#16A34A"
                offColor="#6B7280"
                handleDiameter={20}
                height={24}
                width={48}
                aria-label="Toggle product sold out status"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Status</span>
              <Switch
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
                checked={formData.isActive}
                onColor="#16A34A"
                offColor="#6B7280"
                handleDiameter={20}
                height={24}
                width={48}
                aria-label="Toggle product active status"
              />
            </label>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={formData.specifications.material}
                onChange={(e) =>
                  handleSpecificationChange("material", e.target.value)
                }
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    material: validateField(
                      "material",
                      formData.specifications.material
                    ),
                  }))
                }
                className={`w-full px-3 py-2 border ${
                  errors.material ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Material (e.g., Cotton)"
                aria-describedby={
                  errors.material ? "material-error" : undefined
                }
              />
              {errors.material && (
                <p id="material-error" className="text-red-500 text-xs mt-1">
                  {errors.material}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit
              </label>
              <input
                type="text"
                value={formData.specifications.fit}
                onChange={(e) =>
                  handleSpecificationChange("fit", e.target.value)
                }
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    fit: validateField("fit", formData.specifications.fit),
                  }))
                }
                className={`w-full px-3 py-2 border ${
                  errors.fit ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Fit type (e.g., Regular)"
                aria-describedby={errors.fit ? "fit-error" : undefined}
              />
              {errors.fit && (
                <p id="fit-error" className="text-red-500 text-xs mt-1">
                  {errors.fit}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Product Details
          </h3>
          {/* <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-700">Variants</h4>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              aria-label="Add new variant"
            >
              <Plus size={16} className="inline mr-1" /> Add Variant
            </button>
          </div> */}
          {formData.variants.map((variant, variantIndex) => {
            const dropdownRef = useRef(null);

            useEffect(() => {
              const handleOutsideClick = (event) => {
                handleClickOutside(event, variantIndex, dropdownRef);
              };
              document.addEventListener("mousedown", handleOutsideClick);
              return () => {
                document.removeEventListener("mousedown", handleOutsideClick);
              };
            }, [variantIndex, handleClickOutside]);

            return (
              <div
                key={variantIndex}
                className="mb-6 p-4 bg-white border border-gray-200 rounded-md"
                role="group"
                aria-labelledby={`variant-${variantIndex}-heading`}
              >
                <div className="flex justify-between items-center mb-4">
                  {/* <h4
                    id={`variant-${variantIndex}-heading`}
                    className="text-md font-medium text-gray-700"
                  >
                    Variant #{variantIndex + 1}
                  </h4> */}
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Remove variant ${variantIndex + 1}`}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                   Product Price<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(variantIndex, "price", e.target.value)
                      }
                      onBlur={(e) => handleInputBlur(e, variantIndex)}
                      step="0.01"
                      min="0"
                     
                      className={`w-full px-3 py-2 border ${
                        errors[`variant_${variantIndex}_price`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Product price"
                      // required
                      aria-describedby={
                        errors[`variant_${variantIndex}_price`]
                          ? `variant-${variantIndex}-price-error`
                          : undefined
                      }
                    />
                    {errors[`variant_${variantIndex}_price`] && (
                      <p
                        id={`variant-${variantIndex}-price-error`}
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors[`variant_${variantIndex}_price`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={variant.discount}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "discount",
                          e.target.value
                        )
                      }
                      onBlur={(e) => handleInputBlur(e, variantIndex)}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-3 py-2 border ${
                        errors[`variant_${variantIndex}_discount`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter discount"
                      aria-describedby={
                        errors[`variant_${variantIndex}_discount`]
                          ? `variant-${variantIndex}-discount-error`
                          : undefined
                      }
                    />
                    {errors[`variant_${variantIndex}_discount`] && (
                      <p
                        id={`variant-${variantIndex}-discount-error`}
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors[`variant_${variantIndex}_discount`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (out of 5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={variant.rating}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "rating",
                          e.target.value
                        )
                      }
                      onBlur={(e) => handleInputBlur(e, variantIndex)}
                      className={`w-full px-3 py-2 border ${
                        errors[`variant_${variantIndex}_rating`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter rating"
                      aria-describedby={
                        errors[`variant_${variantIndex}_rating`]
                          ? `variant-${variantIndex}-rating-error`
                          : undefined
                      }
                    />
                    {errors[`variant_${variantIndex}_rating`] && (
                      <p
                        id={`variant-${variantIndex}-rating-error`}
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors[`variant_${variantIndex}_rating`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colors
                    </label>
                    {loading.colors ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500">
                          Loading colors...
                        </span>
                      </div>
                    ) : availableColors.length === 0 ? (
                      <p className="text-sm text-gray-500">No colors available</p>
                    ) : (
                      <div className="relative" ref={dropdownRef}>
                        <div
                          className={`w-full px-3 py-2 border ${
                            errors[`variant_${variantIndex}_color`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap gap-2 items-center min-h-[40px] cursor-pointer`}
                          onClick={() => toggleDropdown(variantIndex)}
                        >
                          {variant.color.length === 0 ? (
                            <span className="text-gray-500">Select colors...</span>
                          ) : (
                            variant.color.map((colorId) => {
                              const color = availableColors.find(
                                (c) => c._id === colorId
                              );
                              return color ? (
                                <div
                                  key={color._id}
                                  className="bg-gray-200 text-sm px-2.5 py-1 rounded-full flex items-center gap-1"
                                >
                                  {color.name}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeColor(variantIndex, color._id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : null;
                            })
                          )}
                        </div>
                        {isDropdownOpen[variantIndex] && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {availableColors.map((color) => (
                              <div
                                key={color._id}
                                className={`px-3 py-1 cursor-pointer hover:bg-gray-100 pl-4 ${
                                  variant.color.includes(color._id)
                                    ? "bg-gray-200"
                                    : ""
                                }`}
                                onClick={() => {
                                  if (!variant.color.includes(color._id)) {
                                    handleVariantChange(variantIndex, "color", [
                                      ...variant.color,
                                      color._id,
                                    ]);
                                  } else {
                                    removeColor(variantIndex, color._id);
                                  }
                                }}
                              >
                                {color.name}
                              </div>
                            ))}
                          </div>
                        )}
                        {errors[`variant_${variantIndex}_color`] && (
                          <p
                            id={`variant-${variantIndex}-color-error`}
                            className="text-red-500 text-xs mt-1"
                          >
                            {errors[`variant_${variantIndex}_color`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleImageUpload(variantIndex, e)}
                      className="hidden"
                      id={`image-upload-variant-${variantIndex}`}
                      aria-label={`Upload images for variant ${variantIndex + 1}`}
                    />
                    <label
                      htmlFor={`image-upload-variant-${variantIndex}`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Media
                    </label>
                  </div>
                  {Object.keys(uploadErrors)
                    .filter((key) =>
                      key.startsWith(`image_variant_${variantIndex}_`)
                    )
                    .map((key) => (
                      <p key={key} className="text-red-600 text-sm">
                        {uploadErrors[key]}
                      </p>
                    ))}
                  {errors[`variant_${variantIndex}_images`] && (
                    <p
                      id={`variant-${variantIndex}-images-error`}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors[`variant_${variantIndex}_images`]}
                    </p>
                  )}
                  {imagePreviews[variantIndex]?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                      {imagePreviews[variantIndex].map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${image.name}`}
                            className="w-full h-auto rounded-md object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(variantIndex, index)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove image ${image.name}`}
                          >
                            <X size={16} className="text-red-600" />
                          </button>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 truncate max-w-[80%]">
                              {image.name} ({(image.size / 1024).toFixed(2)} KB)
                            </span>
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={image.isPrimary}
                                onChange={() =>
                                  togglePrimaryImage(variantIndex, index)
                                }
                                className="mr-1"
                                aria-label={`Set ${image.name} as primary image`}
                              />
                              Primary
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sizes
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter size (e.g. M, L, XL)"
                      value={variant.newSize || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "newSize",
                          e.target.value
                        )
                      }
                      onBlur={(e) => handleInputBlur(e, variantIndex)}
                      className={`w-full px-3 py-2 border ${
                        errors[`variant_${variantIndex}_newSize`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      aria-label="Enter a size"
                    />
                    <button
                      type="button"
                      onClick={() => addSizeToVariant(variantIndex)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      aria-label="Add size"
                    >
                      Add
                    </button>
                  </div>
                  {errors[`variant_${variantIndex}_newSize`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`variant_${variantIndex}_newSize`]}
                    </p>
                  )}
                  {errors[`variant_${variantIndex}_sizes`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`variant_${variantIndex}_sizes`]}
                    </p>
                  )}
                  {variant.sizes?.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {variant.sizes.map((sizeObj, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {sizeObj.size}
                          <button
                            type="button"
                            onClick={() =>
                              removeSizeFromVariant(variantIndex, sizeIndex)
                            }
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Remove size ${sizeObj.size}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No sizes added yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            aria-label="Cancel product creation"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Create product"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;