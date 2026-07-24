/*
  Archivo: sw.js
  Función: Service Worker personalizado con lógica de Background Sync.
  Tipo: Service Worker.
*/
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
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
  const supabase = createClient(
    'https://jioxqgprhcnbibopwquz.supabase.co', // Reemplaza con tu URL de Supabase
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppb3hxZ3ByaGNuYmlib3B3cXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0NzEwODgsImV4cCI6MjAzMzA0NzA4OH0.z-e-k2kYQ5AIw3iR5o7s5aA4r2tL5hrdyI2a2b0i3aY' // Reemplaza con tu Anon Key de Supabase
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