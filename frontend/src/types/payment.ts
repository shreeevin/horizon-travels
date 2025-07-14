export type PaymentTypeName = 'paypal' | 'revolut' | 'stripe';

export interface PaymentMethod {
    label: string;
    value: PaymentTypeName;
}

export const paymentMethods: PaymentMethod[] = [
    { label: "PayPal", value: "paypal" },
    { label: "Revolut", value: "revolut" },
    { label: "Stripe", value: "stripe" },
];