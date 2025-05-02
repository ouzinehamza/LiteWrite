export type ApiSubscriptionPlan = {
  code: string;
  title: string;
  duration: number;
  price: number;
};

export type ApiPaymentHistory = {
  id: number;
  created_at: string;
  plan: string;
  starts_at: string;
  ends_at: string;
  cancelled_at?: string;
};
