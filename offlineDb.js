/*
  Archivo: offlineDb.js
  Función: Configura y exporta la base de datos local (IndexedDB) usando Dexie.
  Tipo: Servicio de Frontend.
*/
import Dexie from 'dexie';

export const db = new Dexie('AprendeContigoDB');

db.version(1).stores({
  // Definimos las "tablas" de nuestra base de datos local.
  // 'id' es la clave primaria.
  // '++id' para autoincremento.
  // '&id' para clave primaria única.
  cursos: '&id, curso', // Clave primaria 'id', indexamos 'curso' para búsquedas.
  contenidos: '&id, curso_id, titulo', // Clave primaria 'id', indexamos 'curso_id' y 'titulo'.
  contenido_completado: '[user_id+contenido_id]', // Clave primaria compuesta.
  
  // Cola para acciones pendientes de sincronización.
  syncQueue: '++id' 
});