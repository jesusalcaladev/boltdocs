# ✅ Lista de Tareas: Mejora de Robustez y Seguridad en Boltdocs

A continuación se detallan las tareas específicas para fortalecer la seguridad del framework basadas en el análisis del código actual.

## 🔒 1. Validación de Entradas (Path Traversal)

- [x] **Implementar validación de longitud máxima de path**:
  - [x] Definir constante `MAX_PATH_LENGTH` (ej. 255).
  - [x] Agregar chequeo en `parseDocFile` para rechazar rutas que excedan el límite.
- [x] **Crear Whitelist de caracteres permitidos**:
  - [x] Definir regex `ALLOWED_PATH_CHARS` (`/^[a-zA-Z0-9\-_\/\.\(\)]+$/`).
  - [x] Rechazar rutas que contengan caracteres no permitidos (Unicode malicioso, null bytes extendidos).
- [x] **Sanitización de nombres de archivo**:
  - [x] Crear función `sanitizeFilename` para eliminar o reemplazar caracteres peligrosos antes de resolver la ruta.

## 🧹 2. Sanitización HTML Mejorada

- [x] **Configurar DOMPurify con políticas restrictivas**:
  - [x] Prohibir tags potencialmente peligrosos (`<script>`, `<iframe>`, `<object>`, `<embed>`).
  - [x] Deshabilitar atributos de eventos (`onclick`, `onerror`, etc.).
- [x] **Validar URLs en atributos `src` y `href`**:
  - [x] Implementar hook de DOMPurify para validar que las URLs apunten a dominios internos o seguros.
  - [x] Bloquear esquemas `javascript:` y `data:`.
- [x] **Sanitización en cabeceras (Headings)**:
  - [x] Asegurar que `sanitizeHtml` se aplica no solo al contenido del cuerpo sino también a los títulos extraídos para la Tabla de Contenidos.

## 🚨 3. Manejo de Errores de Seguridad Granular

- [x] **Crear clases de error específicas**:
  - [x] Definir `SecurityViolationError extends Error`.
  - [x] Definir `PathTraversalError extends SecurityViolationError`.
- [x] **Refactorizar `throw` statements**:
  - [x] Reemplazar `throw new Error(...)` con las nuevas clases específicas.
- [x] **Mejorar el Logging de Seguridad**:
  - [x] Registrar intentos de breach con timestamp, IP (si está disponible), y ruta solicitada.
  - [x] **Importante**: Omitir rutas absolutas del sistema en los mensajes de error devueltos al cliente para evitar fugas de información.

## 📄 4. Validación Estricta de Frontmatter

- [x] **Integrar validación de esquema con Zod**:
  - [x] Definir esquema `FrontmatterSchema` (validar `title`, `description`, `order`).
- [x] **Limitar tamaño de Frontmatter**:
  - [x] Establecer límite máximo (ej. `MAX_FRONTMATTER_SIZE = 10KB`).
  - [x] Rechazar el archivo si el YAML del frontmatter excede el límite.
- [x] **Sanitizar campos de metadatos**:
  - [x] Aplicar `sanitizeHtml` o escape de entidades a `title` y `description` si se renderizan en la UI.

## 🧪 5. Ampliación de Tests de Seguridad

- [x] **Tests de XSS**:
  - [x] Crear fixture de Markdown con payload XSS en cabeceras (`# <img src=x onerror=alert(1)>`).
  - [x] Verificar que la salida HTML esté limpia.
- [x] **Tests de Path Traversal con Unicode**:
  - [x] Probar rutas con `..%2F` y caracteres Unicode equivalentes a punto-punto.
- [x] **Tests de Fuzzing**:
  - [x] Agregar tests con caracteres de control (`\0`, `\n`, `\r`) en nombres de archivo.

## ⚙️ 6. Implementación de Configuración Centralizada

- [x] **Crear archivo `security.config.ts`**:
  - [x] Centralizar constantes `MAX_PATH_LENGTH`, `ALLOWED_PATH_CHARS`, y `MAX_FRONTMATTER_SIZE`.
  - [x] Exportar configuraciones para uso en `parser.ts` y `utils.ts`.

## 🛡️ 7. Cabeceras de Seguridad (HTTP Headers)

- [x] **Configuración de Headers**:
  - [x] Crear `packages/core/src/node/security/headers.ts` con política endurecida.
- [x] **Integración en el Plugin**:
  - [x] Implementar middleware en `boltdocsPlugin` para inyectar cabeceras.
  - [x] Asegurar aplicación condicional (`NODE_ENV === 'production'`).

- [x] **Opciones de Configuración**:
  - [x] Extender `BoltdocsConfig` con la propiedad `security`.
  - [x] Soportar personalización de headers y CSP en la configuración.

- [x] **Content Security Policy (CSP)**:
  - [x] Implementar generador de CSP en `packages/core/src/node/security/csp.ts`.
  - [x] Configurar directivas base (`self`, `unsafe-inline`, `data:`, `https:`).
  - [x] Implementar relajación automática de políticas en desarrollo (`unsafe-eval`).
  - [x] Integrar inyección de CSP en el middleware del plugin.

- [x] **Seguridad en Configuración de Vite**:
  - [x] Inyectar cabeceras y CSP en `server.headers` y `preview.headers` en `index.ts`.
  - [x] Asegurar persistencia y prioridad de sobreescrituras del usuario (`config.vite`).
- [x] **Verificación**:
  - [x] Crear suite de pruebas exhaustiva en `tests/security/headers.test.ts`.
  - [x] Validar comportamiento de CSP en desarrollo vs producción.
  - [x] Verificar cumplimiento de cabeceras requeridas.

## 7. Validación de Configuración
El archivo `boltdocs.config.ts` ahora cuenta con validación estricta en tiempo de ejecución:
- [x] Schema validation con Zod para toda la configuración.
- [x] Documentación completa del sistema de seguridad (Security Configuration).
- [x] Validación de URLs (siteUrl, social links, community help) y dominios.
- [x] Verificación de paths absolutos y sanitización en `resolveConfig`.
- [x] Validación de plugins (estructura básica) y dependencias.
- [x] Robustez en el Merge de configuración: Se valida el objeto final tras la mezcla.
- [x] Validación de tipos runtime: Todos los campos tienen tipos validados por Zod.
- [x] Prevención de configuración inválida: El servidor falla tempranamente con mensajes claros si hay errores en el config.

## 8. Arquitectura de Plugins Segura
El sistema de plugins actual es flexible pero vulnerable:
- [x] Sandboxing de plugins con permisos restringidos
- [x] Validación de plugins antes de carga
- [x] Sistema de versionado y compatibilidad
- [x] Aislamiento de errores de plugins
- [x] Hooks del ciclo de vida: Agregados `beforeBuild`, `afterBuild`, `beforeDev`, `afterDev`, `configResolved`, `buildEnd`.
- [x] Inyección de dependencias: Los plugins pueden compartir estado a través del `Shared Store` de forma namespaced.

## 9. Exports del Cliente

- [x] Exports fragmentados: Hay demasiados puntos de entrada (`/client`, `/hooks`, `/primitives`, etc.)
- [x] Tree-shaking ineficiente: La estructura actual no permite tree-shaking óptimo
- [x] Dependencias circulares: Algunos imports pueden crear dependencias circulares

## 10. Caché Incremental Inteligente

El SSG actualmente no tiene caché entre builds. Implementaría un sistema persistente que:

- [ ] Almacene hashes de contenido MDX y dependencias
- [ ] Sin caché distribuida: En equipos, el caché no se comparte entre desarrolladores
- [ ] Memoria leaks: El caché en memoria no se limpia correctamente en desarrollo
- [ ] Reutilice HTML generado para páginas sin cambios
- [ ] Reduzca tiempos de build en hasta 90% para cambios parciales

## 10.5 Manejo de Errores

- [ ] Error boundaries limitados: Solo hay un ErrorBoundary genérico en el layout
- [ ] Sin recuperación automática: Los errores en MDX no tienen mecanismo de retry
- [ ] Logging insuficiente: Los errores de compilación no se registran con suficiente contexto

## 10.1 Streaming de HTML

En lugar de generar todo en memoria con `Promise.all` , implementaría streaming:

- [ ] Reduciría consumo de RAM en sitios grandes
- [ ] Permitiría inicio más rápido del proceso de build
- [ ] Escalaría mejor con miles de páginas

## 10.2 Análisis de Dependencias

El mock actual `fakeModules` es demasiado simple. Implementaría:

- [ ] Detección automática de dependencias reales
- [ ] Bundle splitting inteligente
- [ ] Precarga de componentes compartidos

## 10.3 Mejor Manejo de Virtual Modules

El "require hijack" actual es frágil. Implementaría:

- [ ] Un sistema de resolución de módulos más robusto
- [ ] Soporte para módulos ES nativos
- [ ] Mejor integración con el ecosistema Vite

## 11. Mejoras de SEO y Accesibilidad

## 11.1 Metadatos Enriquecidos

Extendería el sistema actual:

- [ ] Open Graph automático basado en contenido
- [ ] JSON-LD para breadcrumbs y estructura
- [ ] Imágenes OG generadas automáticamente

## 11.2 Optimización de Core Web Vitals

- [ ] Critical CSS inline por página
- [ ] Lazy loading de imágenes con placeholders
- [ ] Preload de recursos críticos

## 12. File-System Routing
- [ ] Recálculo de rutas: Las rutas se regeneran completamente en cada cambio
- [ ] Sin lazy loading avanzado: El lazy loading actual es básico y no soporta prefetching
- [ ] State management: El store global podría optimizarse con Zustand
- [ ] Chunking Adaptativo: El sistema actual usa un CHUNK_SIZE fijo de 50 archivos. Implementaría un chunking adaptativo basado en el tamaño de los archivos y la memoria disponible:

```tsx
// En lugar de CHUNK_SIZE = 50
const CHUNK_SIZE = Math.max(10, Math.min(100, Math.floor(os.totalmem() / 1024 / 1024 / 10)))
```
- [ ] Cache Inteligente por Dependencias: El cache actual solo valida por mtime. Añadiría detección de dependencias entre archivos para invalidación en cascada.
- [ ] Validación Estructurada: El parser actual valida seguridad básica. Implementaría validación de estructura con schema:

```tsx
// Nuevo: validador de estructura de rutas
const routeSchema = z.object({
  title: z.string().min(1),
  groupTitle: z.string().optional(),
  sidebarPosition: z.number().int().min(0).optional()
    // otras propiedades
})
```

- [ ] Hot Reload Granular: El HMR actual regenera todas las rutas. Implementaría actualizaciones incrementales:

```tsx
// Solo regenerar rutas afectadas
const affectedFiles = getAffectedFiles(changedFile, dependencyGraph)
const newRoutes = await generateAffectedRoutes(affectedFiles)
```

- [ ] Debug Mode: Añadiría modo debug con visualización del pipeline de routing:

- [ ] Rutas Virtuales: Permitir definir rutas que no existen físicamente pero se generan programáticamente:

```mdx
---
virtual: true
generator: "api-reference"
params:
  version: "v2"
---
```

- [ ] Alias de Rutas: Extender el sistema de permalinks para soportar múltiples alias:

```mdx
---
aliases:
  - "/old-path"
  - "/legacy/docs"
---
```

- [ ] Validación de Enlaces Rotos: Implementar validación de enlaces internos durante la generación de rutas.