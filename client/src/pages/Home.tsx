import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Star, Leaf, Truck, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: featuredProducts } = trpc.products.list.useQuery({
    limit: 6,
    featured: true,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <span className="text-xl font-bold text-green-700">{APP_TITLE}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-700 hover:text-green-700">
              Products
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-green-700">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-700">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <Button variant="outline" size="sm">
                Cart
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link href="/account">
                <Button size="sm">{user?.name || "Account"}</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Pure Organic Barley Powder
            </h1>
            <p className="text-xl text-gray-600">
              Discover the power of nature's superfood. Our premium organic barley powder is
              carefully sourced and processed to maintain maximum nutritional value.
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Shop Now
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Leaf className="w-32 h-32 text-green-600 mx-auto mb-4" />
              <p className="text-green-700 font-semibold">100% Organic & Natural</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Cris's Organic Store</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Leaf className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">100% Organic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Certified organic barley powder with no pesticides or chemicals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Free shipping on orders over $50. Delivered in 2-3 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Quality Assured</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Rigorous testing ensures purity and potency in every batch.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Customer Loved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Trusted by thousands of health-conscious customers worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.products.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-12">Best Sellers</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Leaf className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${(product.originalPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(parseFloat(String(product.rating || 0)))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Customer Testimonials</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Health Coach",
                testimonial:
                  "The quality of Cris's organic barley powder is exceptional. My clients love it!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Fitness Enthusiast",
                testimonial:
                  "Great product, fast shipping, and excellent customer service. Highly recommended!",
                rating: 5,
              },
              {
                name: "Emma Davis",
                role: "Nutritionist",
                testimonial:
                  "I recommend this to all my patients. Pure, organic, and incredibly effective.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">"{testimonial.testimonial}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of satisfied customers enjoying the benefits of organic barley powder.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">About Us</h3>
              <p className="text-sm">
                Cris's Organic Store is dedicated to providing the highest quality organic barley
                powder to health-conscious customers worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Returns
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <p className="text-sm">Email: info@crisorganic.com</p>
              <p className="text-sm">Phone: 1-800-ORGANIC</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Cris's Organic Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

