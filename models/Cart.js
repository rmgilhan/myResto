const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        menuItemId: {
            type: Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

cartSchema.pre("save", async function (next) {
  console.log("🟢 Running pre('save') hook...");

  try {
    const menuItemIds = this.items.map(item => item.menuItemId);
    const menuItems = await mongoose.model("MenuItem").find({ _id: { $in: menuItemIds } });

    const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

    this.items.forEach(item => {
      const menuItem = menuItemMap.get(item.menuItemId.toString());

      if (!menuItem || typeof menuItem.price !== "number") {
        console.log("❌ Invalid menu item price, skipping...");
        return next(new Error("Invalid menu item price"));
      }

      if (!item.price) {
        item.price = menuItem.price; // ✅ Store initial price if missing
      }

      item.total = item.price * item.quantity; // ✅ Always update total
    });

    next();
  } catch (err) {
    console.error("❌ Error in pre('save'):", err);
    next(err);
  }
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
