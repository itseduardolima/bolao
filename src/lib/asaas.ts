const BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3'

async function call(path: string, opts?: RequestInit) {
  const apiKey = process.env.ASAAS_API_KEY
  console.log('[asaas] call', path, {
    env: process.env.ASAAS_ENV,
    keyPresent: !!apiKey,
    keyLength: apiKey?.length ?? 0,
    keyPrefix: apiKey?.slice(0, 10) ?? '(empty)',
  })

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      access_token: apiKey ?? '',
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.errors?.[0]?.description ?? `Asaas error ${res.status}`
    throw new Error(msg)
  }
  return data
}

export interface AsaasCustomer {
  id: string
  name: string
  email: string
}

export interface AsaasPayment {
  id: string
  status: string
  value: number
  billingType: string
  externalReference: string
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

/** Finds an existing customer by email or creates a new one. */
export async function upsertCustomer(
  email: string,
  name: string,
  cpf: string
): Promise<AsaasCustomer> {
  const cpfClean = cpf.replace(/\D/g, '')
  const search = await call(`/customers?email=${encodeURIComponent(email)}&limit=1`)
  if (search.data?.length > 0) return search.data[0] as AsaasCustomer
  return call('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      cpfCnpj: cpfClean,
      notificationDisabled: true,
    }),
  }) as Promise<AsaasCustomer>
}

/** Creates a PIX charge for the given customer. */
export async function createPixCharge(
  customerId: string,
  amountCents: number,
  description: string,
  externalReference: string
): Promise<AsaasPayment> {
  const dueDate = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  return call('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX',
      value: amountCents / 100,
      dueDate,
      description,
      externalReference,
    }),
  }) as Promise<AsaasPayment>
}

/** Returns the PIX QR code data for an existing payment. */
export async function getPixQrCode(asaasPaymentId: string): Promise<AsaasPixQrCode> {
  return call(`/payments/${asaasPaymentId}/pixQrCode`) as Promise<AsaasPixQrCode>
}
