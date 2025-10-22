import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Star, Leaf, Heart, Share2 } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading: productLoading } = trpc.products.getById.useQuery(
    { id: id || "" },
    { enabled: !!id }
  );

  const { data: reviews } = trpc.reviews.getByProduct.useQuery(
    { productId: id || "", limit: 10 },
    { enabled: !!id }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation();
  const addToWishlistMutation = trpc.wishlist.addItem.useMutation();
  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCartMutation.mutateAsync({
      productId: product.id,
      quantity,
    });
    setQuantity(1);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    await addToWishlistMutation.mutateAsync({
      productId: product.id,
    });
    setIsWishlisted(true);
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    await createReviewMutation.mutateAsync({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
    });
    setReviewRating(5);
    setReviewTitle("");
    setReviewContent("");
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && Array.isArray(product.images) ? product.images : [];
  const displayImages = images.length > 0 ? images : [product.image || ""];
  const nutritionInfo =
    product.nutritionInfo && typeof product.nutritionInfo === "object" ? product.nutritionInfo : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/products" className="text-green-700 hover:text-green-800 mb-4 inline-block">
            ← Back to Products
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden">
              {displayImages[selectedImage] ? (
                <img
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Leaf className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? "border-green-600" : "border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.shortDescription}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(parseFloat(String(product.rating || 0)))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-green-600">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ${(product.originalPrice / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {product.weight && <p className="text-gray-700">Weight: {product.weight}</p>}
                  <p
                    className={`font-semibold ${
                      (product.stock || 0) > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {(product.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAddToCart}
                disabled={(product.stock || 0) <= 0}
              >
                Add to Cart
              </Button>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleAddToWishlist}
                  disabled={isWishlisted}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Nutrition */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>

              {product.ingredients && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                  <p className="text-gray-700">{product.ingredients}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {Object.keys(nutritionInfo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
                <CardDescription>Per serving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(nutritionInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-gray-700">
                      <span className="capitalize">{key}</span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

          {isAuthenticated && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= reviewRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <Input
                    placeholder="Summary of your review"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                  <Textarea
                    placeholder="Share your experience with this product"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          )}

          {reviews && reviews.reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        <CardDescription>
                          <div className="flex gap-2 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </CardDescription>
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

