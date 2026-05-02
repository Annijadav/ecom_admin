import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, RotateCcw, Settings } from "lucide-react";
import { getProfile } from "../redux/Slice/loginSlice";

const ViewProfile = ({
  showProfileModal,
  setShowProfileModal,
  setShowEditProfileModal,
  profileData,
}) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.login);  
  // console.log(profileData);
  
  if (!showProfileModal) return null;

  const handleRefresh = () => {
    dispatch(getProfile());
  };

  const handleUpdateProfile = () => {
    setShowEditProfileModal(true);
    setShowProfileModal(false);
  };

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

  // const getStatusBadge = (isActive, isVerified) => {
  //   // if (isActive && isVerified) {
  //   //   return (
  //   //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  //   //       Active & Verified
  //   //     </span>
  //   //   );
  //   // }
  //   // if (isActive) {
  //   //   return (
  //   //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  //   //       Active
  //   //     </span>
  //   //   );
  //   // }
  //   return (
  //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  //       Inactive
  //     </span>
  //   );
  // };

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

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h5 className="text-lg font-semibold text-white mb-0">
            Admin Profile
          </h5>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 hover:cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading && !profileData && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
            <>
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {profileData.name ? profileData.name[0].toUpperCase() : "U"}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h5 className="text-xl font-semibold text-gray-900">
                    {profileData.name}
                  </h5>
                  <p className="text-gray-600 mb-0">{profileData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <strong className="block text-sm font-medium text-gray-700">
                      Full Name:
                    </strong>
                    <p className="mt-1 text-sm text-gray-900">
                      {profileData.admin?.name || profileData.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong className="block text-sm font-medium text-gray-700">
                      Email:
                    </strong>
                    <p className="mt-1 text-sm text-gray-900">
                      {profileData.admin?.email || profileData.email || "N/A"}
                    </p>
                    
                  </div>

              
                </div>
                <div className="">
                  <div>
                    <strong className="block text-sm font-medium text-gray-700">
                      Role:
                    </strong>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {profileData.admin?.role || profileData.role || "N/A"}
                    </p>
                  </div>

                      <div>
                    <strong className="block text-sm font-medium text-gray-700 mt-2">
                      mobileNumber

                    </strong>
                    <p className="mt-1 text-sm text-gray-900">
                      {profileData.admin?.mobileNumber || profileData.mobileNumber|| "N/A"}
                    </p>
                  </div>
                </div>
                
              </div> 
                           
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 pb-3 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={() => setShowProfileModal(false)}
            className="inline-flex items-center px-4 py-2 border hover:cursor-pointer border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
