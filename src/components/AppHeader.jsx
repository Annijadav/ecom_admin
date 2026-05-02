// AppHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  Bell,
  Mail,
  Search,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  LogOut,
  Lock,
  ChevronDown,
  MoreVertical,
  Home,
} from "lucide-react";
import { logout, getProfile } from "../redux/Slice/loginSlice";
import { GET } from "../config/api_helper";
import { GET_PROFILE_URL } from "../config/url_helper";

import ViewProfile from "./ViewProfile";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";

const AppHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const headerRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { loading, error, user } = useSelector((state) => state.login);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(
    localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData"))
      : null
  );
  const [colorMode, setColorMode] = useState(
    localStorage.getItem("colorMode") || "light"
  );
  const [colorModeDropdownOpen, setColorModeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [showProfileModal, setShowProfileModal] = useState(
    localStorage.getItem("showProfileModal") === "true" || false
  );
  const [showEditProfileModal, setShowEditProfileModal] = useState(
    localStorage.getItem("showEditProfileModal") === "true" || false
  );
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(
    localStorage.getItem("showChangePasswordModal") === "true" || false
  );
  const [profileData, setProfileData] = useState(
    localStorage.getItem("profileData")
      ? JSON.parse(localStorage.getItem("profileData"))
      : null
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setColorModeDropdownOpen(false);
        setUserDropdownOpen(false);
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const shouldHaveShadow = window.scrollY > 0;
        headerRef.current.classList.toggle("shadow-lg", shouldHaveShadow);
        headerRef.current.classList.toggle(
          "backdrop-blur-md",
          shouldHaveShadow
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isProfileUpdate = localStorage.getItem("imageUpdate") === "true";

  // Fetch profile data initially
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await GET(GET_PROFILE_URL);
        if (profileData.statusCode === 200) {
          setProfileData(profileData.admin);
          localStorage.setItem(
            "profileData",
            JSON.stringify(profileData.admin)
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
    localStorage.setItem("imageUpdate", false);
  }, [isProfileUpdate]);

  // Sync modal states with localStorage
  useEffect(() => {
    localStorage.setItem("showProfileModal", showProfileModal.toString());
  }, [showProfileModal]);

  useEffect(() => {
    localStorage.setItem(
      "showEditProfileModal",
      showEditProfileModal.toString()
    );
  }, [showEditProfileModal]);

  useEffect(() => {
    localStorage.setItem(
      "showChangePasswordModal",
      showChangePasswordModal.toString()
    );
  }, [showChangePasswordModal]);

  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("colorMode", colorMode);
  }, [colorMode]);

  // Callback to update profile data
  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setUserDropdownOpen(false);
    dispatch(getProfile());
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditProfileModal(true);
    setUserDropdownOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowChangePasswordModal(true);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("profileData");
    localStorage.removeItem("showProfileModal");
    localStorage.removeItem("showEditProfileModal");
    localStorage.removeItem("showChangePasswordModal");
    navigate("/login");
  };

  const toggleColorMode = (mode) => {
    setColorMode(mode);
    setColorModeDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const colorModeOptions = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
    { label: "System", value: "system", icon: Monitor },
  ];

  const notifications = [
    {
      id: 1,
      title: "New order received",
      message: "Order #1234 has been placed",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Profile updated",
      message: "Your profile information has been updated",
      time: "1h ago",
      unread: false,
    },
    {
      id: 3,
      title: "Password changed",
      message: "Your password was successfully changed",
      time: "2h ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-[1000] flex bg-white dark:bg-white  transition-all duration-300"
      >
        <div className="flex flex-grow items-center justify-between px-4 py-1 md:px-6 2xl:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
              className="group relative flex h-10 w-10 items-center justify-center rounded-lg  bg-white  dark:white dark:hover:bg-gray-700 xl:hidden transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute top-1 left-0 h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    sidebarOpen ? "rotate-45 top-2" : ""
                  }`}
                />
                <span
                  className={`absolute top-2 left-0 h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    sidebarOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute top-3 left-0 h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                    sidebarOpen ? "-rotate-45 top-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(!userDropdownOpen);
                  localStorage.setItem("userDropdownOpen", !userDropdownOpen);
                }}
                className="flex items-center gap-3 rounded-lg bg-white p-2 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      `${profileData?.image}` ||
                      userData?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        profileData?.name || userData?.name || "User"
                      )}&background=3B82F6&color=ffffff`
                    }
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileData?.name || userData?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profileData?.email ||
                        userData?.email ||
                        "user@example.com"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-[1001]">
                  <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileData?.name || userData?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profileData?.email ||
                        userData?.email ||
                        "user@example.com"}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Lock className="h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-1 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-[1002] hover:cursor-pointer">
          Profile: {showProfileModal ? "OPEN" : "CLOSED"} | Edit:{" "}
          {showEditProfileModal ? "OPEN" : "CLOSED"} | Password:{" "}
          {showChangePasswordModal ? "OPEN" : "CLOSED"}
        </div>
      )} */}

      <ViewProfile
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        profileData={profileData}
      />

      <EditProfile
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
        profileData={profileData}
        onProfileUpdate={handleProfileUpdate} // Pass callback
      />

      <ChangePassword
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
      />
    </>
  );
};

export default AppHeader;
