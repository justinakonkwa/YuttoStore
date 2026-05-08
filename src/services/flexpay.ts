type MakePaymentInput = {
  amount: string;
  phone: string;
  reference: string;
  description: string;
};

type MakeCardPaymentInput = {
  amount: string;
  reference: string;
  description: string;
};

type FlexpayResponse = {
  code?: string;
  message?: string;
  orderNumber?: string | null;
  url?: string;
};

const FLEXPAY_TOKEN =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJcL2xvZ2luIiwicm9sZXMiOlsiTUVSQ0hBTlQiXSwiZXhwIjoxNzg1NTA5ODMyLCJzdWIiOiI0OGM2NzEzZWNkMzBmOTc5OGRhMjEzYTZjMWZjOWJiNiJ9.qGnIQKI1S6hlT_jv1HAB6MXsLcjHnDQfRB0gzYjERHM";
const PAYMENT_URL = "https://backend.flexpay.cd/api/rest/v1/paymentService";
const CARD_PAYMENT_URL = "https://cardpayment.flexpay.cd/v1.1/pay";
const CHECK_TRANSACTION_URL = "https://backend.flexpay.cd/api/rest/v1/check";
const MERCHANT = "DevSphire";

function assertFlexpayConfigured() {
  if (FLEXPAY_TOKEN.includes("REPLACE_WITH_YOUR_FLEXPAY_TOKEN")) {
    throw new Error("Token FlexPay manquant dans src/services/flexpay.ts.");
  }
}

async function parseJsonResponse(response: Response): Promise<FlexpayResponse> {
  try {
    return (await response.json()) as FlexpayResponse;
  } catch {
    return {};
  }
}

export async function makePayment({
  amount,
  phone,
  reference,
  description,
}: MakePaymentInput): Promise<string> {
  assertFlexpayConfigured();

  const payload = {
    merchant: MERCHANT,
    type: "1",
    phone,
    reference,
    amount,
    currency: "USD",
    description,
    callbackUrl: "https://abcd.efgh.cd",
  };

  const response = await fetch(PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: FLEXPAY_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);
  if (typeof body.orderNumber === "string" && body.orderNumber.trim()) {
    return body.orderNumber;
  }

  if (body.message) {
    throw new Error(body.message);
  }

  throw new Error("La création du paiement a échoué.");
}

export async function makeCardPayment({
  amount,
  reference,
  description,
}: MakeCardPaymentInput): Promise<string> {
  assertFlexpayConfigured();

  const payload = {
    merchant: MERCHANT,
    reference,
    amount,
    currency: "USD",
    description,
    callback_url: "https://xxxxxx/callback.com",
    approve_url: "https://xxxxxx/approve.com",
    cancel_url: "https://xxxxxxxx/cancel.com",
    decline_url: "https://xxxxxxxx/decline.com",
  };

  const response = await fetch(CARD_PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: FLEXPAY_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);
  if (typeof body.url === "string" && body.url.trim()) {
    return body.url;
  }

  if (body.message) {
    throw new Error(body.message);
  }

  throw new Error("Impossible de créer le paiement carte.");
}

export async function checkTransaction(orderNumber: string): Promise<string> {
  assertFlexpayConfigured();

  const response = await fetch(`${CHECK_TRANSACTION_URL}/${orderNumber}`, {
    headers: {
      Authorization: FLEXPAY_TOKEN,
    },
  });

  const body = await parseJsonResponse(response);
  return typeof body.message === "string" ? body.message : "";
}
