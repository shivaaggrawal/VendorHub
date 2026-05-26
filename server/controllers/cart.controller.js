const Cart    = require("../models/Cart.model");
const Product = require("../models/Product.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");


const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "title price images stock isActive");
  return new ApiResponse(200, "Cart fetched.", cart || { items: [], totalPrice: 0 }).send(res);
});


const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new ApiError(400, "Product ID is required.");

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, "Product not found.");
  if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} items in stock.`);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });


  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId.toString()
  );

  if (existingIdx > -1) {
    const newQty = cart.items[existingIdx].quantity + quantity;
    if (newQty > product.stock) throw new ApiError(400, `Cannot add more than ${product.stock} items.`);
    cart.items[existingIdx].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }

  cart.recalculateTotal();
  await cart.save();
  return new ApiResponse(200, "Item added to cart.", cart).send(res);
});


const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new ApiError(400, "Quantity must be at least 1.");

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found.");

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found.");

  const product = await Product.findById(item.product);
  if (product && quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} items available.`);
  }

  item.quantity = quantity;
  cart.recalculateTotal();
  await cart.save();
  return new ApiResponse(200, "Cart updated.", cart).send(res);
});


const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found.");

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  cart.recalculateTotal();
  await cart.save();
  return new ApiResponse(200, "Item removed from cart.", cart).send(res);
});


const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalPrice: 0 }
  );
  return new ApiResponse(200, "Cart cleared.").send(res);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
