const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/orderStatus");

/** Reads commission rate from DB (persisted by admin) or falls back to env var */
const getCommissionRate = async () => {
  try {
    const Setting = require("../models/Setting.model");
    const s = await Setting.findOne({ key: "commissionRate" }).lean();
    if (s?.value?.rate !== undefined) return parseFloat(s.value.rate) / 100;
  } catch (_) { /* fall through */ }
  return parseFloat(process.env.PLATFORM_COMMISSION_RATE || "10") / 100;
};

/**
 * Places a new order after validating stock and computing totals.
 * @param {string} buyerId
 * @param {{ items: Array, shippingAddress: object }} data
 */
const placeOrder = async (buyerId, { items, shippingAddress }) => {
  let totalAmount = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product).populate("sellerId", "_id");
    if (!product || !product.isActive) {
      throw new ApiError(404, `Product "${item.product}" not found or unavailable.`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${product.title}". Available: ${product.stock}`);
    }

    // Snapshot price at order time
    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;

    enrichedItems.push({
      product:  product._id,
      title:    product.title,
      price:    product.price,
      quantity: item.quantity,
      image:    product.images[0]?.url || "",
      sellerId: product.sellerId._id,
    });

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  const COMMISSION_RATE  = await getCommissionRate();
  const commissionAmount = Math.round(totalAmount * COMMISSION_RATE * 100) / 100;
  const sellerEarnings   = totalAmount - commissionAmount;

  const order = await Order.create({
    buyerId,
    items: enrichedItems,
    shippingAddress,
    totalAmount,
    commissionAmount,
    sellerEarnings,
    statusHistory: [{ status: ORDER_STATUS.PLACED, note: "Order placed by buyer" }],
  });

  return order;
};

/**
 * Updates order status (with validation of allowed transitions).
 */
const updateOrderStatus = async (orderId, newStatus, changedBy, note = "", sellerId = null) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");

  // If changed by seller, verify BOLA: seller must own at least one item in the order
  if (changedBy === "seller" && sellerId) {
    const hasSellerItem = order.items.some(
      (item) => item.sellerId.toString() === sellerId.toString()
    );
    if (!hasSellerItem) {
      throw new ApiError(403, "Access denied. This order does not contain your products.");
    }
  }

  const allowedTransitions = {
    [ORDER_STATUS.PLACED]:    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED,   ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]:   [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: [],
  };

  if (!allowedTransitions[order.orderStatus]?.includes(newStatus)) {
    throw new ApiError(400, `Cannot transition from "${order.orderStatus}" to "${newStatus}".`);
  }

  order.orderStatus = newStatus;
  order.statusHistory.push({ status: newStatus, changedAt: new Date(), note });

  // If delivered, mark payment confirmed
  if (newStatus === ORDER_STATUS.DELIVERED) {
    order.paymentStatus = PAYMENT_STATUS.PAID;
  }

  await order.save();
  return order;
};

/**
 * Returns orders for a buyer (paginated).
 */
const getBuyerOrders = async (buyerId, { page = 1, limit = 10 } = {}) => {
  const skip  = (page - 1) * limit;
  const total = await Order.countDocuments({ buyerId });
  const orders = await Order.find({ buyerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("items.product", "title images")
    .lean();

  return { orders, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
};

/**
 * Returns orders where at least one item belongs to a seller.
 */
const getSellerOrders = async (sellerId, { page = 1, limit = 10, status } = {}) => {
  const filter = { "items.sellerId": sellerId };
  if (status) filter.orderStatus = status;

  const skip  = (page - 1) * limit;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("buyerId", "name email")
    .lean();

  return { orders, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
};

/**
 * Cancel an order (buyer or admin).
 */
const cancelOrder = async (orderId, cancelledBy, note = "", userId = null) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");

  if (cancelledBy === "buyer" && order.buyerId.toString() !== userId?.toString()) {
    throw new ApiError(403, "You can only cancel your own orders.");
  }

  if (cancelledBy === "seller" && userId) {
    const hasSellerItem = order.items.some(
      (item) => item.sellerId.toString() === userId.toString()
    );
    if (!hasSellerItem) {
      throw new ApiError(403, "Access denied. This order does not contain your products.");
    }
  }

  if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.orderStatus)) {
    throw new ApiError(400, "This order cannot be cancelled.");
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus     = ORDER_STATUS.CANCELLED;
  order.cancelledBy     = cancelledBy;
  order.cancellationNote = note;
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note });
  await order.save();
  return order;
};

module.exports = { placeOrder, updateOrderStatus, getBuyerOrders, getSellerOrders, cancelOrder };
