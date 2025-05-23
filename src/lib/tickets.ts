import { ApiResponse } from "@/types/common";
import { executeApiRequest } from "@/utils/api-request";
import api from "@/lib/api";
import { TicketUniqueTypeResponse } from "@/types/ticket";
import { Order, OrderCreateRequest, OrderCreateResponse } from "@/types/order";
import { PaymentIntent } from "@/types/payment";

export const getTicketTypes = async (eventId: string)
: Promise<ApiResponse<TicketUniqueTypeResponse>> => {
  const response = await executeApiRequest<{
    items: Array<{
      title: string;
      price: number;
      count: number;
    }>;
    total: number;
  }>(
    () => api.get(`/events/${eventId}/ticket-types`),
    "Failed to fetch ticket types"
  );

  if (response.success && response.data) {
    return {
      success: true,
      data: {
        items: response.data.items.map((item, index) => ({
          id: `${eventId}-${index + 1}`,
          name: item.title,
          price: item.price,
          availableCount: item.count
        })),
        total: response.data.total
      },
      errors: []
    };
  }

  return {
    success: false,
    errors: response.errors || ["Unknown error occurred while fetching ticket types"]
  };
};

export const purchaseTickets = async (
    eventId: string, 
    tickets: { 
        typeId: string; 
        quantity: number 
    }[]
): Promise<ApiResponse<void>> => {
  return executeApiRequest<void>(
    () => api.post(`/events/${eventId}/tickets/purchase`, { tickets }),
    "Failed to purchase tickets"
  );
};

export async function createOrder(data : OrderCreateRequest): Promise<ApiResponse<OrderCreateResponse>> {
  const errorMessage = data.promoCode
    ? `Failed to create order with promo code ${data.promoCode}`
    : 'Failed to create order';
  return executeApiRequest<OrderCreateResponse>(
    () => api.post(`/orders`, data),
    errorMessage
  );
}

export async function createPaymentIntent(orderId: number): Promise<ApiResponse<PaymentIntent>> {
  return executeApiRequest<PaymentIntent>(
    () => api.post(`/payments/stripe/payment-intents`, { orderId }),
    `Failed to create payment intent for order id ${orderId}`);
}