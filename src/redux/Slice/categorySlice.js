import { GET, POST, PUT } from "../../config/api_helper";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    CREATE_CATEGORY_URL,
    GET_CATEGORIES_URL,
    DELETE_CATEGORY_URL,
} from "../../config/url_helper";

// Async thunk for creating a category
export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await POST(CREATE_CATEGORY_URL, categoryData);
            if (response.statusCode === 201) {
                return response.category; // Assuming the API returns the created category
            } else {
                return rejectWithValue(response?.message || "Category creation failed");
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.message || error.message || "Category creation failed"
            );
        }
    }
);
