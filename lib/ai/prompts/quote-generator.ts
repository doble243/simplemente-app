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

## Precios de referencia (${currency === 'USD' ? 'USD' : 'UYU - referencia: 1 USD ≈ 42 UYU'})
- Diseño UX/UI por pantalla: ${currency === 'USD' ? '$50-$150' : '$2,000-$6,000 UYU'}
- Desarrollo frontend (hora): ${currency === 'USD' ? '$30-$60' : '$1,200-$2,500 UYU'}
- Integración API/backend (hora): ${currency === 'USD' ? '$40-$80' : '$1,680-$3,360 UYU'}
- SEO básico: ${currency === 'USD' ? '$100-$300' : '$4,200-$12,600 UYU'}
- Integración MercadoPago: ${currency === 'USD' ? '$150-$400' : '$6,300-$16,800 UYU'}

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
