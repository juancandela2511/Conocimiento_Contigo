/*
  Archivo: sw.js
  Función: Service Worker personalizado con lógica de Background Sync.
  Tipo: Service Worker.
*/
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import Dexie from 'dexie';

// Workbox se encargará de cachear el App Shell.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Configuración de la base de datos Dexie DENTRO del Service Worker.
const db = new Dexie('AprendeContigoDB');
db.version(1).stores({
  cursos: '&id, curso',
  contenidos: '&id, curso_id, titulo',
  contenido_completado: '[user_id+contenido_id]',
  syncQueue: '++id'
});

// Función para procesar la cola de sincronización.
const processSyncQueue = async () => {
  // Importamos Supabase aquí porque no está disponible globalmente en el worker.
  const { createClient } = await import('@supabase/supabase-js');
  
  // ¡IMPORTANTE! Usa las variables de entorno de tu proyecto.
  const supabase = createClient(
    'https://nozxiujeohrhyhefsedw.supabase.co', // URL correcta de tu proyecto
    'TU_SUPABASE_ANON_KEY' // REEMPLAZA ESTO con tu Anon Key de Supabase
  );

  const pendingActions = await db.syncQueue.toArray();
  if (pendingActions.length === 0) {
    console.log('Cola de sincronización vacía.');
    return;
  }

  console.log(`Procesando ${pendingActions.length} acciones pendientes...`);

  for (const action of pendingActions) {
    if (action.type === 'complete_content') {
      const { error } = await supabase.from('contenido_completado').upsert(action.payload);
      if (!error) {
        await db.syncQueue.delete(action.id); // Elimina la acción si fue exitosa
      } else {
        console.error('Fallo al sincronizar acción:', error);
      }
    }
  }
};

// Escuchamos el evento 'sync' que el navegador dispara cuando hay conexión.
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(processSyncQueue());
  }
});