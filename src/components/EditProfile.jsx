import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { toast } from "react-toastify"; // Only import toast, not ToastContainer
import { UPDATE_PROFILE_URL, GET_PROFILE_URL } from "../config/url_helper";
import { GET } from "../config/api_helper";
import axios from "axios";

const EditProfile = ({
  showEditProfileModal,
  setShowEditProfileModal,
  profileData,
  onProfileUpdate,
}) => {
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });
  const [isDataFetched, setIsDataFetched] = useState(false); // Track if data is fetched

  // Image handling states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Validation function
  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) {
      error = "Full name is required";
    } else if (name === "email" && !value.trim()) {
      error = "Email address is required";
    } else if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Invalid email format";
    } else if (name === "mobileNumber" && !value.trim()) {
      error = "Mobile number is required";
    } else if (name === "mobileNumber" && value && !/^\d{10}$/.test(value)) {
      error = "Mobile number must be 10 digits";
    }
    return error;
  };

  // Fetch profile data
  useEffect(() => {
    if (!profileData && !isDataFetched) {
      console.log("Fetching profile data...");
      const fetchProfileData = async () => {
        try {
          const response = await GET(GET_PROFILE_URL);
          if (response.statusCode === 200) {
            setEditProfileForm({
              name: response.admin?.name || "",
              email: response.admin?.email || "",
              mobileNumber: response.admin?.mobileNumber || "",
            });
            setImagePreview(response.admin.image || null);
            setIsDataFetched(true); // Mark data as fetched
          } else {
            toast.error("Failed to fetch profile data.");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
          toast.error("Failed to fetch profile data.");
        }
      };
      fetchProfileData();
    }
  }, [profileData, isDataFetched]);

  // Update form with profile data
  useEffect(() => {
    if (profileData) {
      setEditProfileForm({
        name: profileData.name || "",
        email: profileData.email || "",
        mobileNumber: profileData.mobileNumber || "",
      });
      setImagePreview(profileData.image || null);
      setIsDataFetched(true); // Mark data as fetched if profileData is provided
    }
  }, [profileData]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadErrors((prev) => ({ ...prev, image: null }));

    if (!file.type.startsWith("image/")) {
      const error = "Please select an image file";
      setUploadErrors((prev) => ({ ...prev, image: error }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const error = "File size must be less than 5MB";
      setUploadErrors((prev) => ({ ...prev, image: error }));
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImageFile = () => {
    setImageFile(null);
    setImagePreview(profileData?.image || null);
    setUploadErrors((prev) => ({ ...prev, image: null }));

    const fileInput = document.getElementById("profileImage");
    if (fileInput) {
      fileInput.value = "";
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();

    const errors = {
      name: validateField("name", editProfileForm.name),
      email: validateField("email", editProfileForm.email),
      mobileNumber: validateField("mobileNumber", editProfileForm.mobileNumber),
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      // toast.error("Please fix all validation errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("name", editProfileForm.name);
    formData.append("email", editProfileForm.email);
    formData.append("mobileNumber", editProfileForm.mobileNumber);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${UPDATE_PROFILE_URL}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        toast.success("Profile updated successfully!");
        localStorage.setItem("imageUpdate", true);
        setShowEditProfileModal(false);

        const updatedProfile = {
          ...profileData,
          name: editProfileForm.name,
          email: editProfileForm.email,
          mobileNumber: editProfileForm.mobileNumber,
          image: response.data.admin?.image || profileData?.image,
        };
        localStorage.setItem("profileData", JSON.stringify(updatedProfile));

        onProfileUpdate(updatedProfile);

        setImageFile(null);
        setImagePreview(profileData?.image || null);
        setUploadErrors({});
        setFormErrors({});
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response) {
        const errorMessage = error.response.data?.message || "Server error occurred";
        toast.error(errorMessage);

        if (error.response.data?.errors) {
          setUploadErrors((prev) => ({
            ...prev,
            image: error.response.data.errors.find((err) => err.field === "image")?.message || null,
          }));
          setFormErrors((prev) => ({
            ...prev,
            mobileNumber: error.response.data.errors.find((err) => err.field === "mobileNumber")?.message || null,
          }));
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Error updating profile. Please try again.");
      }
    }
  };

  if (!showEditProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex items-center justify-center z-9 p-4 pt-20" style={{ marginTop: '-10px' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h5 className="text-lg font-semibold text-white mb-0">Edit Profile</h5>
          <button
            onClick={() => setShowEditProfileModal(false)}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 hover:cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadErrors.image && (
          <div className="mx-6 mt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">Image Error: {uploadErrors.image}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleEditProfileSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editProfileForm.name}
                onChange={handleEditProfileChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your full name"
                required
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-red-600 text-xs mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
          <label
  htmlFor="mobileNumber"
  className="block text-sm font-medium text-gray-700 mb-2"
>
  Mobile Number <span className="text-red-500">*</span>
</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={editProfileForm.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleEditProfileChange(e);
                    if (value.length > 10) {
                      setFormErrors((prev) => ({
                        ...prev,
                        mobileNumber: "Mobile number must be exactly 10 digits",
                      }));
                    } else if (value.length < 10 && value.length > 0) {
                      setFormErrors((prev) => ({
                        ...prev,
                        mobileNumber: "Mobile number must be exactly 10 digits",
                      }));
                    } else if (value.length === 0) {
                      setFormErrors((prev) => ({
                        ...prev,
                        mobileNumber: "Mobile number is required",
                      }));
                    } else {
                      setFormErrors((prev) => ({
                        ...prev,
                        mobileNumber: "",
                      }));
                    }
                  }
                }}
                className={`w-full px-3 py-2 border ${
                  formErrors.mobileNumber ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your mobile number"
                required
                maxLength={10}
                aria-describedby={formErrors.mobileNumber ? "mobileNumber-error" : undefined}
              />
              {formErrors.mobileNumber && (
                <p id="mobileNumber-error" className="text-red-600 text-xs mt-1">
                  {formErrors.mobileNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-start w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-50 h-27 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      imageFile
                        ? "border-green-400 bg-green-50"
                        : uploadErrors.image
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imageFile ? (
                        <div className="flex items-center">
                          <svg
                            className="h-6 w-6 text-green-600 mr-2"
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
                            Image selected successfully
                          </span>
                        </div>
                      ) : uploadErrors.image ? (
                        <div className="flex items-center">
                          <svg
                            className="h-6 w-6 text-red-600 mr-2"
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
                          <span className="text-sm text-red-600">
                            Invalid file - Try again
                          </span>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-8 h-8 mb-2 text-gray-500"
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
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to select profile image
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="profileImage"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`${imagePreview}`}
                        alt="Profile preview"
                        className="w-23 h-23 rounded-full object-center border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {imageFile?.name || "Current profile image"}
                        </p>
                        {imageFile && (
                          <>
                            <p className="text-xs text-gray-500">
                              {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-green-600">
                              ✓ Ready to upload
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={removeImageFile}
                        className="text-red-500 hover:text-red-700 p-1 hover:cursor-pointer"
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
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className=" px-2 py-3 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={handleEditProfileSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm hover:cursor-pointer font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm hover:cursor-pointer font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;