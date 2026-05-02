import React from "react";
import {
  Gauge,
  Bell,
  Package,
  PackagePlus,
  PackageSearch,
  Folder,
  FolderPlus,
  FolderSearch,
  Tag,
  Palette,
  LayoutDashboard,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  // {
  //   name: "Product Management",
  //   icon: <Package className="w-5 h-5" />,
  //   items: [
  //     {
  //       name: "Create Product",
  //       to: "/create-product",
  //       icon: <PackagePlus className="w-4 h-4" />,
  //     },
  //     {
  //       name: "List Products",
  //       to: "/product",
  //       icon: <PackageSearch className="w-4 h-4" />,
  //     },
  //   ],
  // },
  // {
  //   name: "Category Management",
  //   icon: <Folder className="w-5 h-5" />,
  //   items: [
  //     {
  //       name: "Create Category",
  //       to: "/create-category",
  //       icon: <FolderPlus className="w-4 h-4" />,
  //     },
  //     {
  //       name: "List Categories",
  //       to: "/category",
  //       icon: <FolderSearch className="w-4 h-4" />,
  //     },
  //   ],
  // },
  {
    name: "List Products",
    to: "/product",
    icon: <PackageSearch className="w-4 h-4" />,
  },
  {
    name: "List Categories",
    to: "/category",
    icon: <FolderSearch className="w-4 h-4" />,
  },
  // {
  //   name: "Brand Management",
  //   to: "/brands",
  //   icon: <Tag className="w-5 h-5" />,
  // },
  {
    name: "Colors Management",
    to: "/colors",
    icon: <Palette className="w-5 h-5" />,
  },
];

export default navigation;

