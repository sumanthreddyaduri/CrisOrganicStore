import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitContactMutation = trpc.contact.submit.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to submit contact form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 hover:text-green-800 mb-4 inline-block">Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-2">We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@crisorganic.com</p>
              <p className="text-sm text-gray-500 mt-2">We'll respond within 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">1-800-ORGANIC</p>
              <p className="text-sm text-gray-500 mt-2">Mon-Fri, 9AM-6PM EST</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">123 Organic Lane</p>
              <p className="text-sm text-gray-500">Portland, OR 97201</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                    Thank you for your message! We'll be in touch soon.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ and Live Chat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat Support
                </CardTitle>
                <CardDescription>Chat with our team in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Our support team is available Monday through Friday, 9 AM to 6 PM EST. Click the chat button in the bottom right corner to start a conversation.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What is barley powder?</h4>
                  <p className="text-sm text-gray-700">
                    Barley powder is a nutrient-rich superfood made from dried and ground barley grass, packed with vitamins, minerals, and antioxidants.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How do I use barley powder?</h4>
                  <p className="text-sm text-gray-700">
                    Mix 1-2 teaspoons with water, juice, or smoothies. You can also add it to recipes like soups, baked goods, and beverages.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Is it organic?</h4>
                  <p className="text-sm text-gray-700">
                    Yes! All our barley powder is certified organic, non-GMO, and free from pesticides and chemicals.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What's your return policy?</h4>
                  <p className="text-sm text-gray-700">
                    We offer a 30-day money-back guarantee on all products. If you're not satisfied, we'll refund your purchase.
                  </p>
                </div>

                <Link href="/blog">
                  <Button variant="outline" className="w-full">View More FAQs</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

