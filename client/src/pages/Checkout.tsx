import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ChevronRight, Leaf, Lock } from "lucide-react";

type CheckoutStep = "shipping" | "payment" | "review";

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    paymentMethod: "card",
  });

  const { data: cartItems } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrderMutation = trpc.orders.create.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!isAuthenticated || !cartItems || cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      const tax = Math.round(subtotal * 0.1);
      const shipping = subtotal > 5000 ? 0 : 500;
      const total = subtotal + tax + shipping;

      await createOrderMutation.mutateAsync({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        subtotal,
        tax,
        shipping,
        discount: 0,
      });

      navigate("/orders");
    } catch (error) {
      console.error("Failed to create order", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to checkout</p>
          <Link href="/"><Button className="bg-green-600 hover:bg-green-700">Go to Home</Button></Link>
        </div>
      </div>
    );
  }

  const cartItems_safe = cartItems || [];
  const subtotal = cartItems_safe.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + tax + shipping;

  const isShippingValid = formData.firstName && formData.lastName && formData.street && formData.city && formData.state && formData.zipCode;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/cart" className="text-green-700 hover:text-green-800 mb-4 inline-block">Back to Cart</Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep === "shipping" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>1</div>
              <div className="flex-1 h-1 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep === "payment" ? "bg-green-600 text-white" : currentStep === "review" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>2</div>
              <div className="flex-1 h-1 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep === "review" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>3</div>
            </div>

            {/* Shipping Step */}
            {currentStep === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    <Input placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                  <Input placeholder="Street Address" name="street" value={formData.street} onChange={handleInputChange} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input placeholder="City" name="city" value={formData.city} onChange={handleInputChange} />
                    <Input placeholder="State" name="state" value={formData.state} onChange={handleInputChange} />
                    <Input placeholder="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
                  </div>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setCurrentStep("payment")} disabled={!isShippingValid}>
                    Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose how you'd like to pay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "card" }))}>
                      <input type="radio" name="payment" value="card" checked={formData.paymentMethod === "card"} onChange={() => {}} className="w-4 h-4" />
                      <span className="ml-3 font-medium">Credit Card</span>
                    </label>

                    {formData.paymentMethod === "card" && (
                      <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <Input placeholder="Card Number" />
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input placeholder="MM/YY" />
                          <Input placeholder="CVV" />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "paypal" }))}>
                      <input type="radio" name="payment" value="paypal" checked={formData.paymentMethod === "paypal"} onChange={() => {}} className="w-4 h-4" />
                      <span className="ml-3 font-medium">PayPal</span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "apple" }))}>
                      <input type="radio" name="payment" value="apple" checked={formData.paymentMethod === "apple"} onChange={() => {}} className="w-4 h-4" />
                      <span className="ml-3 font-medium">Apple Pay</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("shipping")}>Back</Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setCurrentStep("review")}>
                      Review Order <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Step */}
            {currentStep === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>Please verify all details before completing purchase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <p className="text-gray-700">{formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-700">{formData.street}</p>
                    <p className="text-gray-700">{formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                    <p className="text-gray-700 capitalize">{formData.paymentMethod}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {cartItems_safe.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-700">
                          <span>{item.product?.name} x {item.quantity}</span>
                          <span>${(((item.product?.price || 0) * item.quantity) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("payment")}>Back</Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmitOrder} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems_safe.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span>{item.product?.name} x {item.quantity}</span>
                      <span>${(((item.product?.price || 0) * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%)</span>
                    <span>${(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-600">${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

