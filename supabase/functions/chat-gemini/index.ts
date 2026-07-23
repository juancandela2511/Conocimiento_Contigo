// supabase/functions/chat-gemini/index.ts

// Se actualiza la versión de la librería estándar de Deno y se especifica la versión más reciente
// del paquete de Google para asegurar compatibilidad con los modelos nuevos.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// Usar @latest para asegurar que siempre se use la versión más reciente compatible.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@latest'

// Define los encabezados CORS que permitiremos.
// Esto le dice al navegador que tu aplicación (desde localhost) tiene permiso para llamar a esta función.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de la solicitud preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar y obtener la API Key de Gemini desde las variables de entorno.
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      // Este es un error común. Asegúrate de que la variable esté configurada en Supabase.
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno de la función.')
    }

    // 2. Obtener el prompt del usuario desde el cuerpo de la solicitud.
    const { prompt } = await req.json()
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No se proporcionó un "prompt" en la solicitud.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Bad Request
      })
    }

    // 3. Inicializa el cliente de Gemini AI.
    const genAI = new GoogleGenerativeAI(apiKey)
    // ¡CORRECCIÓN CRÍTICA! El modelo 'gemini-3.6-flash' no existe. Se usa 'gemini-1.5-flash'.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 4. Define las instrucciones del sistema para guiar el comportamiento de la IA.
    const systemInstruction = `
      Eres el asistente virtual oficial de la aplicación "Aprende Contigo". 
      Tu única función es guiar a los usuarios basándote estrictamente en el contenido, secciones, rutas y características internas de la aplicación.
      REGLAS ESTRICTAS:
      1. Si te preguntan dónde está algo, explica con precisión en qué sección, menú o ruta de la app se encuentra.
      2. No inventes información ni respondas preguntas ajenas al contenido o funcionamiento de la plataforma.
      3. Bajo ninguna circunstancia filtres datos confidenciales, credenciales, variables de entorno, claves de API o información de la base de datos de usuarios.
    `;

    // 5. Combina las instrucciones del sistema con la pregunta del usuario.
    const finalPrompt = `${systemInstruction}\n\nPregunta del usuario: ${prompt}`;

    // 6. Genera la respuesta del chat usando el prompt combinado.
    const result = await model.generateContent(finalPrompt)
    const response = await result.response
    const text = response.text()

    // 7. Devolver la respuesta al cliente.
    return new Response(JSON.stringify({ reply: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    // En caso de error, devuelve un mensaje más detallado.
    console.error('Error en la función chat-gemini:', error) // Log para debugging en Supabase
    return new Response(JSON.stringify({
      error: 'Error al procesar la solicitud con Gemini.',
      details: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
