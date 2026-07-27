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
    const ai = new GoogleGenerativeAI(apiKey)

    // 4. Define las instrucciones del sistema para guiar el comportamiento de la IA.
    const systemInstruction = `
Eres Cerebrito, un asistente de IA para la app "Aprende Contigo".
Tu ÚNICA función es clasificar la petición del usuario y responder en formato JSON. NO uses markdown (como \`\`\`json).

Si el usuario pide ir, ver o ser llevado a un contenido (lección, tema, etc.), usa este formato:
{"type": "navigate", "target": "nombre del contenido", "reply": "Un mensaje amigable confirmando la acción."}

Para todo lo demás (saludos, preguntas generales), usa este formato:
{"type": "text", "reply": "Tu respuesta normal de texto aquí."}
    `;

    // 5. Obtenemos el modelo usando el método recomendado, aplicando la instrucción del sistema
    // y forzando la salida a JSON.
    const model = ai.getGenerativeModel({
      model: "gemini-3.6-flash", // Se mantiene el modelo que solicitaste.
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 6. Genera la respuesta del chat usando solo el prompt del usuario.
    const result = await model.generateContent(prompt) // Solo el prompt del usuario, ya que systemInstruction se pasó al modelo.
    const response = await result.response
    const rawText = response.text()

    // 7. Intentamos parsear la respuesta de la IA para asegurarnos de que sea un JSON válido.
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawText);
    } catch (e) {
      // Si la IA falla en devolver JSON puro, lo empaquetamos manualmente como texto
      jsonResponse = { type: "text", reply: rawText || "Hola, no pude procesar bien la respuesta." };
    }

    // 8. Devolver la respuesta al cliente.
    return new Response(JSON.stringify(jsonResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    // En caso de error, devuelve un mensaje más detallado.
    console.error('Error en la función chat-gemini:', error) // Log para debugging en Supabase
    const details = error instanceof Error ? error.message : 'Error desconocido.';
    return new Response(JSON.stringify({
      type: "text",
      reply: 'Ocurrió un error al procesar tu solicitud.',
      details: details,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Devolvemos 200 para que el frontend pueda leer el mensaje de error amablemente
    })
  }
})
