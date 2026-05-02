import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ChangePasswordPage = React.lazy(() => import('./views/changePassword/ChangePasswordPage'))
const GetProfilePage = React.lazy(() => import('./views/pages/profileChange/GetProfilePage'))
const ProfileChangePage = React.lazy(() => import('./views/pages/profileChange/ProfileChangePage'))

// Product
const ProductPage = React.lazy(() => import('./views/pages/product/ProductPage'))
const CreateProductPage = React.lazy(() => import('./views/pages/product/CreateProductPage'))

// category
const CreateCategoryPage = React.lazy(() => import('./views/pages/category/CreateCategoryPage'))
const CategoryPage = React.lazy(() => import('./views/pages/category/CategoryPage'))
const productDetail = React.lazy(() => import('./components/product/ProductDetail'))

const ColorPage = React.lazy(() => import('./views/pages/colors/ColorPage'))
// const BrandPage = React.lazy(() => import('./views/pages/brand/BrandPage'))


import ResetPassword from './views/pages/resetPassword/Resetpassword';
import ProductList from './components/product/ProductList';

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: Dashboard },

  {
    path: "/profile-change",
    name: "Profile Change",
    element: ProfileChangePage,
  },
  {
    path: "/change-password",
    name: "Change Password",
    element: ChangePasswordPage,
  },
  { path: "/get-profile", name: "Get Profile", element: GetProfilePage },

  { path: "/create-category", name: "Category", element: CreateCategoryPage },
  { path: "/create-product", name: "Product", element: CreateProductPage },
  { path: "/product", name: "Product", element: ProductPage },
  { path: "/category", name: "Category", element: CategoryPage },
  { path: "/product/:id", name: "Product Detail", element: productDetail },
  { path: "/colors", name: "Color", element: ColorPage },
  // { path: "/brands", name: "Brand", element: BrandPage },
];

export default routes
