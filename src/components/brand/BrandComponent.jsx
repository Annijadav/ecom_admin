// import React, { useEffect, useState, useRef } from "react";
// import { GET, POST, PUT, DELETE } from "../../config/api_helper";
// import {
//   CREATE_BRAND_URL,
//   GET_BRANDS_URL,
//   DELETE_BRAND_URL,
//   UPDATE_BRAND_URL,
// } from "../../config/url_helper";
// import { Edit2, Trash2, Plus, Save, X, Search } from "lucide-react";
// import Pagination from "../Pagination";
// import { toast } from "react-toastify";

// const BrandComponent = () => {
//   const [brands, setBrands] = useState([]);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     totalPages: 1,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [modalState, setModalState] = useState({
//     isOpen: false,
//     mode: "create",
//     brandId: null,
//   });
//   const [formData, setFormData] = useState({ name: "" });
//   const [searchQuery, setSearchQuery] = useState("");
//   const debounceTimeout = useRef(null);

//   useEffect(() => {
//     const fetchBrands = async () => {
//       setLoading(true);
//       try {
//         const response = await GET(GET_BRANDS_URL, {
//           page: pagination.page,
//           limit: pagination.limit,
//           search: searchQuery.trim(),
//         });
//         const fetchedBrands = response.data.brands || [];
//         const paginationData = response.data.pagination || {
//           currentPage: response.data.pagination?.currentPage || 1,
//           limit: response.data.pagination?.limit || 5,
//           totalItems: response.data.pagination?.total || fetchedBrands.length,
//           totalPages: response.data.pagination?.totalPages || 1,
//         };
//         const idSet = new Set(fetchedBrands.map((brand) => brand._id));
//         if (idSet.size !== fetchedBrands.length) {
//           console.warn("Duplicate brand IDs detected:", fetchedBrands);
//         }
//         setBrands(fetchedBrands);
//         setPagination({
//           page: paginationData.currentPage,
//           limit: paginationData.limit,
//           total: paginationData.totalItems,
//           totalPages: paginationData.totalPages,
//         });
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch brands:", err);
//         setError(err.message || "Failed to fetch brands");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (debounceTimeout.current) {
//       clearTimeout(debounceTimeout.current);
//     }
//     debounceTimeout.current = setTimeout(() => {
//       fetchBrands();
//     }, 300);

//     return () => clearTimeout(debounceTimeout.current);
//   }, [pagination.page, pagination.limit, searchQuery]);

//   const handlePageChange = (newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   };

//   const handleLimitChange = (event) => {
//     const newLimit = parseInt(event.target.value, 10);
//     setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
//   };

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   };

//   const handleClearSearch = () => {
//     setSearchQuery("");
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   };

//   const handleCreate = async () => {
//     if (!formData.name.trim()) {
//       setError("Brand name cannot be empty");
//       return;
//     }
//     setLoading(true);
//     try {
//       const postResponse = await POST(CREATE_BRAND_URL, {
//         name: formData.name.trim(),
//       });
//       if (postResponse.statusCode === 201) {
//         toast.success(postResponse.message || "Brand created successfully");
//       } else {
//         toast.error(postResponse.message || "Failed to create brand");
//       }
//       setFormData({ name: "" });
//       setModalState({ isOpen: false, mode: "create", brandId: null });
//       localStorage.setItem("isModalOpen", false);
//       const response = await GET(GET_BRANDS_URL, {
//         page: pagination.page,
//         limit: pagination.limit,
//         search: searchQuery.trim(),
//       });
//       const fetchedBrands = response.data.brands || [];
//       const paginationData = response.data.pagination || {
//         currentPage: 1,
//         limit: pagination.limit,
//         totalItems: fetchedBrands.length,
//         totalPages: 1,
//       };
//       setBrands(fetchedBrands);
//       setPagination({
//         page: paginationData.currentPage,
//         limit: paginationData.limit,
//         total: paginationData.totalItems,
//         totalPages: paginationData.totalPages,
//       });
//       setError(null);
//     } catch (err) {
//       console.error("Failed to create brand:", err);
//       setError(err.message || "Failed to create brand");
//       toast.error(err.message || "Failed to create brand");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!formData.name.trim()) {
//       setError("Brand name cannot be empty");
//       return;
//     }
//     if (modalState.brandId) {
//       setLoading(true);
//       try {
//         const response = await PUT(
//           `${UPDATE_BRAND_URL}/${modalState.brandId}`,
//           {
//             name: formData.name.trim(),
//           }
//         );
//         if (response.statusCode === 200) {
//           toast.success(response.message || "Brand updated successfully");
//         } else {
//           toast.error(response.message || "Failed to update brand");
//         }
//         setBrands(
//           brands.map((brand) =>
//             brand._id === modalState.brandId
//               ? { ...brand, name: formData.name.trim() }
//               : brand
//           )
//         );
//         setFormData({ name: "" });
//         setModalState({ isOpen: false, mode: "create", brandId: null });
//         localStorage.setItem("isModalOpen", false );
//         setError(null);
//       } catch (err) {
//         console.error("Failed to update brand:", err);
//         setError(err.message || "Failed to update brand");
//         toast.error(err.message || "Failed to update brand");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleDelete = async (_id) => {
//     setLoading(true);
//     try {
//       const deleteResponse = await DELETE(`${DELETE_BRAND_URL}/${_id}`);
//       if (deleteResponse.statusCode === 200) {
//         toast.success(deleteResponse.message || "Brand deleted successfully");
//       } else {
//         toast.error(deleteResponse.message || "Failed to delete brand");
//       }
//       const response = await GET(GET_BRANDS_URL, {
//         page: pagination.page,
//         limit: pagination.limit,
//         search: searchQuery.trim(),
//       });
//       const fetchedBrands = response.data.brands || [];
//       const paginationData = response.data.pagination || {
//         currentPage: 1,
//         limit: pagination.limit,
//         totalItems: fetchedBrands.length,
//         totalPages: 1,
//       };
//       setBrands(fetchedBrands);
//       setPagination({
//         page: paginationData.currentPage,
//         limit: paginationData.limit,
//         total: paginationData.totalItems,
//         totalPages: paginationData.totalPages,
//       });
//       setError(null);
//     } catch (err) {
//       console.error("Failed to delete brand:", err);
//       setError(err.message || "Failed to delete brand");
//       toast.error(err.message || "Failed to delete brand");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startCreate = () => {
//     setFormData({ name: "" });
//     setModalState({ isOpen: true, mode: "create", brandId: null });
//     localStorage.setItem("isModalOpen", true);
//     setError(null);
//   };

//   const startEdit = (brand) => {
//     setFormData({ name: brand.name });
//     setModalState({ isOpen: true, mode: "update", brandId: brand._id });
//     localStorage.setItem("isModalOpen", true);
//     setError(null);
//   };

//   const handleCancel = () => {
//     setFormData({ name: "" });
//     setModalState({ isOpen: false, mode: "create", brandId: null });
//     localStorage.setItem("isModalOpen", false);
//     setError(null);
//   };

//   const handleModalSubmit = () => {
//     if (modalState.mode === "create") {
//       handleCreate();
//     } else {
//       handleUpdate();
//     }
//   };

//   const startItem = (pagination.page - 1) * pagination.limit + 1;
//   const endItem = Math.min(
//     pagination.page * pagination.limit,
//     pagination.total
//   );

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
//       <header className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
//         <h1 className="sm:text-3xl text-xl font-semibold text-gray-800 text-center">
//           Brand Management
//         </h1>
//       </header>

//       {!modalState.isOpen && (
//         <div className="mb-6 space-y-4">
//           <div className="flex items-center gap-2">
//             <div className="relative flex-1">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 placeholder="Search brands..."
//                 className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
//               />
//               <Search
//                 size={20}
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//               />
//               {searchQuery && (
//                 <button
//                   onClick={handleClearSearch}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer" 
//                   disabled={loading}
//                 >
//                   <X size={20} />
//                 </button>
//               )}
//             </div>
//           </div>
//           <div className="flex flex-col gap-3 sm:flex-row items-center justify-between">
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Items per page:
//               </label>
//               <select
//                 value={pagination.limit}
//                 onChange={handleLimitChange}
//                 disabled={loading}
//                 className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//               </select>
//             </div>
//             <button
//               onClick={startCreate}
//               disabled={loading}
//               className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               <Plus size={20} />
//               Add Brand
//             </button>
//           </div>
//         </div>
//       )}

//       {modalState.isOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-xl">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               {modalState.mode === "create" ? "Create Brand" : "Update Brand"}
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Brand Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   placeholder="Enter brand name"
//                   className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
//                   disabled={loading}
//                 />
//               </div>
//               {error && <p className="text-red-500 text-sm">{error}</p>}
//               <div className="flex gap-2 justify-end">
//                 <button
//                   onClick={handleModalSubmit}
//                   disabled={loading}
//                   className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
//                     loading ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//                 >
//                   <Save size={16} />
//                   {loading
//                     ? modalState.mode === "create"
//                       ? "Creating..."
//                       : "Updating..."
//                     : modalState.mode === "create"
//                     ? "Create"
//                     : "Update"}
//                 </button>
//                 <button
//                   onClick={handleCancel}
//                   disabled={loading}
//                   className={`flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:cursor-pointer${
//                     loading ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//                 >
//                   <X size={16} />
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto mb-6">
//         {loading ? (
//           <div className="text-center py-12 text-gray-600">
//             <p className="text-lg font-medium">Loading...</p>
//           </div>
//         ) : error && brands.length === 0 ? (
//           <div className="text-center py-12 text-red-500">
//             <p className="text-lg font-medium">{error}</p>
//           </div>
//         ) : brands.length === 0 ? (
//           <div className="text-center py-12 text-gray-600">
//             <p className="text-lg font-medium">No brands found.</p>
//             <p className="text-sm text-gray-500">
//               Add a brand or adjust your search.
//             </p>
//           </div>
//         ) : (
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                   Brand Name
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {brands.map((brand) => (
//                 <tr
//                   key={brand._id}
//                   className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-4 py-3 text-gray-800 capitalize">
//                     {brand.name}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => startEdit(brand)}
//                         disabled={loading || modalState.isOpen}
//                         className={`p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors hover:cursor-pointer${
//                           loading || modalState.isOpen
//                             ? "opacity-50 cursor-not-allowed"
//                             : ""
//                         }`}
//                         title="Edit brand"
//                       >
//                         <Edit2 size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(brand._id)}
//                         disabled={loading || modalState.isOpen}
//                         className={`p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors hover:cursor-pointer${
//                           loading || modalState.isOpen
//                             ? "opacity-50 cursor-not-allowed"
//                             : ""
//                         }`}
//                         title="Delete brand"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <footer className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
//         <Pagination
//           currentPage={pagination.page}
//           totalPages={pagination.totalPages}
//           totalItems={pagination.total}
//           itemsPerPage={pagination.limit}
//           onPageChange={handlePageChange}
//           showFirstLast={true}
//           showInfo={true}
//           className="text-gray-800 bg-gray-50"
//         />
//       </footer>
//     </div>
//   );
// };

// export default BrandComponent;