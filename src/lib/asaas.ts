function buildBaseUrl() {
  const raw = process.env.ASAAS_ENV === 'production'
    ? (process.env.ASAAS_BASE_URL ?? 'https://api.asaas.com')
    : 'https://api-sandbox.asaas.com'
  return raw.replace(/\/+$/, '') + '/v3'
}
const BASE_URL = buildBaseUrl()

async function call(path: string, opts?: RequestInit) {
  const apiKey = process.env.ASAAS_API_KEY
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      access_token: apiKey ?? '',
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  })
  let data: unknown
  const text = await res.text()
  try { data = JSON.parse(text) } catch { data = null }
  if (!res.ok) {
    const d = data as Record<string, unknown> | null
    const msg = (d as { errors?: { description: string }[] })?.errors?.[0]?.description ?? `Asaas error ${res.status}: ${text.slice(0, 120)}`
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
