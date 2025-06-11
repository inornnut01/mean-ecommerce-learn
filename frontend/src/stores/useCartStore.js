import { create } from "zustand";
import axiosInstance from "../lib/axios";
import {toast} from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,

  getCartItems: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      set({cart: res.data});
      get().calculateTotals();
    } catch (error) {
      set({ cart: []})
      toast.error(error.response.data.message || "Failed to fetch cart items");
    }
  },
  
  addToCart: async (product) => {
    try{
      await axiosInstance.post("/cart", {productId: product._id});
      toast.success("Product added to cart");
      set((prevState) => {
        const existingItem = prevState.cart.find((item) => item._id === product._id);
        const newCart = existingItem 
        ? prevState.cart.map((item) => item._id === product._id ? {...item, quantity: item.quantity + 1} : item) 
        : [...prevState.cart, {...product, quantity: 1}];
        return {cart: newCart};
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "Failed to add product to cart");
    }
  },

  calculateTotals: () => {
    const {cart, coupon} = get();
    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = subTotal;
    if (coupon) {
      const discount = subTotal * coupon.discount / 100;
      total = subTotal - discount;
    }
    set({subTotal, total});
  },

}))
