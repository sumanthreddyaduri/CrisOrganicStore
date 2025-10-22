import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Trash2, ShoppingCart, Leaf } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const { data: cartItems, refetch: refetchCart } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateItemMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => refetchCart(),
  });

  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => refetchCart(),
  });

  const validatePromoMutation = trpc.promoCodes.validate.useMutation();

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    const subtotal = cartItems?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;
    const result = await validatePromoMutation.mutateAsync({
      code: promoCode,
      purchaseAmount: subtotal / 100,
    });
    if (result.valid) {
      setAppliedPromo(result.promoCode);
      setPromoCode("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <Link href="/"><Button className="bg-green-600 hover:bg-green-700">Go to Home</Button></Link>
        </div>
      </div>
    );
  }

  const items = cartItems || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.discountType === "percentage" ? Math.round((subtotal * appliedPromo.discountValue) / 100) : appliedPromo.discountValue * 100;
  }

  const tax = Math.round(subtotal * 0.1);
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 hover:text-green-800 mb-4 inline-block">Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Link href="/products"><Button className="bg-green-600 hover:bg-green-700">Continue Shopping</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Leaf className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600">{item.product?.name}</h3>
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">{item.product?.weight}</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">${((item.product?.price || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button onClick={() => updateItemMutation.mutate({cartItemId: item.id, quantity: Math.max(1, item.quantity - 1)})} className="px-3 py-1 hover:bg-gray-100">-</button>
                          <input type="number" value={item.quantity} onChange={(e) => updateItemMutation.mutate({cartItemId: item.id, quantity: Math.max(1, Number(e.target.value))})} className="w-12 text-center border-0 focus:ring-0 py-1" />
                          <button onClick={() => updateItemMutation.mutate({cartItemId: item.id, quantity: item.quantity + 1})} className="px-3 py-1 hover:bg-gray-100">+</button>
                        </div>
                        <button onClick={() => removeItemMutation.mutate({ cartItemId: item.id })} className="text-red-600 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                        <p className="text-lg font-bold text-gray-900">${(((item.product?.price || 0) * item.quantity) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Promo Code</label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} disabled={!!appliedPromo} />
                      <Button size="sm" variant="outline" onClick={handleApplyPromo} disabled={!!appliedPromo || !promoCode}>Apply</Button>
                    </div>
                    {appliedPromo && (
                      <div className="text-sm text-green-600 flex items-center justify-between">
                        <span>Code: {appliedPromo.code}</span>
                        <button onClick={() => setAppliedPromo(null)} className="text-xs hover:underline">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span></div>
                    {discount > 0 && (<div className="flex justify-between text-green-600"><span>Discount</span><span>-${(discount / 100).toFixed(2)}</span></div>)}
                    <div className="flex justify-between text-gray-700"><span>Tax (10%)</span><span>${(tax / 100).toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-700"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}</span></div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-green-600">${(total / 100).toFixed(2)}</span>
                    </div>
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate("/checkout")}>Proceed to Checkout</Button>
                    <Link href="/products" className="block mt-3"><Button size="sm" variant="outline" className="w-full">Continue Shopping</Button></Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
