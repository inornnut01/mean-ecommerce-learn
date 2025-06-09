import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addToCart, removeAllFromCart, updateCartItem, getCartProducts } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute,addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateCartItem);

export default router;