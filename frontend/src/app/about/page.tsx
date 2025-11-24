"use client";

import { Container, Card, Button, Icons } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const values = [
    {
      icon: "Star" as const,
      title: "Quality First",
      description:
        "We handpick every product to ensure the highest quality standards for our customers.",
    },
    {
      icon: "Users" as const,
      title: "Customer Focus",
      description:
        "Your satisfaction is our priority. We're here to provide exceptional service and support.",
    },
    {
      icon: "Heart" as const,
      title: "Passion",
      description:
        "We love what we do and it shows in every product we offer and every interaction we have.",
    },
    {
      icon: "Zap" as const,
      title: "Innovation",
      description:
        "Always evolving, always improving. We stay ahead of trends to bring you the best.",
    },
  ];

  const team = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image: "https://via.placeholder.com/200x200?text=JD",
      bio: "Visionary leader with 15+ years in e-commerce",
    },
    {
      name: "Jane Smith",
      role: "Head of Operations",
      image: "https://via.placeholder.com/200x200?text=JS",
      bio: "Operations expert ensuring seamless customer experience",
    },
    {
      name: "Mike Johnson",
      role: "Product Manager",
      image: "https://via.placeholder.com/200x200?text=MJ",
      bio: "Curating the best products for our customers",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container size="xl" className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              About MATRUVA
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your trusted partner for premium products and exceptional shopping
              experiences
            </p>
          </div>
        </Container>
      </div>

      {/* Mission Section */}
      <Container size="xl" className="py-16 md:py-24">
        <Card variant="elevated" className="p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-[var(--foreground-secondary)] mb-4 leading-relaxed">
                At MATRUVA, we're committed to bringing you the best products at
                competitive prices. Our mission is to make online shopping
                convenient, reliable, and enjoyable for everyone.
              </p>
              <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed">
                We believe in building lasting relationships with our customers
                by delivering quality products, exceptional service, and a
                seamless shopping experience from browse to delivery.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                alt="Our mission"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </Card>
      </Container>

      {/* Values Section */}
      <div className="py-16 md:py-24 bg-[var(--muted)]/30">
        <Container size="xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              These core values guide everything we do and shape our company
              culture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = Icons[value.icon];
              return (
                <Card
                  key={index}
                  variant="elevated"
                  hover
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-[var(--foreground-secondary)]">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Team Section */}
      <Container size="xl" className="py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Passionate individuals working together to bring you the best
            shopping experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} variant="elevated" hover padding="none">
              <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-[var(--primary)] font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {member.bio}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>

      {/* Stats Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <p className="text-white/80">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
              <p className="text-white/80">Products</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <p className="text-white/80">Satisfaction Rate</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <p className="text-white/80">Support</p>
            </div>
          </div>
        </Container>
      </div>

      {/* CTA Section */}
      <Container size="xl" className="py-16 md:py-24">
        <Card variant="elevated" className="text-center p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-2xl mx-auto">
            Explore our wide range of products and find exactly what you're
            looking for
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/products")}
              icon={<Icons.ShoppingBag className="w-5 h-5" />}
            >
              Browse Products
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/contact")}
              icon={<Icons.Mail className="w-5 h-5" />}
            >
              Contact Us
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
