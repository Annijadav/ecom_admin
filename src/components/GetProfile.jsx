import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../redux/Slice/loginSlice";
import { RotateCcw } from "lucide-react";

const GetProfile = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.login);

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {

    const storedUserData = localStorage.getItem("userData");    
    if (storedUserData) {
      setProfileData(JSON.parse(storedUserData));
    }
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isActive, isVerified) => {
    if (isActive && isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active & Verified
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      superAdmin: "bg-cyan-100 text-cyan-800",
      admin: "bg-blue-100 text-blue-800",
      user: "bg-gray-100 text-gray-800",
      manager: "bg-yellow-100 text-yellow-800",
    };

    const colorClass = roleColors[role] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {role}
      </span>
    );
  };

  const handleRefresh = () => {
    dispatch(getProfile());
  };

  if (loading && !profileData) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h5 className="text-lg font-semibold text-white mb-0">
            Admin Profile
          </h5>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  <strong>Error:</strong> {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {profileData && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {profileData.fullName
                    ? profileData.fullName[0].toUpperCase()
                    : "U"}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h5 className="text-xl font-semibold text-gray-900">
                  {profileData.fullName}
                </h5>
                <p className="text-gray-600 mb-0">{profileData.email}</p>
              </div>
              <div className="text-right space-y-2">
                {getRoleBadge(profileData.role)}
                <br />
                {getStatusBadge(profileData.isActive, profileData.isVerified)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    Full Name:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData.admin.name || "N/A"}
                  </p>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    Email:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData.admin.email || "N/A"}
                  </p>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    Phone:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData.admin.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    User ID:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {profileData.admin.id || "N/A"}
                  </p>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    Role:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {profileData.admin.role || "N/A"}
                  </p>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-gray-700">
                    Last Login:
                  </strong>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(profileData.lastLogin)}
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div>
              <h6 className="text-lg font-medium text-gray-900 mb-3">
                Account Status
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profileData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {profileData.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetProfile;
