jest.mock("../config/index", () => ({
  env: {
    PAYMENT_PROVIDER: "stripe",
  },
}));

import { createPaymentProvider } from "../factories/paymentProviderFactory";

describe("paymentProviderFactory", () => {
  it("returns a named provider for supported gateway values", () => {
    const provider = createPaymentProvider();

    expect(provider.providerName).toBe("stripe");
  });
});
