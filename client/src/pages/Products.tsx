import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Star, Leaf, ChevronDown } from "lucide-react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating" | "newest">(
    "newest"
  );
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    limit,
    offset,
    search: search || undefined,
    minPrice: minPrice * 100,
    maxPrice: maxPrice * 100,
  });

  const sortedProducts = useMemo(() => {
    if (!productsData?.products) return [];

    const sorted = [...productsData.products];

    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => {
          const aRating = parseFloat(String(b.rating || 0)) - parseFloat(String(a.rating || 0));
          return aRating;
        });
        break;
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return sorted;
  }, [productsData?.products, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 hover:text-green-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-600 mt-2">
            Discover our premium selection of organic barley powder products
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 space-y-6 sticky top-20">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Search</h3>
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Min: ${minPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: ${maxPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "price-asc" | "price-desc" | "rating" | "newest")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setMinPrice(0);
                  setMaxPrice(100);
                  setSortBy("newest");
                  setOffset(0);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                <p className="text-gray-600 mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                        <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Leaf className="w-16 h-16 text-gray-400" />
                          )}
                        </div>

                        <CardHeader className="flex-1">
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
                              ({product.reviewCount})
                            </span>
                          </div>

                          <div className="text-sm text-gray-600">
                            {product.weight && <p>Weight: {product.weight}</p>}
                            {(product.stock || 0) > 0 ? (
                              <p className="text-green-600 font-semibold">In Stock</p>
                            ) : (
                              <p className="text-red-600 font-semibold">Out of Stock</p>
                            )}
                          </div>

                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                  >
                    Previous
                  </Button>

                  <span className="text-gray-600">
                    Page {Math.floor(offset / limit) + 1}
                  </span>

                  <Button
                    variant="outline"
                    disabled={!productsData || productsData.products.length < limit}
                    onClick={() => setOffset(offset + limit)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

