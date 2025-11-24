"use client";

import { useState } from "react";
import {
  Container,
  Card,
  Button,
  Input,
  TextArea,
  Icons,
} from "@/components/ui";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: "Mail" as const,
      title: "Email Us",
      value: "support@matruva.com",
      link: "mailto:support@matruva.com",
    },
    {
      icon: "Phone" as const,
      title: "Call Us",
      value: "+91 1234567890",
      link: "tel:+911234567890",
    },
    {
      icon: "MapPin" as const,
      title: "Visit Us",
      value: "123 Business St, City, State 12345",
      link: "#",
    },
    {
      icon: "Clock" as const,
      title: "Business Hours",
      value: "Mon-Sat: 9AM - 6PM",
      link: "#",
    },
  ];

  const faqs = [
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy on most items. Products must be unused and in original packaging.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, we ship within India only. International shipping is coming soon.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email to monitor your delivery.",
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
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Have questions? We're here to help and answer any question you
              might have
            </p>
          </div>
        </Container>
      </div>

      {/* Contact Methods */}
      <Container size="xl" className="py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = Icons[method.icon];
            return (
              <Card
                key={index}
                variant="elevated"
                hover
                className="text-center"
                onClick={() => {
                  if (method.link !== "#") window.location.href = method.link;
                }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="font-bold mb-2">{method.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {method.value}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Contact Form and Map */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card variant="elevated">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <Icons.CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-[var(--foreground-secondary)]">
                  Thank you for contacting us. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
                <TextArea
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                  icon={
                    submitting ? (
                      <Icons.Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icons.Send className="w-5 h-5" />
                    )
                  }
                >
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </Card>

          {/* Map / Additional Info */}
          <div className="space-y-8">
            <Card variant="elevated">
              <h2 className="text-2xl font-bold mb-4">Visit Our Store</h2>
              <div className="aspect-video bg-[var(--muted)] rounded-lg mb-4 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icons.MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      123 Business Street
                      <br />
                      City, State 12345
                      <br />
                      India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icons.Phone className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      +91 1234567890
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icons.Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      support@matruva.com
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* FAQs */}
      <div className="py-16 md:py-24 bg-[var(--muted)]/30">
        <Container size="xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Quick answers to common questions. Can't find what you're looking
              for? Contact us directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} variant="elevated">
                <h3 className="font-bold mb-3 flex items-start gap-2">
                  <Icons.HelpCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-[var(--foreground-secondary)] pl-7">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}
