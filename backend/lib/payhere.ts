import { createHash } from "node:crypto";

export const PAYHERE_CURRENCY = process.env.PAYHERE_CURRENCY || "LKR";

export function getPayHereCredentials() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    throw new Error("PayHere sandbox credentials are not configured on the backend.");
  }

  return { merchantId, merchantSecret };
}

function md5(value: string) {
  return createHash("md5").update(value).digest("hex").toUpperCase();
}

export function createPayHereCheckoutHash(merchantId: string, merchantSecret: string, orderId: string, amount: string, currency: string) {
  return md5(`${merchantId}${orderId}${amount}${currency}${md5(merchantSecret)}`);
}

export function verifyPayHereNotification(fields: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}, merchantSecret: string) {
  const expected = md5(
    `${fields.merchant_id}${fields.order_id}${fields.payhere_amount}${fields.payhere_currency}${fields.status_code}${md5(merchantSecret)}`
  );
  return fields.md5sig.length === expected.length &&
    Buffer.from(fields.md5sig.toUpperCase()).equals(Buffer.from(expected));
}

export function getPayHereStatus(statusCode: string) {
  switch (statusCode) {
    case "2": return "Paid" as const;
    case "-1": return "Cancelled" as const;
    case "-2": return "Failed" as const;
    case "-3": return "ChargedBack" as const;
    default: return "Pending" as const;
  }
}