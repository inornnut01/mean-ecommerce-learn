import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios.js";


export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({products}),

  createProduct: async (productData) => {
    set({loading: true});
    try {
      const res = await axiosInstance.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      set({loading: false});
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  fetchAllProducts: async () => {
    set({loading: true});
    try {
      const res = await axiosInstance.get("/products");
      set({products: res.data.products, loading: false});
    } catch (error) {
      set({error: "Failed to fetch products", loading: false});
      toast.error(error.response.data.message || "Failed to fetch products");
    }
  },

  fetchProductsByCategory: async (category) => {
    set({loading: true});
    try {
      const res = await axiosInstance.get(`/products/category/${category}`);
      set({products: res.data.products, loading: false});
    } catch (error) {
      set({error: "Failed to fetch products", loading: false});
      toast.error(error.response.data.message || "Failed to fetch products");
    }
  },

  deleteProduct: async (productId) => {
    set({loading: true});
    try {
      await axiosInstance.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter((product) => product._id !== productId),
        loading: false,
      }));
    } catch (error) {
      set({loading: false});
      toast.error(error.response.data.message || "Failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axiosInstance.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
}))