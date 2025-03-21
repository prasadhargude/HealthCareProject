import mongoose, { type Document } from "mongoose"
import connectToDatabase from "@/lib/mongodb"

// Define a type alias for LeanDocument
type LeanDocument<T> = mongoose.FlattenMaps<T> & { _id: string }

// Define a getModel function since it's not exported from mongodb.ts
function getModel<T extends Document>(name: string, schema: mongoose.Schema<T>): mongoose.Model<T> {
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema)
}

// Add these interfaces for the medicine ordering system
export interface IMedicine extends Document {
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviews: number
  image: string
  stock: number
  requiresPrescription: boolean
  dosage: string
  manufacturer: string
  sideEffects: string
  createdAt: Date
}

export interface ICartItem extends Document {
  userId: string
  medicineId: mongoose.Types.ObjectId
  quantity: number
  addedAt: Date
}

export interface IOrder extends Document {
  userId: string
  items: Array<{
    medicineId: mongoose.Types.ObjectId
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  paymentId: string
  paymentOrderId: string
  paymentStatus: string
  orderStatus: string
  prescriptionImage?: string
  createdAt: Date
}

export interface IAddress {
  id: mongoose.Types.ObjectId
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

// Define a User interface that includes addresses
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  addresses?: IAddress[];
  // Add other user fields as needed
}

// Define a type for the lean user document
interface LeanUser {
  _id: string;
  name: string;
  email: string;
  addresses?: IAddress[];
  [key: string]: any; // For any other properties
}

// Define schemas for the medicine ordering system
const medicineSchema = new mongoose.Schema<IMedicine>({
  name: String,
  price: Number,
  description: String,
  category: String,
  rating: Number,
  reviews: Number,
  image: String,
  stock: Number,
  requiresPrescription: Boolean,
  dosage: String,
  manufacturer: String,
  sideEffects: String,
  createdAt: { type: Date, default: Date.now },
})

const cartItemSchema = new mongoose.Schema<ICartItem>({
  userId: String,
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  quantity: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now },
})

const orderSchema = new mongoose.Schema<IOrder>({
  userId: String,
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  paymentId: String,
  paymentOrderId: String,
  paymentStatus: { type: String, default: "pending" },
  orderStatus: { type: String, default: "processing" },
  prescriptionImage: String,
  createdAt: { type: Date, default: Date.now },
})

// Add models for the medicine ordering system
export const Medicine = () => getModel<IMedicine>("Medicine", medicineSchema)
export const CartItem = () => getModel<ICartItem>("CartItem", cartItemSchema)
export const Order = () => getModel<IOrder>("Order", orderSchema)

// Medicine-related functions
export async function getMedicines(query = {}): Promise<LeanDocument<IMedicine>[]> {
  await connectToDatabase()
  const results = await Medicine().find(query).lean()
  return results as unknown as LeanDocument<IMedicine>[]
}

export async function getMedicineById(id: string): Promise<LeanDocument<IMedicine> | null> {
  await connectToDatabase()
  const result = await Medicine().findById(id).lean()
  return result as unknown as LeanDocument<IMedicine> | null
}

export async function getMedicinesByCategory(category: string): Promise<LeanDocument<IMedicine>[]> {
  await connectToDatabase()
  const results = await Medicine().find({ category }).lean()
  return results as unknown as LeanDocument<IMedicine>[]
}

export async function searchMedicines(searchTerm: string): Promise<LeanDocument<IMedicine>[]> {
  await connectToDatabase()
  const results = await Medicine()
    .find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { manufacturer: { $regex: searchTerm, $options: "i" } },
      ],
    })
    .lean()
  return results as unknown as LeanDocument<IMedicine>[]
}

// Cart-related functions
export async function getCartItems(
  userId: string,
): Promise<Array<LeanDocument<ICartItem> & { medicine: LeanDocument<IMedicine> }>> {
  await connectToDatabase()
  const cartItems = await CartItem().find({ userId }).lean()

  const itemsWithDetails = await Promise.all(
    cartItems.map(async (item: any) => {
      const medicine = await Medicine().findById(item.medicineId).lean()
      return {
        ...item,
        medicine: medicine as unknown as LeanDocument<IMedicine>,
      }
    }),
  )

  return itemsWithDetails as unknown as Array<LeanDocument<ICartItem> & { medicine: LeanDocument<IMedicine> }>
}

export async function addToCart(userId: string, medicineId: string, quantity = 1): Promise<LeanDocument<ICartItem>> {
  await connectToDatabase()

  // Check if item already exists in cart
  const existingItem = await CartItem().findOne({ userId, medicineId })

  if (existingItem) {
    // Update quantity if item exists
    existingItem.quantity += quantity
    await existingItem.save()
    return existingItem.toObject() as unknown as LeanDocument<ICartItem>
  } else {
    // Create new cart item if it doesn't exist
    const cartItem = new (CartItem())({
      userId,
      medicineId,
      quantity,
      addedAt: new Date(),
    })
    await cartItem.save()
    return cartItem.toObject() as unknown as LeanDocument<ICartItem>
  }
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
): Promise<LeanDocument<ICartItem> | null> {
  await connectToDatabase()
  const cartItem = await CartItem().findOneAndUpdate({ _id: cartItemId, userId }, { quantity }, { new: true }).lean()

  return cartItem as unknown as LeanDocument<ICartItem> | null
}

export async function removeFromCart(userId: string, cartItemId: string): Promise<boolean> {
  await connectToDatabase()
  const result = await CartItem().findOneAndDelete({ _id: cartItemId, userId })
  return !!result
}

export async function clearCart(userId: string): Promise<boolean> {
  await connectToDatabase()
  const result = await CartItem().deleteMany({ userId })
  return result.deletedCount > 0
}

// Order-related functions
export async function createOrder(orderData: Partial<IOrder>): Promise<LeanDocument<IOrder>> {
  await connectToDatabase()
  const order = new (Order())(orderData)
  await order.save()
  return order.toObject() as unknown as LeanDocument<IOrder>
}

export async function getOrdersByUser(userId: string): Promise<LeanDocument<IOrder>[]> {
  await connectToDatabase()
  const orders = await Order().find({ userId }).sort({ createdAt: -1 }).lean()
  return orders as unknown as LeanDocument<IOrder>[]
}

export async function getOrderById(orderId: string): Promise<LeanDocument<IOrder> | null> {
  await connectToDatabase()
  const order = await Order().findById(orderId).lean()
  return order as unknown as LeanDocument<IOrder> | null
}

export async function updateOrderStatus(orderId: string, orderStatus: string): Promise<LeanDocument<IOrder> | null> {
  await connectToDatabase()
  const order = await Order().findByIdAndUpdate(orderId, { orderStatus }, { new: true }).lean()

  return order as unknown as LeanDocument<IOrder> | null
}

export async function updateOrderPayment(
  orderId: string,
  paymentId: string,
  paymentOrderId: string,
  paymentStatus: string,
): Promise<LeanDocument<IOrder> | null> {
  await connectToDatabase()
  const order = await Order()
    .findByIdAndUpdate(orderId, { paymentId, paymentOrderId, paymentStatus }, { new: true })
    .lean()

  return order as unknown as LeanDocument<IOrder> | null
}

// User address functions
export async function getUserAddresses(userId: string): Promise<IAddress[]> {
  await connectToDatabase()
  const UserModel = mongoose.model<IUser>("User")
  const user = await UserModel.findOne({ _id: userId }).lean() as LeanUser | null
  
  // Check if user exists and has addresses
  if (user && Array.isArray(user.addresses)) {
    return user.addresses
  }
  return []
}

export async function addUserAddress(userId: string, address: Omit<IAddress, "id">): Promise<IAddress | null> {
  await connectToDatabase()
  const addressWithId = {
    ...address,
    id: new mongoose.Types.ObjectId(),
  }

  // If this is set as default, unset any existing default
  if (address.isDefault) {
    await mongoose
      .model("User")
      .updateOne({ _id: userId, "addresses.isDefault": true }, { $set: { "addresses.$.isDefault": false } })
  }

  const result = await mongoose
    .model("User")
    .findByIdAndUpdate(userId, { $push: { addresses: addressWithId } }, { new: true })
    .lean() as LeanUser | null

  if (!result) return null

  return addressWithId
}

export async function updateUserAddress(
  addressId: string,
  userId: string,
  updateData: Partial<IAddress>,
): Promise<IAddress | null> {
  await connectToDatabase()

  // If this is set as default, unset any existing default
  if (updateData.isDefault) {
    await mongoose
      .model("User")
      .updateOne({ _id: userId, "addresses.isDefault": true }, { $set: { "addresses.$.isDefault": false } })
  }

  // Update the specific address in the user's addresses array
  const result = await mongoose
    .model("User")
    .findOneAndUpdate(
      {
        _id: userId,
        "addresses.id": addressId,
      },
      {
        $set: Object.entries(updateData).reduce(
          (acc, [key, value]) => {
            acc[`addresses.$.${key}`] = value
            return acc
          },
          {} as Record<string, any>,
        ),
      },
      { new: true },
    )
    .lean() as LeanUser | null

  if (!result) return null

  // Safely access the addresses property with proper typing
  if (!result.addresses || !Array.isArray(result.addresses)) {
    return null
  }
  
  // Find and return the updated address
  const updatedAddress = result.addresses.find(addr => addr.id.toString() === addressId)
  return updatedAddress || null
}

export async function deleteUserAddress(addressId: string, userId: string): Promise<boolean> {
  await connectToDatabase()

  const result = await mongoose.model("User").updateOne({ _id: userId }, { $pull: { addresses: { id: addressId } } })

  return result.modifiedCount > 0
}
export function getMedicineImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return `/placeholder.svg?height=200&width=200`;
    }
    
    // Check if the path is a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if the path already includes /medicines/
    if (imagePath.includes('/medicines/')) {
      return imagePath;
    }
    
    // Otherwise, assume it's just a filename and add the /medicines/ prefix
    return `/medicines/${imagePath}`;
  }