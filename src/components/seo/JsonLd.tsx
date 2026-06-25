// Injeta dados estruturados (schema.org) como <script type="application/ld+json">.
// Server component — o JSON é serializado no HTML para os crawlers de busca.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
