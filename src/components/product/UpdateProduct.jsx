import React, { useEffect, useState, useCallback, useRef } from "react";
import { Upload, X, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { GET, PUT } from "../../config/api_helper";
import {
  UPDATE_PRODUCT_URL,
  GET_COLORS_URL,
  GET_CATEGORIES_URL,
} from "../../config/url_helper";

const UpdateProduct = ({
  product,
  categories: propCategories,
  onClose,
  onSuccess,
  updating,
  setUpdating,
}) => {
  console.log("Product received in UpdateProduct:", product);
  const [editData, setEditData] = useState({
    category: product?.category?._id || product?.category || "",
    name: product?.name || "",
    description: product?.description || "",
    isFeatured: product?.isFeatured || false,
    isSoldOut: product?.isSoldOut || false,
    isVisible: product?.isActive !== false,
    isActive: product?.isActive !== false,
    specifications: {
      material: product?.specifications?.material || "",
      fit: product?.specifications?.fit || "",
    },
    collections: Array.isArray(product?.collections)
      ? product.collections.map((c) => (typeof c === "string" ? c : c.name))
      : [],
    discount: product?.discount || 0,
    tags: Array.isArray(product?.tags)
      ? product.tags.map((t) => (typeof t === "string" ? t : t.name))
      : [],
    variants:
      product?.variants?.length > 0
        ? product.variants.map((v) => ({
            price: v.price || "",
            sizes: Array.isArray(v.sizes)
              ? v.sizes.map((s) => ({
                  size: s.size || "",
                }))
              : [],
            color: Array.isArray(v.color)
              ? v.color.map((c) => c._id || c)
              : v.color?._id || v.color
                ? [v.color?._id || v.color]
                : [],
            images: Array.isArray(v.images)
              ? v.images.map((img) => ({
                  url: img.url || "",
                  isPrimary: img.isPrimary || false,
                  alt: img.alt || "",
                }))
              : [],
            discount: v.discount ?? 0,
            rating: v.rating ?? 0,
            newSize: "",
          }))
        : [
            {
              price: "",
              sizes: [],
              color: [],
              images: [],
              discount: 0,
              rating: 0,
              newSize: "",
            },
          ],
  });

  const [newTag, setNewTag] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [imagePreviews, setImagePreviews] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [availableColors, setAvailableColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    colors: false,
    submit: false,
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const tagInputRef = useRef(null);

  const tagSuggestions = [
    "man's fashion",
    "woman's fashion",
    "woman Accessories",
    "mens-accessories",
    "discount-deal",
  ];

  // Validation function
  const validateField = (name, value, variantIndex = null) => {
    let error = "";
    if (name === "category" && !value) {
      error = "Category is required";
    } else if (name === "name") {
      if (!value.trim()) error = "Product name is required";
      else if (value.length < 3) error = "Name must be at least 3 characters";
      else if (value.length > 100)
        error = "Name must be 100 characters or less";
    } else if (name === "description") {
      if (!value.trim()) error = "Description is required";
      else if (value.length > 10000)
        error = "Description must be 10,000 characters or less";
    } else if (name === "discount" && value) {
      if (isNaN(value) || value < 0 || value > 100)
        error = "Discount must be between 0 and 100";
    } else if (name === "variant_discount" && variantIndex !== null && value) {
      if (isNaN(value) || value < 0 || value > 100)
        error = "Discount must be between 0 and 100";
    } else if (name === "variant_rating" && variantIndex !== null && value) {
      if (isNaN(value) || value < 0 || value > 5)
        error = "Rating must be between 0 and 5";
    } else if (name === "material" && value) {
      if (value.length > 100) error = "Material must be 100 characters or less";
    } else if (name === "fit" && value) {
      if (value.length > 100) error = "Fit must be 100 characters or less";
    } else if (name === "newCollection" && value) {
      if (value.length > 50) error = "Collection must be 50 characters or less";
    } else if (name === "newTag" && value) {
      if (value.length > 50) error = "Tag must be 50 characters or less";
    } else if (name === "variant_price" && variantIndex !== null) {
      if (!value || isNaN(value) || value <= 0)
        error = "Price must be a positive number";
      else if (value > 999999.99) error = "Price must be less than 999999.99";
    } else if (name === "variant_images" && variantIndex !== null) {
      if (!value || value.length === 0)
        error = "At least one image is required";
    } else if (name === "newSize" && value && variantIndex !== null) {
      if (!value.trim()) error = "Size cannot be empty";
      else if (value.length > 10) error = "Size must be 10 characters or less";
    }
    return error;
  };

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};
    errors.category = validateField("category", editData.category);
    errors.name = validateField("name", editData.name);
    errors.description = validateField("description", editData.description);
    errors.discount = validateField("discount", editData.discount);
    errors.material = validateField(
      "material",
      editData.specifications.material
    );
    errors.fit = validateField("fit", editData.specifications.fit);

    editData.collections.forEach((collection, index) => {
      if (collection.length > 50) {
        errors[`collection_${index}`] =
          "Collection must be 50 characters or less";
      }
    });

    editData.tags.forEach((tag, index) => {
      if (tag.length > 50) {
        errors[`tag_${index}`] = "Tag must be 50 characters or less";
      }
    });

    editData.variants.forEach((variant, index) => {
      errors[`variant_${index}_price`] = validateField(
        "variant_price",
        variant.price,
        index
      );
      errors[`variant_${index}_color`] = validateField(
        "variant_color",
        variant.color,
        index
      );
      errors[`variant_${index}_sizes`] = validateField(
        "variant_sizes",
        variant.sizes,
        index
      );
      errors[`variant_${index}_images`] = validateField(
        "variant_images",
        variant.images,
        index
      );
      errors[`variant_${index}_discount`] = validateField(
        "variant_discount",
        variant.discount,
        index
      );
      errors[`variant_${index}_rating`] = validateField(
        "variant_rating",
        variant.rating,
        index
      );
      errors[`variant_${index}_newSize`] = validateField(
        "newSize",
        variant.newSize,
        index
      );
    });

    setFormErrors(errors);
    return Object.keys(errors).every((key) => !errors[key]);
  }, [editData]);

  // Handle input blur for validation
  const handleInputBlur = useCallback((e, variantIndex = null) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({
      ...prev,
      [variantIndex !== null ? `variant_${variantIndex}_${name}` : name]:
        validateField(name, value, variantIndex),
    }));
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const response = await GET(GET_CATEGORIES_URL);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again.",error);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, []);

  // Update available sizes and auto-add to variants when category changes
  useEffect(() => {
    if (editData.category) {
      const selectedCategory = categories.find(
        (cat) => cat._id === editData.category
      );
      const sizes = selectedCategory?.sizes?.map((size) => size.label) || [];
      setAvailableSizes(sizes);

      setEditData((prev) => ({
        ...prev,
        variants: prev.variants.map((variant) => {
          const existingSizes = variant.sizes.map((s) => s.size);
          const newSizes = [
            ...variant.sizes,
            ...sizes
              .filter((size) => !existingSizes.includes(size))
              .map((size) => ({ size })),
          ];
          return {
            ...variant,
            sizes: newSizes,
          };
        }),
      }));
    } else {
      setAvailableSizes([]);
    }
    setFormErrors((prev) => ({
      ...prev,
      category: validateField("category", editData.category),
    }));
  }, [editData.category, categories]);

  // Fetch colors
  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading((prev) => ({ ...prev, colors: true }));
        const response = await GET(GET_COLORS_URL);
        setAvailableColors(response.data.colors || []);
      } catch (error) {
        console.error("Error fetching colors:", error);
        toast.error("Failed to fetch colors");
      } finally {
        setLoading((prev) => ({ ...prev, colors: false }));
      }
    };

    fetchColors();
  }, []);

  // Update image previews
  useEffect(() => {
    const previews = {};
    editData.variants.forEach((variant, variantIndex) => {
      previews[variantIndex] = variant.images
        .map((image, imgIndex) => {
          if (!image.url && !image.file) {
            return null;
          }
          return {
            preview: image.url
              ? `${image.url}`
              : image.file instanceof File
                ? URL.createObjectURL(image.file)
                : "",
            name: image.url
              ? `Existing Image ${imgIndex + 1}`
              : image.file?.name || `Image ${imgIndex + 1}`,
            size: image.url ? 0 : image.file?.size || 0,
            existing: !!image.url,
            isPrimary: image.isPrimary || false,
          };
        })
        .filter((preview) => preview !== null);
    });

    setImagePreviews((prev) => {
      Object.values(prev).forEach((variantPreviews) => {
        variantPreviews.forEach((preview) => {
          if (preview.preview && !preview.existing) {
            URL.revokeObjectURL(preview.preview);
          }
        });
      });
      return previews;
    });

    return () => {
      Object.values(imagePreviews).forEach((variantPreviews) => {
        variantPreviews.forEach((preview) => {
          if (preview.preview && !preview.existing) {
            URL.revokeObjectURL(preview.preview);
          }
        });
      });
    };
  }, [editData.variants]);

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTag(value);
    setFormErrors((prev) => ({
      ...prev,
      newTag: validateField("newTag", value),
    }));
    if (value.trim()) {
      const filtered = tagSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions(tagSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleTagInputFocus = () => {
    setFilteredSuggestions(tagSuggestions);
    setShowSuggestions(true);
  };

  const handleTagInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
    setFormErrors((prev) => ({
      ...prev,
      newTag: validateField("newTag", newTag),
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    if (!editData.tags.includes(suggestion)) {
      setEditData((prev) => ({
        ...prev,
        tags: [...prev.tags, suggestion],
      }));
      setNewTag("");
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      setFormErrors((prev) => ({ ...prev, newTag: "" }));
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSpecificationChange = (key, value) => {
    setEditData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
    setFormErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
  };

  const handleVariantChange = (variantIndex, field, value) => {
    setEditData((prev) => {
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
      return {
        ...prev,
        variants: newVariants,
      };
    });
    setFormErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_${field}`]: validateField(
        `variant_${field}`,
        field === "color" ? value : value,
        variantIndex
      ),
    }));
  };

  const removeColor = (variantIndex, colorId) => {
    setEditData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        color: newVariants[variantIndex].color.filter((id) => id !== colorId),
      };
      return {
        ...prev,
        variants: newVariants,
      };
    });
    setFormErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_color`]: validateField(
        "variant_color",
        editData.variants[variantIndex].color.filter((id) => id !== colorId),
        variantIndex
      ),
    }));
  };

  const addSizeToVariant = (variantIndex) => {
    const newSize = editData.variants[variantIndex].newSize?.trim();
    if (!newSize) {
      toast.warn("Please enter a size.");
      setFormErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_newSize`]: validateField(
          "newSize",
          "",
          variantIndex
        ),
      }));
      return;
    }

    const error = validateField("newSize", newSize, variantIndex);
    if (error) {
      setFormErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_newSize`]: error,
      }));
      toast.warn(error);
      return;
    }

    setEditData((prev) => {
      const newVariants = [...prev.variants];
      const variant = newVariants[variantIndex];
      if (!variant.sizes) variant.sizes = [];

      const sizeExists = variant.sizes.some(
        (s) => s.size.toLowerCase() === newSize.toLowerCase()
      );
      if (sizeExists) {
        toast.warn(`Size "${newSize}" is already added to this variant.`);
        return prev;
      }

      variant.sizes.push({ size: newSize });
      newVariants[variantIndex] = { ...variant, newSize: "" };
      return {
        ...prev,
        variants: newVariants,
      };
    });

    setFormErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_sizes`]: validateField(
        "variant_sizes",
        [...editData.variants[variantIndex].sizes, { size: newSize }],
        variantIndex
      ),
      [`variant_${variantIndex}_newSize`]: "",
    }));
  };

  const removeSizeFromVariant = async (variantIndex, sizeIndex) => {
    try {
      setEditData((prev) => {
        const newVariants = [...prev.variants];
        newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter(
          (_, i) => i !== sizeIndex
        );
        return {
          ...prev,
          variants: newVariants,
        };
      });

      setFormErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_sizes`]: validateField(
          "variant_sizes",
          editData.variants[variantIndex].sizes.filter(
            (_, i) => i !== sizeIndex
          ),
          variantIndex
        ),
      }));

      setLoading((prev) => ({ ...prev, submit: true }));
      setUpdating(true);

      const submitData = new FormData();
      submitData.append("category", editData.category);
      submitData.append("name", editData.name);
      submitData.append("description", editData.description);
      submitData.append("isFeatured", editData.isFeatured.toString());
      submitData.append("isSoldOut", editData.isSoldOut.toString());
      submitData.append("isVisible", editData.isVisible.toString());
      submitData.append("isActive", editData.isActive.toString());
      submitData.append("discount", editData.discount || 0);
      submitData.append(
        "specifications",
        JSON.stringify(editData.specifications)
      );
      submitData.append("collections", JSON.stringify(editData.collections));
      submitData.append("tags", JSON.stringify(editData.tags));

      editData.variants.forEach((variant, index) => {
        submitData.append(`variants[${index}][price]`, variant.price);
        variant.color.forEach((colorId, colorIndex) => {
          submitData.append(`variants[${index}][color][${colorIndex}]`, colorId);
        });
        submitData.append(
          `variants[${index}][discount]`,
          variant.discount || 0
        );
        submitData.append(`variants[${index}][rating]`, variant.rating || 0);
        const sizesToSubmit =
          index === variantIndex
            ? variant.sizes.filter((_, i) => i !== sizeIndex)
            : variant.sizes;
        sizesToSubmit.forEach((sizeData, sizeIdx) => {
          submitData.append(
            `variants[${index}][sizes][${sizeIdx}][size]`,
            sizeData.size
          );
        });
        const existingImages = variant.images.filter(
          (image) => image.url && !image.file
        );
        if (existingImages.length > 0) {
          submitData.append(
            `variants[${index}][existingImages]`,
            JSON.stringify(
              existingImages.map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary,
                alt: img.alt,
              }))
            )
          );
        }
        const newImages = variant.images.filter((image) => image.file);
        newImages.forEach((image, imgIndex) => {
          submitData.append(`variants[${index}][image]`, image.file);
          submitData.append(
            `variants[${index}][images][${imgIndex}][isPrimary]`,
            image.isPrimary.toString()
          );
          submitData.append(
            `variants[${index}][images][${imgIndex}][alt]`,
            image.alt || image.file.name
          );
        });
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${UPDATE_PRODUCT_URL}/${product._id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        toast.success("Size removed successfully!");
      }
    } catch (error) {
      console.error("Error removing size:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove size";
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
      setUpdating(false);
    }
  };

  const addVariant = () => {
    const newVariantIndex = editData.variants.length;
    setEditData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          price: "",
          sizes: [...availableSizes.map((size) => ({ size }))],
          color: [],
          images: [],
          discount: 0,
          rating: 0,
          newSize: "",
        },
      ],
    }));

    setFormErrors((prev) => ({
      ...prev,
      [`variant_${newVariantIndex}_price`]: validateField(
        "variant_price",
        "",
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_color`]: validateField(
        "variant_color",
        [],
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_sizes`]: validateField(
        "variant_sizes",
        availableSizes.map((size) => ({ size })),
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_images`]: validateField(
        "variant_images",
        [],
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_discount`]: validateField(
        "variant_discount",
        0,
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_rating`]: validateField(
        "variant_rating",
        0,
        newVariantIndex
      ),
      [`variant_${newVariantIndex}_newSize`]: "",
    }));
  };

  const removeVariant = (index) => {
    if (editData.variants.length > 1) {
      setEditData((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        if (newPreviews[index]) {
          newPreviews[index].forEach((preview) => {
            if (preview.preview && !preview.existing) {
              URL.revokeObjectURL(preview.preview);
            }
          });
          delete newPreviews[index];
        }
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
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(`variant_${index}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    } else {
      toast.warn("At least one variant is required.");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      const error = validateField("newTag", newTag);
      if (error) {
        setFormErrors((prev) => ({ ...prev, newTag: error }));
        return;
      }
      setEditData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
      setShowSuggestions(false);
      setFormErrors((prev) => ({ ...prev, newTag: "" }));
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setEditData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      editData.tags.forEach((tag, index) => {
        if (tag === tagToRemove) {
          delete newErrors[`tag_${index}`];
        }
      });
      return newErrors;
    });
  };

  const addCollection = () => {
    if (
      newCollection.trim() &&
      !editData.collections.includes(newCollection.trim())
    ) {
      const error = validateField("newCollection", newCollection);
      if (error) {
        setFormErrors((prev) => ({ ...prev, newCollection: error }));
        return;
      }
      setEditData((prev) => ({
        ...prev,
        collections: [...prev.collections, newCollection.trim()],
      }));
      setNewCollection("");
      setFormErrors((prev) => ({ ...prev, newCollection: "" }));
    }
  };

  const removeCollection = (collectionToRemove) => {
    setEditData((prev) => ({
      ...prev,
      collections: prev.collections.filter(
        (collection) => collection !== collectionToRemove
      ),
    }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      editData.collections.forEach((collection, index) => {
        if (collection === collectionToRemove) {
          delete newErrors[`collection_${index}`];
        }
      });
      return newErrors;
    });
  };

  const handleImageUpload = useCallback(
    (variantIndex, event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const errors = {};
      const validFiles = [];
      const newPreviews = [];

      const existingImages = editData.variants[variantIndex].images.map(
        (img) => ({
          name: img.file?.name || img.url?.split("/").pop(),
          size: img.file?.size || 0,
        })
      );

      files.forEach((file, index) => {
        if (file.size > 5 * 1024 * 1024) {
          errors[`image_variant_${variantIndex}_${index}`] =
            "File size must be less than 5MB";
          return;
        }
        if (
          existingImages.some(
            (existing) =>
              existing.name === file.name && existing.size === file.size
          ) ||
          validFiles.some(
            (vf) => vf.name === file.name && vf.size === file.size
          )
        ) {
          errors[
            `image_variant_${variantIndex}_${index}`
          ] = `Duplicate file: ${file.name}`;
          return;
        }
        validFiles.push(file);

        const preview = URL.createObjectURL(file);
        newPreviews.push({
          preview,
          name: file.name,
          size: file.size,
          existing: false,
          isPrimary: validFiles.length === 1 && index === 0,
        });
      });

      if (validFiles.length > 0) {
        const currentImages = editData.variants[variantIndex].images || [];
        const updatedImages = [
          ...currentImages,
          ...validFiles.map((f, idx) => ({
            file: f,
            isPrimary: idx === 0 && currentImages.length === 0,
            alt: f.name,
          })),
        ];

        setEditData((prev) => {
          const newVariants = [...prev.variants];
          newVariants[variantIndex].images = updatedImages;
          return { ...prev, variants: newVariants };
        });

        setImagePreviews((prev) => ({
          ...prev,
          [variantIndex]: [...(prev[variantIndex] || []), ...newPreviews],
        }));

        setFormErrors((prev) => ({
          ...prev,
          [`variant_${variantIndex}_images`]: validateField(
            "variant_images",
            updatedImages,
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
    [editData.variants]
  );

  const removeImage = (variantIndex, imageIndex) => {
    let updatedImages = [];

    setEditData((prev) => {
      const newVariants = prev.variants.map((variant) => ({
        ...variant,
        images: [...variant.images],
      }));

      const wasPrimary = newVariants[variantIndex].images[imageIndex]?.isPrimary;

      newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
        (_, i) => i !== imageIndex
      );

      if (wasPrimary && newVariants[variantIndex].images.length > 0) {
        newVariants[variantIndex].images[0].isPrimary = true;
      }

      updatedImages = newVariants[variantIndex].images;

      return { ...prev, variants: newVariants };
    });

    setImagePreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[variantIndex]) {
        const preview = newPreviews[variantIndex][imageIndex];
        if (preview?.preview && !preview.existing) {
          URL.revokeObjectURL(preview.preview);
        }
        newPreviews[variantIndex] = newPreviews[variantIndex].filter(
          (_, i) => i !== imageIndex
        );
        if (
          newPreviews[variantIndex]?.length > 0 &&
          !newPreviews[variantIndex].some((img) => img.isPrimary)
        ) {
          newPreviews[variantIndex][0].isPrimary = true;
        }
      }
      return newPreviews;
    });

    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`image_variant_${variantIndex}_${imageIndex}`];
      return newErrors;
    });

    setFormErrors((prev) => ({
      ...prev,
      [`variant_${variantIndex}_images`]: validateField(
        "variant_images",
        updatedImages,
        variantIndex
      ),
    }));
  };

  const togglePrimaryImage = (variantIndex, imageIndex) => {
    setEditData((prev) => {
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

  const handleProductUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const errorSummary = Object.values(formErrors)
        .filter((error) => error)
        .join(", ");
      toast.error(
        errorSummary
          ? `Please fix the following errors: ${errorSummary}`
          : "Please fix all validation errors before submitting."
      );
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    setUpdating(true);
    try {
      const submitData = new FormData();
      submitData.append("category", editData.category);
      submitData.append("name", editData.name);
      submitData.append("description", editData.description);
      submitData.append("isFeatured", editData.isFeatured.toString());
      submitData.append("isSoldOut", editData.isSoldOut.toString());
      submitData.append("isVisible", editData.isVisible.toString());
      submitData.append("isActive", editData.isActive.toString());
      submitData.append("discount", editData.discount || 0);
      submitData.append("specifications", JSON.stringify(editData.specifications));
      submitData.append("collections", JSON.stringify(editData.collections));
      submitData.append("tags", JSON.stringify(editData.tags));

      editData.variants.forEach((variant, index) => {
        submitData.append(`variants[${index}][price]`, variant.price);
        variant.color.forEach((colorId, colorIndex) => {
          submitData.append(`variants[${index}][color][${colorIndex}]`, colorId);
        });
        submitData.append(
          `variants[${index}][discount]`,
          variant.discount || 0
        );
        submitData.append(`variants[${index}][rating]`, variant.rating || 0);
        variant.sizes.forEach((sizeData, sizeIndex) => {
          submitData.append(
            `variants[${index}][sizes][${sizeIndex}][size]`,
            sizeData.size
          );
        });
        const newImages = variant.images.filter((image) => image.file);
        newImages.forEach((image, imgIndex) => {
          submitData.append(`variants[${index}][image]`, image.file);
          submitData.append(
            `variants[${index}][images][${imgIndex}][isPrimary]`,
            image.isPrimary.toString()
          );
          submitData.append(
            `variants[${index}][images][${imgIndex}][alt]`,
            image.alt || image.file.name
          );
        });
        const existingImages = variant.images.filter(
          (image) => image.url && !image.file
        );
        if (existingImages.length > 0) {
          submitData.append(
            `variants[${index}][existingImages]`,
            JSON.stringify(
              existingImages.map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary,
                alt: img.alt,
              }))
            )
          );
        }
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${UPDATE_PRODUCT_URL}/${product._id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        toast.success("Product updated successfully!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update product";
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 top-15 xl:left-38">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Close modal"
            disabled={updating || loading.submit}
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleProductUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
  Select Category <span className="text-red-500">*</span>
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
                    value={editData.category}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      formErrors.category ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={updating || loading.submit}
                    required
                    aria-required="true"
                    aria-describedby={
                      formErrors.category ? "category-error" : undefined
                    }
                  >
                    <option value="">Select a Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} {!cat.isActive && "(Disabled)"}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p
                      id="category-error"
                      className="text-red-600 text-xs mt-1"
                    >
                      {formErrors.category}
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
                value={editData.name}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Oversized T-Shirt"
                disabled={updating || loading.submit}
                required
                aria-required="true"
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-red-600 text-xs mt-1">
                  {formErrors.name}
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
              value={editData.description}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              rows={4}
              className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                formErrors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Comfortable cotton t-shirt"
              disabled={updating || loading.submit}
              required
              aria-required="true"
              aria-describedby={
                formErrors.description ? "description-error" : undefined
              }
            />
            {formErrors.description && (
              <p id="description-error" className="text-red-600 text-xs mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Product Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <label className="flex items-center">
                <Switch
                  onChange={() =>
                    handleInputChange({
                      target: {
                        name: "isFeatured",
                        type: "checkbox",
                        checked: !editData.isFeatured,
                      },
                    })
                  }
                  checked={editData.isFeatured}
                  height={20}
                  width={40}
                  disabled={updating || loading.submit}
                  aria-label="Toggle Featured status"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center">
                <Switch
                  onChange={() =>
                    handleInputChange({
                      target: {
                        name: "isActive",
                        type: "checkbox",
                        checked: !editData.isActive,
                      },
                    })
                  }
                  checked={editData.isActive}
                  height={20}
                  width={40}
                  disabled={updating || loading.submit}
                  aria-label="Toggle Active status"
                />
                <span className="ml-2 text-sm text-gray-700">Status</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={editData.specifications.material}
                  onChange={(e) =>
                    handleSpecificationChange("material", e.target.value)
                  }
                  onBlur={() =>
                    setFormErrors((prev) => ({
                      ...prev,
                      material: validateField(
                        "material",
                        editData.specifications.material
                      ),
                    }))
                  }
                  className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formErrors.material ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Cotton"
                  disabled={updating || loading.submit}
                />
                {formErrors.material && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.material}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fit
                </label>
                <input
                  type="text"
                  value={editData.specifications.fit}
                  onChange={(e) =>
                    handleSpecificationChange("fit", e.target.value)
                  }
                  onBlur={() =>
                    setFormErrors((prev) => ({
                      ...prev,
                      fit: validateField("fit", editData.specifications.fit),
                    }))
                  }
                  className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formErrors.fit ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Regular"
                  disabled={updating || loading.submit}
                />
                {formErrors.fit && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.fit}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Product details
              </h3>
              {/* <button
                type="button"
                onClick={addVariant}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  updating || loading.submit
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                }`}
                disabled={updating || loading.submit}
                aria-label="Add new variant"
              >
                <Plus size={16} className="inline mr-1" /> Add Variant
              </button> */}
            </div>

            {editData.variants.map((variant, variantIndex) => {
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
                  className="mb-6 p-4 bg-white rounded-md border border-gray-200"
                  role="group"
                  aria-labelledby={`variant-${variantIndex}-heading`}
                >
                  <div className="flex justify-between items-center mb-4">
                    {/* <h4
                      id={`variant-${variantIndex}-heading`}
                      className="text-md font-medium text-gray-700"
                    >
                      Product #{variantIndex + 1}
                    </h4> */}
                    {editData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        disabled={updating || loading.submit}
                        aria-label={`Remove variant ${variantIndex + 1}`}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
  Product Price <span className="text-red-500">*</span>
</label>

                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "price",
                            e.target.value
                          )
                        }
                        step="0.01"
                        min="0.01"
                        className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          formErrors[`variant_${variantIndex}_price`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="29"
                        disabled={updating || loading.submit}
                        required
                        aria-required="true"
                        aria-describedby={
                          formErrors[`variant_${variantIndex}_price`]
                            ? `variant-${variantIndex}-price-error`
                            : undefined
                        }
                      />
                      {formErrors[`variant_${variantIndex}_price`] && (
                        <p
                          id={`variant-${variantIndex}-price-error`}
                          className="text-red-600 text-xs mt-1"
                        >
                          {formErrors[`variant_${variantIndex}_price`]}
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
                        min="0"
                        max="100"
                        step="1"
                        className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          formErrors[`variant_${variantIndex}_discount`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter discount"
                        disabled={updating || loading.submit}
                        aria-describedby={
                          formErrors[`variant_${variantIndex}_discount`]
                            ? `variant-${variantIndex}-discount-error`
                            : undefined
                        }
                      />
                      {formErrors[`variant_${variantIndex}_discount`] && (
                        <p
                          id={`variant-${variantIndex}-discount-error`}
                          className="text-red-600 text-xs mt-1"
                        >
                          {formErrors[`variant_${variantIndex}_discount`]}
                        </p>
                      )}
                    </div>


                         
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (out of 5)
                      </label>
                      <input
                        type="number"
                        value={variant.rating}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "rating",
                            e.target.value
                          )
                        }
                        min="0"
                        max="5"
                        step="1"
                        className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          formErrors[`variant_${variantIndex}_rating`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter rating"
                        disabled={updating || loading.submit}
                        aria-describedby={
                          formErrors[`variant_${variantIndex}_rating`]
                            ? `variant-${variantIndex}-rating-error`
                            : undefined
                        }
                      />
                      {formErrors[`variant_${variantIndex}_rating`] && (
                        <p
                          id={`variant-${variantIndex}-rating-error`}
                          className="text-red-600 text-xs mt-1"
                        >
                          {formErrors[`variant_${variantIndex}_rating`]}
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
                        <p className="text-sm text-gray-500">
                          No colors available
                        </p>
                      ) : (
                        <div className="relative" ref={dropdownRef}>
                          <div
                            className={`w-full px-3 py-2 border ${
                              formErrors[`variant_${variantIndex}_color`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap gap-2 items-center min-h-[40px] cursor-pointer`}
                            onClick={() => toggleDropdown(variantIndex)}
                          >
                            {variant.color.length === 0 ? (
                              <span className="text-gray-500">
                                Select colors...
                              </span>
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
                                      disabled={updating || loading.submit}
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
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
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
                          {formErrors[`variant_${variantIndex}_color`] && (
                            <p
                              id={`variant-${variantIndex}-color-error`}
                              className="text-red-500 text-xs mt-1"
                            >
                              {formErrors[`variant_${variantIndex}_color`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               
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
                        disabled={updating || loading.submit}
                        aria-label={`Upload images for variant ${variantIndex + 1}`}
                      />
                      <label
                        htmlFor={`image-upload-variant-${variantIndex}`}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                          updating || loading.submit
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
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
                    {formErrors[`variant_${variantIndex}_images`] && (
                      <p
                        id={`variant-${variantIndex}-images-error`}
                        className="text-red-600 text-xs mt-1"
                      >
                        {formErrors[`variant_${variantIndex}_images`]}
                      </p>
                    )}
                    {imagePreviews[variantIndex]?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {imagePreviews[variantIndex].map((image, imgIndex) => (
                          <div
                            key={`${variantIndex}-${imgIndex}`}
                            className="relative group"
                          >
                            <img
                              src={
                                image.preview.startsWith("http") ||
                                image.preview.startsWith("data:") ||
                                image.preview.startsWith("blob:")
                                  ? image.preview
                                  : `${import.meta.env.VITE_BASE_URL}${image.preview}`
                              }
                              alt={image.name}
                              className="w-full h-32 object-cover rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(variantIndex, imgIndex)}
                              className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={updating || loading.submit}
                              aria-label={`Remove image ${image.name}`}
                            >
                              <X size={16} className="text-red-600" />
                            </button>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                              <span className="truncate max-w-[80%]">
                                {image.name}
                              </span>
                              <label className="flex items-center text-xs">
                                <input
                                  type="checkbox"
                                  checked={image.isPrimary}
                                  onChange={() =>
                                    togglePrimaryImage(variantIndex, imgIndex)
                                  }
                                  className="mr-1"
                                  disabled={updating || loading.submit}
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
                        className={`w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          formErrors[`variant_${variantIndex}_newSize`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={updating || loading.submit}
                        aria-label="Enter a size"
                      />
                      <button
                        type="button"
                        onClick={() => addSizeToVariant(variantIndex)}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                          updating || loading.submit
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                        }`}
                        disabled={updating || loading.submit}
                        aria-label="Add size"
                      >
                        Add
                      </button>
                    </div>
                    {formErrors[`variant_${variantIndex}_newSize`] && (
                      <p className="text-red-600 text-xs mt-1">
                        {formErrors[`variant_${variantIndex}_newSize`]}
                      </p>
                    )}
                    {formErrors[`variant_${variantIndex}_sizes`] && (
                      <p className="text-red-600 text-xs mt-1">
                        {formErrors[`variant_${variantIndex}_sizes`]}
                      </p>
                    )}
                    {variant.sizes?.length > 0 ? (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {variant.sizes.map((sizeObj, sizeIndex) => (
                          <div
                            key={sizeIndex}
                            className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            <span>{sizeObj.size}</span>
                            <button
                              type="button"
                              onClick={() =>
                                removeSizeFromVariant(variantIndex, sizeIndex)
                              }
                              className="text-red-500 hover:text-red-700 ml-2"
                              disabled={updating || loading.submit}
                              aria-label={`Remove size ${sizeObj.size}`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No sizes added yet.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
  <button
              onClick={onClose}
              disabled={updating || loading.submit}
              className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                updating || loading.submit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-500 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
              }`}
              aria-label="Cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating || loading.submit}
              className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                updating || loading.submit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              }`}
              aria-label="Save changes"
            >
              {updating || loading.submit ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;