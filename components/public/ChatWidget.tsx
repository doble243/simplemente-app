'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, Send, User, ChevronDown, ArrowRight } from 'lucide-react'

// ─── Custom animated assistant icon ──────────────────────────────────────────
function BotIcon({ spinning = false, size = 18 }: { spinning?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: spinning ? 'botSpin 1.2s linear infinite' : undefined,
        display: 'block',
      }}
    >
      <style>{`@keyframes botSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
      {/* Inner ring - spins opposite when active */}
      <circle
        cx="12" cy="12" r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="16 28"
        strokeOpacity={spinning ? 0.9 : 0.5}
        strokeLinecap="round"
        style={{ animation: spinning ? 'botSpin 0.8s linear infinite reverse' : undefined }}
      />
      {/* Center dot */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      {/* Top node */}
      <circle cx="12" cy="3.5" r="1.2" fill="currentColor" fillOpacity={spinning ? 1 : 0.6} />
    </svg>
  )
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

interface ChatIntent {
  projectType: string
  budgetRange: string
  planLabel:   string
  summary:     string
}

const INITIAL_SUGGESTIONS = ['¿Qué hacen?', '¿Cuánto cuesta?', 'Ver ejemplos']

// ─── Quick answers — voz humana, con delay simulado para no parecer bot ───────
interface QuickAnswer { text: string; suggestions: string[] }

// Delay realista: simula que alguien está escribiendo
function typingDelay(text: string): number {
  // ~40-60ms por palabra, con un mínimo de 900ms y máximo de 2000ms
  const words = text.split(' ').length
  const base = Math.min(Math.max(words * 55, 900), 2000)
  // Pequeña variación aleatoria para que no sea mecánico
  return base + Math.floor(Math.random() * 300)
}

const QUICK: Array<{ patterns: string[]; answer: QuickAnswer }> = [
  {
    patterns: ['hola', 'buenas', 'buenos dias', 'buen dia', 'hey', 'hi ', 'hello', 'qué tal', 'que tal'],
    answer: {
      text: 'Hola, ¿en qué te puedo ayudar?',
      suggestions: ['¿Qué hacen?', '¿Cuánto cuesta?', 'Ver ejemplos'],
    },
  },
  {
    patterns: ['que hacen', 'qué hacen', 'que ofrecen', 'qué ofrecen', 'que son', 'qué son', 'a que se dedican', 'a qué se dedican'],
    answer: {
      text: 'Creamos páginas web, tiendas online, sistemas a medida y productos digitales para vender y automatizar negocios. No solo hacemos webs — hacemos herramientas reales.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['servicios', 'que tipos', 'qué tipos', 'que tipo de', 'qué tipo de', 'soluciones'],
    answer: {
      text: 'Tiendas online, sistemas a medida, automatizaciones con IA y vidrieras digitales (pantallas que muestran tus productos solos). Todo pensado para generar ingresos, no solo para verse bien.',
      suggestions: ['¿Qué es vidriera?', '¿Cuánto cuesta?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['vidriera', 'pantalla', 'cartel digital', 'cartel', 'tv', 'monitor', 'local fisico', 'local físico', 'pantallas', 'digital signage'],
    answer: {
      text: 'La Vidriera Digital son pantallas (TV o monitor) en tu local que muestran productos, ofertas y contenido solos — sin que toques nada. $5.000 UYU, compatible con hasta 10 pantallas a la vez.',
      suggestions: ['Me interesa', '¿Cuánto cuesta?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['chofer', 'remis', 'taxi', 'transporte', 'flete', 'delivery', 'moto', 'rider', 'repartidor', 'llevar personas', 'traslado'],
    answer: {
      text: 'Para un servicio de transporte o chofer, lo ideal es una landing que muestre tus precios, zonas y permita contactarte fácil. Desde $5.000 UYU, lista en días. ¿Querés un presupuesto?',
      suggestions: ['Pedir presupuesto', 'Ver ejemplos', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['peluqueria', 'peluquería', 'estetica', 'estética', 'spa', 'salon', 'barberia', 'barbería', 'uñas', 'masajes', 'cosmetica', 'cosmética'],
    answer: {
      text: 'Para belleza o bienestar, lo que más rinde es una web con agenda online + vidriera digital en el local. Captás clientes online y mostrás tu trabajo en pantalla. ¿Qué necesitás primero?',
      suggestions: ['Sistema de turnos', 'Vidriera digital', 'Pedir presupuesto'],
    },
  },
  {
    patterns: ['restaurante', 'bar', 'menu', 'menú', 'comida', 'gastronomia', 'gastronomía', 'cafeteria', 'cafetería', 'pizzeria', 'pizzería', 'heladeria', 'heladería'],
    answer: {
      text: 'Para gastro, la Vidriera Digital es ideal: mostrás tu menú, promociones y platos en pantalla sin imprimir nada. $5.000 UYU con hasta 10 pantallas. ¿Te interesa?',
      suggestions: ['Vidriera digital', 'También quiero web', 'Pedir presupuesto'],
    },
  },
  {
    patterns: ['precio', 'cuanto cuesta', 'cuánto cuesta', 'cuanto sale', 'cuánto sale', 'cobran', 'costo', 'valor', 'tarifa', 'presupuesto'],
    answer: {
      text: 'Depende del proyecto. Siempre buscamos adaptarnos — si el presupuesto es un problema, se habla.',
      suggestions: ['¿Se puede negociar?', '¿Cuánto demora?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['negociar', 'negociable', 'descuento', 'mas barato', 'más barato', 'ajustar', 'no tengo mucho'],
    answer: {
      text: 'Sí. Lo importante es que el proyecto salga. Siempre estamos abiertos a propuestas.',
      suggestions: ['Contar mi proyecto', 'Dejar mis datos', '¿Cuánto demora?'],
    },
  },
  {
    patterns: ['landing', 'pagina web', 'página web', 'sitio web', 'presentacion', 'presentación', 'vidriera web'],
    answer: {
      text: 'Una landing la tenés lista en pocos días, desde $5.000 UYU. Diseño limpio, rápido y que convierte visitas en clientes.',
      suggestions: ['¿Se puede negociar?', 'Pedir presupuesto', 'Ver ejemplos'],
    },
  },
  {
    patterns: ['tienda', 'ecommerce', 'vender', 'venta online', 'mercadopago', 'carrito', 'catalogo', 'catálogo'],
    answer: {
      text: 'Las tiendas online arrancan en $20.000 UYU, con catálogo, carrito y MercadoPago. Lista para vender desde el día uno.',
      suggestions: ['¿Se puede negociar?', 'Pedir presupuesto', 'Ver ejemplos'],
    },
  },
  {
    patterns: ['sistema', 'aplicacion', 'aplicación', 'webapp', 'web app', 'plataforma', 'gestion', 'gestión', 'a medida', 'crm', 'reservas', 'portal'],
    answer: {
      text: 'Sistemas a medida desde $40.000 UYU: reservas, CRMs, portales, lo que necesites. ¿Qué tenés en mente?',
      suggestions: ['Contar mi proyecto', '¿Se puede negociar?', 'Pedir presupuesto'],
    },
  },
  {
    patterns: ['paquete', 'mensual', 'cuota', 'suscripcion', 'suscripción', 'todo incluido', 'paquete completo'],
    answer: {
      text: 'El Paquete Completo es $20.000 de entrada + $8.000/mes. Incluye página, sistema, mejoras continuas y contenido para hacer crecer el proyecto.',
      suggestions: ['Me interesa', '¿Qué incluye?', 'Dejar mis datos'],
    },
  },
  {
    patterns: ['ia', 'inteligencia artificial', 'automatizacion', 'automatización', 'bot', 'chatbot'],
    answer: {
      text: 'Integramos IA en todos los proyectos: chatbots, automatizaciones, asistentes. Va incluido, no es un extra.',
      suggestions: ['Ver paquete completo', 'Contar mi proyecto', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['seo', 'posicionamiento', 'google', 'aparecer', 'busqueda', 'búsqueda'],
    answer: {
      text: 'SEO desde $3.500 UYU/mes para posicionarte en Google cuando tus clientes te buscan.',
      suggestions: ['Pedir presupuesto', '¿Se puede negociar?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['mantenimiento', 'soporte', 'actualizacion', 'actualización', 'ayuda tecnica', 'ayuda técnica'],
    answer: {
      text: 'Mantenimiento desde $3.500 UYU/mes: actualizaciones, mejoras, soporte. Para que no tengas que preocuparte por nada.',
      suggestions: ['Ver paquete completo', 'Pedir presupuesto', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['portfolio', 'portafolio', 'ejemplos', 'trabajos', 'proyectos', 'que hicieron', 'qué hicieron', 'referencias', 'clientes'],
    answer: {
      text: 'Tenemos proyectos en varios rubros: ropa urbana, accesorios, perfumería, bienestar, productos digitales. Mirá todo acá → simplemente.uy/portfolio',
      suggestions: ['Ver portfolio', 'Contar mi proyecto', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['como funciona', 'cómo funciona', 'como trabajan', 'cómo trabajan', 'proceso', 'pasos', 'como arranco', 'cómo arranco'],
    answer: {
      text: 'Nos escribís, vemos tu idea y armamos algo concreto para que empieces cuanto antes. Sin vueltas.',
      suggestions: ['Dejar mis datos', '¿Cuánto demora?', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['cuanto demora', 'cuánto demora', 'tiempo', 'plazo', 'cuando esta', 'cuándo está', 'rapidez', 'rapido', 'rápido'],
    answer: {
      text: 'Podés tener algo funcionando en pocos días, dependiendo de la complejidad. Una landing en una semana, una tienda en dos o tres.',
      suggestions: ['Contar mi proyecto', 'Dejar mis datos', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['para vender', 'para negocio', 'genera ventas', 'sirve para vender', 'solo diseño', 'solo es diseño'],
    answer: {
      text: 'Sirve para vender. Todo lo que hacemos está pensado para generar ingresos o clientes — no solo para verse bien.',
      suggestions: ['Contar mi proyecto', 'Ver ejemplos', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['desde cero', 'no tengo nada', 'empezar de cero', 'nunca tuve', 'primer', 'primera vez'],
    answer: {
      text: 'No hay problema. Podemos construir todo desde cero — dominio, diseño, sistema, lo que necesites.',
      suggestions: ['Contar mi proyecto', 'Dejar mis datos', '¿Cuánto cuesta?'],
    },
  },
  {
    patterns: ['como arranco', 'cómo arranco', 'como empiezo', 'cómo empiezo', 'quiero empezar', 'donde empiezo', 'dónde empiezo'],
    answer: {
      text: 'Nos escribís, contás tu idea y armamos algo concreto. Respondemos en menos de 24hs.',
      suggestions: ['Dejar mis datos', 'Contar mi proyecto', 'Ver ejemplos'],
    },
  },
  {
    patterns: ['contacto', 'hablar', 'llamar', 'whatsapp', 'escribir', 'reunion', 'reunión', 'hablar con alguien'],
    answer: {
      text: 'Completá el formulario y te respondemos hoy mismo. También podés escribirnos por WhatsApp.',
      suggestions: ['Dejar mis datos', 'Contar mi proyecto', 'Ver ejemplos'],
    },
  },
  {
    patterns: ['uruguay', 'montevideo', 'donde estan', 'dónde están', 'son de'],
    answer: {
      text: 'Somos uruguayos, trabajamos con clientes en todo el país y del exterior. Precios en pesos.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Contar mi proyecto'],
    },
  },

  // ── Explicaciones de terminología ─────────────────────────────────────────
  {
    patterns: ['que es landing', 'qué es landing', 'que es una landing', 'qué es una landing', 'que significa landing', 'qué significa landing'],
    answer: {
      text: 'Una landing page es UNA página web con un solo objetivo: que te contacten, compren o se registren. No tiene menú ni mil secciones — es directa al punto. Perfecta para lanzar un negocio, producto o servicio rápido.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Me interesa'],
    },
  },
  {
    patterns: ['que es ecommerce', 'qué es ecommerce', 'que significa ecommerce', 'qué significa ecommerce', 'que es tienda online', 'qué es tienda online'],
    answer: {
      text: 'Una tienda online te permite vender por internet: tus clientes ven los productos, los meten al carrito y pagan con tarjeta o MercadoPago. Es como una tienda física, pero abierta las 24hs.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Me interesa'],
    },
  },
  {
    patterns: ['que es seo', 'qué es seo', 'que significa seo', 'qué significa seo', 'como aparezco en google', 'cómo aparezco en google', 'como me encuentran en google', 'cómo me encuentran'],
    answer: {
      text: 'SEO es lo que hace que cuando alguien busca en Google "peluquería en Montevideo" o "remis en Canelones" aparezcas vos primero. Es trabajo técnico en tu web para que Google te recomiende.',
      suggestions: ['¿Cuánto cuesta?', 'Contar mi proyecto', 'Me interesa'],
    },
  },
  {
    patterns: ['que es automatizacion', 'qué es automatización', 'que significa automatizar', 'qué significa automatizar', 'que es automatizar'],
    answer: {
      text: 'Automatizar = que el sistema haga cosas solo. Por ejemplo: que te llegue un mail cuando alguien llena el formulario, que se agende un turno solo, o que un bot responda preguntas sin que estés vos.',
      suggestions: ['Me interesa', '¿Cuánto cuesta?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['que es un sistema a medida', 'qué es un sistema a medida', 'que es sistema a medida', 'qué es sistema a medida', 'que es webapp', 'qué es webapp', 'que es una web app', 'qué es una web app', 'que es un crm', 'qué es un crm'],
    answer: {
      text: 'Un sistema a medida es una herramienta digital construida para tu negocio específico. Por ejemplo: un panel para gestionar clientes, turnos, pedidos o empleados. Nada genérico — funciona exactamente como necesitás.',
      suggestions: ['Ver ejemplos', '¿Cuánto cuesta?', 'Contar mi proyecto'],
    },
  },
  {
    patterns: ['que es mercadopago', 'qué es mercadopago', 'que significa mercadopago', 'como cobro', 'cómo cobro', 'como recibo pagos', 'cómo recibo pagos'],
    answer: {
      text: 'MercadoPago es la plataforma de pagos más usada en Uruguay y Argentina. Tus clientes pagan con tarjeta de crédito, débito o efectivo — vos recibís el dinero en tu cuenta. Lo integramos en todas las tiendas.',
      suggestions: ['Ver tienda online', '¿Cuánto cuesta?', 'Me interesa'],
    },
  },
  {
    patterns: ['no entiendo', 'no entendí', 'no le entiendo', 'no entendi', 'que significa eso', 'qué significa eso', 'me explicas', 'me explicás', 'en terminos simples', 'en términos simples', 'mas simple', 'más simple', 'en simple', 'no sé de esto', 'no se de esto', 'soy nuevo', 'primera vez'],
    answer: {
      text: '¡Sin drama! ¿Qué palabra o cosa no te quedó clara? Podés preguntarme lo que sea y te lo explico simple.',
      suggestions: ['¿Qué es una landing?', '¿Qué es SEO?', '¿Qué es ecommerce?'],
    },
  },
]

function quickMatch(text: string): QuickAnswer | null {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const { patterns, answer } of QUICK) {
    if (patterns.some(p => t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return answer
    }
  }
  return null
}

// ─── Plan detection from text ─────────────────────────────────────────────────
function detectIntent(text: string): Partial<ChatIntent> {
  const t = text.toLowerCase()
  if (t.includes('paquete') || t.includes('completo'))
    return { projectType: 'other',       budgetRange: 'paquete',  planLabel: 'Paquete Completo' }
  if (t.includes('ecommerce') || t.includes('tienda') || t.includes('vender') || t.includes('venta'))
    return { projectType: 'ecommerce',   budgetRange: '20k-40k',  planLabel: 'Tienda Online' }
  if (t.includes('aplicaci') || t.includes('sistema') || t.includes('webapp') || t.includes('web app'))
    return { projectType: 'web_app',     budgetRange: 'gt40k',    planLabel: 'Aplicación Web' }
  if (t.includes('landing') || t.includes('página') || t.includes('pagina') || t.includes('sitio'))
    return { projectType: 'landing',     budgetRange: '5k-10k',   planLabel: 'Landing Page' }
  if (t.includes('vidriera') || t.includes('pantalla') || t.includes('cartel'))
    return { projectType: 'other',       budgetRange: '5k-10k',   planLabel: 'Vidriera Digital' }
  if (t.includes('chofer') || t.includes('transporte') || t.includes('remis') || t.includes('taxi') || t.includes('delivery') || t.includes('flete'))
    return { projectType: 'landing',     budgetRange: '5k-10k',   planLabel: 'Landing Page' }
  if (t.includes('peluquer') || t.includes('estet') || t.includes('spa') || t.includes('barberi') || t.includes('masaj'))
    return { projectType: 'landing',     budgetRange: '5k-10k',   planLabel: 'Landing Page' }
  if (t.includes('restaurante') || t.includes('comida') || t.includes('gastrono') || t.includes('menu') || t.includes('menú'))
    return { projectType: 'landing',     budgetRange: '5k-10k',   planLabel: 'Landing Page' }
  if (t.includes('seo') || t.includes('posicionamiento') || t.includes('google'))
    return { projectType: 'seo',         budgetRange: '5k-10k',   planLabel: 'SEO' }
  if (t.includes('mantenimiento') || t.includes('soporte'))
    return { projectType: 'maintenance', budgetRange: '5k-10k',   planLabel: 'Mantenimiento' }
  return {}
}

// Suggestion text → should navigate to form?
const FORM_TRIGGERS = [
  'dejar mis datos', 'dejar mis dato', 'mi nombre y email',
  'quiero este paquete', 'me interesa', 'hablar con alguien',
  'que me llamen', 'contactar', 'pedir presupuesto',
]

function isFormTrigger(text: string) {
  const t = text.toLowerCase()
  return FORM_TRIGGERS.some(f => t.includes(f))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [pulse, setPulse]       = useState(true)
  const [intent, setIntent]     = useState<Partial<ChatIntent>>({})
  const [showFormCTA, setShowFormCTA] = useState(false)
  // Stable session ID for this browser session (for chat logging / training)
  const sessionId = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('_chat_sid')
      if (stored) return stored
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem('_chat_sid', id)
      return id
    } catch { return `anon-${Date.now()}` }
  }, [])
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola, ¿en qué te puedo ayudar?',
      suggestions: INITIAL_SUGGESTIONS,
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Navigate to /contacto with pre-filled data ──
  const goToForm = useCallback((extra?: Partial<ChatIntent>) => {
    const merged = { ...intent, ...extra }
    // Build summary from last user messages
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .slice(-3)
      .join('. ')

    const payload: ChatIntent = {
      projectType: merged.projectType ?? '',
      budgetRange: merged.budgetRange ?? '',
      planLabel:   merged.planLabel   ?? '',
      summary:     userMessages,
    }
    try {
      sessionStorage.setItem('simplemente_chat_intent', JSON.stringify(payload))
    } catch { /* ignore */ }
    window.location.href = '/contacto'
  }, [intent, messages])

  // ── Send message ──
  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setPulse(false)
    setInput('')

    // Detect intent from user message
    const newIntent = detectIntent(content)
    if (Object.keys(newIntent).length > 0) {
      setIntent(prev => ({ ...prev, ...newIntent }))
      setShowFormCTA(true)
    }

    // Check if this is a form trigger suggestion
    if (isFormTrigger(content)) {
      goToForm(newIntent)
      return
    }

    setMessages(prev => [
      ...prev.map(m => ({ ...m, suggestions: undefined })),
      { role: 'user', content },
    ])
    setLoading(true)

    // ── Try quick answer with human-like typing delay ──
    const quick = quickMatch(content)
    if (quick) {
      const delay = typingDelay(quick.text)
      await new Promise(resolve => setTimeout(resolve, delay))
      // Detect intent
      const qi = detectIntent(content)
      if (Object.keys(qi).length > 0) {
        setIntent(prev => ({ ...prev, ...qi }))
        setShowFormCTA(true)
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: quick.text,
        suggestions: quick.suggestions,
      }])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:   content,
          sessionId,
          history:   messages.slice(-10).map(({ role, content }) => ({ role, content })),
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { text: string; suggestions: string[] }

      // Detect intent from AI response too
      const aiIntent = detectIntent(data.text)
      if (Object.keys(aiIntent).length > 0) {
        setIntent(prev => ({ ...prev, ...aiIntent }))
        setShowFormCTA(true)
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        suggestions: data.suggestions?.length ? data.suggestions : undefined,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ups, hubo un error. ¿Podés intentarlo de nuevo?',
      }])
    } finally {
      setLoading(false)
    }
  }

  const lastAssistantIdx = [...messages]
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.role === 'assistant')
    .at(-1)?.i ?? -1

  return (
    <>
      {/* ── Floating launcher ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => { setOpen(!open); setPulse(false) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
          className="relative flex items-center text-white transition-all duration-350 active:scale-95"
          style={{
            height:         '46px',
            borderRadius:   '23px',
            paddingLeft:    open ? '14px' : '14px',
            paddingRight:   open ? '14px' : '18px',
            gap:            '10px',
            background:     open
              ? 'rgba(6,10,28,0.92)'
              : 'rgba(8,6,20,0.82)',
            border:         open
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(108,99,255,0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow:      open
              ? '0 8px 32px rgba(0,0,0,0.45)'
              : hovered
                ? '0 8px 40px rgba(108,99,255,0.40), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 6px 28px rgba(108,99,255,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
            transform:      hovered && !open ? 'translateY(-2px)' : 'translateY(0)',
            transition:     'all 0.28s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Gradient glow layer behind */}
          {!open && (
            <div
              className="pointer-events-none absolute inset-0 rounded-[23px]"
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.18) 0%, rgba(168,85,247,0.10) 100%)',
                opacity: hovered ? 1 : 0.7,
                transition: 'opacity 0.25s ease',
              }}
            />
          )}

          {/* Ping ring on initial load */}
          {!open && pulse && (
            <span
              className="pointer-events-none absolute inset-0 animate-ping rounded-[23px] opacity-20"
              style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)', animationDuration: '1.8s' }}
            />
          )}

          {/* Icon */}
          <div
            className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: open
                ? 'rgba(255,255,255,0.07)'
                : 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)',
            }}
          >
            {open
              ? <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              : <BotIcon size={14} />
            }
          </div>

          {/* Label (hidden when open) */}
          {!open && (
            <span className="relative z-10 text-[13px] font-medium tracking-tight text-white/90 whitespace-nowrap">
              Asistente con IA
            </span>
          )}

          {/* Status dot */}
          {!open && (
            <span className="relative z-10 flex h-2 w-2 shrink-0">
              {pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
          )}
        </button>
      </div>

      {/* ── Chat panel ── */}
      <div
        className="fixed bottom-[88px] right-3 sm:right-6 z-50 flex flex-col overflow-hidden rounded-[24px] shadow-2xl w-[calc(100vw-24px)] max-w-[400px]"
        style={{
          maxHeight:      open ? 'min(620px, calc(100dvh - 160px))' : 0,
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'auto' : 'none',
          transform:      open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition:     'max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, transform 0.35s ease',
          border:         '1px solid rgba(255,255,255,0.07)',
          background:     'rgba(6,10,28,0.96)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 py-4 overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(168,85,247,0.15) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }} />
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)' }}>
            <BotIcon size={18} spinning={loading} />
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white tracking-tight">Asistente Digital</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[11px] text-white/40 font-medium tracking-wide">Simplemente · IA activa</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.05] text-white/40 transition-colors hover:bg-white/[0.10] hover:text-white/80">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ maxHeight: 360, scrollbarWidth: 'none' }}>
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-violet-300"
                    style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)' }}>
                    <BotIcon size={13} />
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] border border-white/[0.09]">
                    <User className="h-3.5 w-3.5 text-white/50" />
                  </div>
                )}
                <div className="max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)', color: '#fff', borderRadius: '18px 4px 18px 18px' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderRadius: '4px 18px 18px 18px' }
                  }
                >
                  {msg.content}
                </div>
              </div>

              {/* Quick reply chips */}
              {msg.role === 'assistant' && i === lastAssistantIdx && !loading && msg.suggestions?.length ? (
                <div className="ml-9 flex flex-wrap gap-1.5">
                  {msg.suggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3 py-1 text-[11px] font-semibold text-violet-300 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-500/[0.16] hover:text-violet-200">
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-violet-300"
                style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.2)' }}>
                <BotIcon size={13} spinning />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 18px 18px 18px' }}>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/60 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/60 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/60 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Form CTA banner ── */}
        {showFormCTA && (
          <div className="mx-3 mb-3 rounded-xl overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.18) 0%, rgba(168,85,247,0.12) 100%)', border: '1px solid rgba(108,99,255,0.25)' }}>
            <button onClick={() => goToForm()}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left group">
              <div>
                <p className="text-[12px] font-bold text-white/90">
                  {intent.planLabel ? `¿Te interesa el ${intent.planLabel}?` : '¿Listo para empezar?'}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">Completá el formulario — te respondemos en 24hs</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)' }}>
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 350)}
            placeholder="Escribí tu consulta..."
            disabled={loading}
            inputMode="text"
            autoComplete="off"
            style={{ fontSize: '16px' }}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-violet-500/40 focus:bg-white/[0.07]"
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)' }}>
            <Send className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-5 py-2 flex items-center justify-center gap-1.5 shrink-0">
          <span className="text-violet-400/50"><BotIcon size={10} /></span>
          <p className="text-[10px] text-white/20 font-medium tracking-wide">
            Respuestas generadas con IA · Simplemente
          </p>
        </div>
      </div>
    </>
  )
}
