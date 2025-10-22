import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Package, ShoppingCart, TrendingUp, Plus, Edit2, Trash2, Lock } from "lucide-react";

export default function MerchantDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "Premium",
  });

  const { data: merchantProducts } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: merchantOrders } = trpc.orders.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const createProductMutation = trpc.products.create.useMutation();

  const handleAddProduct = async () => {
    try {
      await createProductMutation.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
        price: Math.round(newProduct.price * 100),
        stock: newProduct.stock,
      });

      setNewProduct({ name: "", description: "", price: 0, stock: 0, category: "Premium" });
      setShowAddProduct(false);
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access the merchant dashboard</p>
          <Link href="/"><Button className="bg-green-600 hover:bg-green-700">Go to Home</Button></Link>
        </div>
      </div>
    );
  }

  const products = merchantProducts?.products || [];
  const orders = merchantOrders?.orders || [];

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.subtotal || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 hover:text-green-800 mb-4 inline-block">Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || "Seller"}!</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-4 font-semibold ${activeTab === "overview" ? "text-green-600 border-b-2 border-green-600" : "text-gray-700"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 px-4 font-semibold ${activeTab === "products" ? "text-green-600 border-b-2 border-green-600" : "text-gray-700"}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-4 font-semibold ${activeTab === "orders" ? "text-green-600 border-b-2 border-green-600" : "text-gray-700"}`}
          >
            Orders
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${(totalRevenue / 100).toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                  <Package className="w-12 h-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddProduct(!showAddProduct)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showAddProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      placeholder="Price ($)"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: parseInt(e.target.value) }))}
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddProduct(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleAddProduct}
                    >
                      Create Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product: any) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      <span className="text-2xl font-bold text-green-600">${(product.price / 100).toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700">{product.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock: {product.stock}</span>
                      <span className={product.stock > 10 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {product.stock > 10 ? "In Stock" : "Low Stock"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">${((order.subtotal || 0) / 100).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt || "").toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

