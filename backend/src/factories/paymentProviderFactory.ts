import { env } from "../config/index";
import { PaymentProvider } from "../interfaces/payment";
import { DummyPaymentProvider } from "../providers/DummyPaymentProvider";

class NamedDummyPaymentProvider extends DummyPaymentProvider {
  constructor(providerName: string) {
    super();
    this.providerName = providerName;
  }
}

export function createPaymentProvider(): PaymentProvider {
  const provider = (env.PAYMENT_PROVIDER || "dummy").toLowerCase();

  switch (provider) {
    case "dummy":
      return new DummyPaymentProvider();
    case "custom":
    case "razorpay":
    case "stripe":
    case "phonepe":
      return new NamedDummyPaymentProvider(provider);
    default:
      return new DummyPaymentProvider();
  }
}
