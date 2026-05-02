import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

const AppSidebarNav = ({ items = [], unfoldable = false }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (itemName) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const renderNavItem = (item, index) => {
    const hasChildren =
      item.items && Array.isArray(item.items) && item.items.length > 0;
    const isOpen = openItems[item.name] || false;

    // Handle different item types
    if (item.component) {
      // For custom components like dividers, titles, etc.
      return (
        <div key={index} className="px-4 py-2">
          {React.createElement(item.component, item.componentProps || {})}
        </div>
      );
    }

    if (item.title && !item.to && !hasChildren) {
      // Section title
      return (
        <div
          key={index}
          className={`px-4 py-2 ${unfoldable ? "hidden" : "block"}`}
        >
          <h6 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {item.name}
          </h6>
        </div>
      );
    }

    if (hasChildren) {
      // Nav group with children
      return (
        <div key={index} className="mb-1">
          <button
            onClick={() => toggleItem(item.name)}
            className={`w-full flex items-center justify-between text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-lg ${
              unfoldable ? "px-2 py-2" : "px-4 py-2"
            }`}
            title={unfoldable ? item.name : ""}
          >
            <div className="flex items-center space-x-3">
              {item.icon && (
                <span className="flex-shrink-0 w-5 h-5">
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon, { className: "w-5 h-5" })
                    : typeof item.icon === "function"
                    ? React.createElement(item.icon, { className: "w-5 h-5" })
                    : item.icon}
                </span>
              )}
              {!unfoldable && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </div>
            {!unfoldable && (
              <span className="flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
          </button>

          {/* Children items */}
          {isOpen && !unfoldable && (
            <div className="ml-4 border-l border-gray-700 pl-4 mt-1">
              {item.items.map((childItem, childIndex) =>
                renderNavItem(childItem, `${index}-${childIndex}`)
              )}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item
    return (
      <div key={index} className="mb-1">
        <NavLink
          to={item.to || "#"}
          className={({ isActive }) =>
            `flex items-center rounded-lg text-sm font-medium transition-colors ${
              unfoldable ? "px-2 py-2 justify-center" : "px-4 py-2 space-x-3"
            } ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`
          }
          title={unfoldable ? item.name : ""}
        >
          {item.icon && (
            <span className="flex-shrink-0 w-5 h-5">
              {React.isValidElement(item.icon)
                ? React.cloneElement(item.icon, { className: "w-5 h-5" })
                : typeof item.icon === "function"
                ? React.createElement(item.icon, { className: "w-5 h-5" })
                : item.icon}
            </span>
          )}
          {!unfoldable && (
            <>
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span
                  className={`ml-auto px-2 py-1 text-xs rounded-full ${
                    item.badge.color === "info"
                      ? "bg-blue-100 text-blue-800"
                      : item.badge.color === "danger"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.badge.text}
                </span>
              )}
            </>
          )}
        </NavLink>
      </div>
    );
  };

  // Safety check: ensure items is an array
  if (!Array.isArray(items)) {
    console.warn(
      "AppSidebarNav: items prop should be an array, received:",
      typeof items
    );
    return (
      <nav className="flex-1 px-2 py-4 space-y-1">
        <div className="px-4 py-2 text-gray-400 text-sm">
          No navigation items provided
        </div>
      </nav>
    );
  }

  // If no items provided
  if (items.length === 0) {
    return (
      <nav className="flex-1 px-2 py-4 space-y-1">
        <div className="px-4 py-2 text-gray-400 text-sm">
          No navigation items available
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item, index) => renderNavItem(item, index))}
    </nav>
  );
};

export default AppSidebarNav;
