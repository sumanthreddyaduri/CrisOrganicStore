import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Package, Truck, CheckCircle, Clock, Leaf } from "lucide-react";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery({}, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <Link href="/"><Button className="bg-green-600 hover:bg-green-700">Go to Home</Button></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const ordersList = orders?.orders || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "processing":
        return "bg-blue-50 border-blue-200";
      case "shipped":
        return "bg-purple-50 border-purple-200";
      case "delivered":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 hover:text-green-800 mb-4 inline-block">Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!ordersList || ordersList.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <Link href="/products"><Button className="bg-green-600 hover:bg-green-700">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-6">
            {ordersList.map((order: any) => (
              <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                      <CardDescription>
                        Placed on {new Date(order.createdAt || "").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold capitalize text-gray-900">{order.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-700">
                              <span>{item.product?.name || "Product"} x {item.quantity}</span>
                              <span>${((item.price || 0) / 100).toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No items information available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </p>
                      <p className="text-sm text-gray-700">{order.shippingAddress?.street}</p>
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-semibold text-gray-900">${((order.subtotal || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax</p>
                        <p className="font-semibold text-gray-900">${((order.tax || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Shipping</p>
                        <p className="font-semibold text-gray-900">${((order.shipping || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-lg text-green-600">${(((order.subtotal || 0) + (order.tax || 0) + (order.shipping || 0)) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {order.status === "shipped" && (
                      <Button variant="outline" className="flex-1">
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">View Details</Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">Reorder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

