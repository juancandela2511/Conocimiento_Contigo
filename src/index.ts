import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define los encabezados CORS para permitir solicitudes desde tu app local y otros orígenes.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para producción, cámbialo a tu dominio: 'https://tu-app.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Esta parte es crucial. Responde a la solicitud "preflight" OPTIONS del navegador.
  // El navegador envía esta solicitud antes del POST para preguntar si tiene permiso.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extrae la pregunta del usuario.
    const { prompt } = await req.json()
    
    // --- INICIO DE TU LÓGICA PARA LLAMAR A GEMINI ---
    // (Aquí es donde usas tu API Key de Gemini para obtener una respuesta)
    // Ejemplo:
    // const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    // ...lógica para llamar a la API de Gemini...
    
    // **REEMPLAZA ESTA LÍNEA con tu lógica real para hablar con la IA**
    const replyFromGemini = `Esta es una respuesta simulada para tu pregunta: "${prompt}"`;
    // --- FIN DE TU LÓGICA ---

    return new Response(
      JSON.stringify({ reply: replyFromGemini }),
      {
        // Añade los encabezados CORS a la respuesta final para que la solicitud POST también sea aceptada.
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})