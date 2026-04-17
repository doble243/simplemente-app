export function buildQuotePrompt(input: {
  projectType: string
  description: string
  requirements: string[]
  currency: 'UYU' | 'USD'
}): string {
  const { projectType, description, requirements, currency } = input

  return `Sos un experto en presupuestos de una agencia de desarrollo web uruguaya.
Generá un presupuesto detallado en formato JSON para el siguiente proyecto.

## Proyecto
- Tipo: ${projectType}
- Descripción: ${description}
- Requerimientos específicos: ${requirements.join(', ') || 'No especificados'}
- Moneda: ${currency}

## Precios de referencia en pesos uruguayos (UYU)
- Landing page completa: $5.000 - $15.000 UYU
- Diseño UX/UI por pantalla: $1.500 - $4.000 UYU
- Desarrollo frontend (hora): $800 - $1.500 UYU
- Integración API/backend (hora): $1.000 - $2.000 UYU
- SEO básico: $3.000 - $8.000 UYU
- Tienda online / ecommerce: $20.000 - $50.000 UYU
- Integración MercadoPago: $4.000 - $8.000 UYU
- Web app a medida: $40.000 UYU en adelante
- Mantenimiento mensual: $3.500 - $8.000 UYU/mes
${currency === 'USD' ? '\nSi el cliente prefiere USD, convertir usando 1 USD ≈ 42 UYU.' : ''}

Respondé ÚNICAMENTE con este JSON (sin markdown, sin explicaciones):
{
  "items": [
    {
      "description": "<descripción del ítem>",
      "quantity": <número>,
      "unit_price": <precio unitario sin signo>,
      "amount": <total del ítem>
    }
  ],
  "subtotal": <suma de amounts>,
  "notes": "<notas o aclaraciones sobre el presupuesto>",
  "delivery_weeks": <semanas estimadas de entrega>
}`
}
