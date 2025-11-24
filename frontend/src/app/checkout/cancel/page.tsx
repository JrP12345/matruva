"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Container, Button, Card } from "@/components/ui";
import { Icons } from "@/lib/icons";
import Link from "next/link";
import api from "@/lib/api";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  return (
    <Container>
      <div className="py-12 max-w-2xl mx-auto text-center">
        {/* Cancel Icon */}
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icons.AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was not completed. Your order has been created but is
          awaiting payment.
        </p>

        {/* Info Card */}
        <Card className="p-6 mb-8 text-left">
          <h2 className="text-lg font-bold mb-4">What happened?</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <Icons.CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                Your order has been created (Order ID:{" "}
                {orderId ? `#${orderId.slice(-8).toUpperCase()}` : "N/A"})
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span>Payment was not completed</span>
            </li>
            <li className="flex gap-2">
              <Icons.Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>Your items are reserved for 30 minutes</span>
            </li>
          </ul>
        </Card>

        {/* What's Next */}
        <Card className="p-6 mb-8 text-left">
          <h2 className="text-lg font-bold mb-4">What would you like to do?</h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              You can complete your payment by clicking the button below, or
              return to your cart to modify your order.
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {orderId && (
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={async () => {
                try {
                  const response = await api.post(
                    "/v1/payments/create-checkout-session",
                    {
                      orderId,
                    }
                  );

                  const { sessionUrl } = response.data;
                  window.location.href = sessionUrl;
                } catch (err: any) {
                  console.error("Error:", err);
                  alert(
                    err.response?.data?.message ||
                      "Failed to create checkout session. Please try again."
                  );
                }
              }}
            >
              <Icons.CreditCard className="w-5 h-5 mr-2" />
              Try Payment Again
            </Button>
          )}

          <Link href="/cart" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              <Icons.ShoppingCart className="w-5 h-5 mr-2" />
              Return to Cart
            </Button>
          </Link>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="ghost" className="text-sm">
              Continue Shopping
            </Button>
          </Link>

          {orderId && (
            <Button
              variant="ghost"
              className="text-sm text-red-600 hover:text-red-700"
              onClick={async () => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  try {
                    await api.patch(`/v1/orders/${orderId}/cancel`);
                    alert("Order cancelled successfully");
                    router.push("/products");
                  } catch (err: any) {
                    console.error("Error:", err);
                    alert(
                      err.response?.data?.message || "Failed to cancel order"
                    );
                  }
                }
              }}
            >
              <Icons.XCircle className="w-4 h-4 mr-1" />
              Cancel Order
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Need help?</p>
          <p>
            If you're experiencing issues with payment, please contact our
            support team or try using a different payment method.
          </p>
        </div>
      </div>
    </Container>
  );
}
