# 📊 Arquitectura de Contenido y Base de Datos (Sitio Completo CNI)

**Fuente:** Nueva reestructuración estratégica oficial del CNI.
**Propósito:** Contexto absoluto para el agente de IA. DEBES usar esta estructura exacta para crear el enrutamiento (App Router) y los menús de navegación.

---

## 1. COMPONENTES GLOBALES (Navegación y Estructura)

### 1.1 Navbar (Navegación Dual)
El sitio utiliza una navegación de dos niveles (Top Bar + Main Nav):

**A. Menú Secundario (Top Bar - Barra superior pequeña):**
* Sala de Prensa (Ruta: `/prensa`)
* Asesoría Gratuita (Ruta: `/asesoria`)
* Trámites en Línea (Ruta: `/tramites`)

**B. Menú Principal (Main Navbar):**
* **Home** (Ruta: `/`)
* **Invertir en Honduras** (Dropdown)
    * Sectores de Inversión (Agroindustria, Manufactura, Turismo, Energía, BPO)
* **Crecer en Honduras** (Dropdown)
    * Portafolio de Inversiones
    * Casos de Éxito
    * Portal Digital de Inversiones (Link externo: `https://pdihonduras.gob.hn`)
* **Vivir en Honduras** (Ruta: `/vivir`)
* **CNI** (Dropdown)
    * Servicios Legales
    * Servicios Técnicos
    * Inteligencia de Datos
* **Recursos** (Ruta: `/recursos`)

### 1.2 Footer (Pie de Página)
* **Columna 1 (Identidad):** Logo CNI. Texto: "Promoviendo y protegiendo la Inversión Extranjera Directa en la República de Honduras."
* **Columna 2 (Institucional):** El CNI, Servicios Legales, Inteligencia de Datos.
* **Columna 3 (Recursos):** Sala de Prensa, Trámites en Línea, Portal Digital de Inversiones.
* **Columna 4 (Contacto):** Centro Cívico Gubernamental (CCG), Torre 1, Piso 12. Tegucigalpa, Honduras. Email: info@cni.hn

---

## 2. MAPA DE PÁGINAS Y CONTENIDO (Enrutamiento Next.js)

### PÁGINA: INICIO (`/`)
* **Hero Section:** Video de fondo. Título: "Invierte, Crece y Vive en Honduras".
* **Secciones:** Estadísticas Macro, Teaser de Sectores, Mapa Geoespacial interactivo.

### PÁGINA: INVERTIR EN HONDURAS (`/invertir`)
* **Sectores Estratégicos:**
    1. *Agroindustria Premium:* Clima fértil los 365 días. Café, cacao, tabaco.
    2. *Manufactura y Textil:* Liderazgo en nearshoring, beneficios 'Zero-Duty' hacia EE.UU.
    3. *Turismo Sustentable:* Islas de la Bahía, arrecifes y arqueología Maya.
    4. *Energía Renovable:* Matriz 60% limpia. Proyectos solares, eólicos e hidroeléctricos.
    5. *BPO / Call Centers:* Talento joven y bilingüe de alto rendimiento.

### PÁGINA: CRECER EN HONDURAS (`/crecer`)
* **Portafolio de Inversiones:** Catálogo de proyectos "Ready to Invest" con datos de CAPEX y ubicación.
* **Casos de Éxito:** Testimonios de multinacionales operando exitosamente en el país.

### PÁGINA: VIVIR EN HONDURAS (`/vivir`)
* **Contenido:** Calidad de vida, infraestructura de salud, educación bilingüe internacional, seguridad y zonas residenciales de alto valor para ejecutivos expatriados. Beneficios demográficos y culturales.

### PÁGINA: CNI (`/cni`)
* **Servicios Legales:** Asesoría sobre la Ley de Promoción de Inversiones (LPPI), Zonas Libres (ZOLI) y estructuración corporativa.
* **Servicios Técnicos:** Acompañamiento en permisos ambientales, aduanas y trámites operativos.
* **Inteligencia de Datos:** Provisión de estudios de pre-factibilidad, costos energéticos, salarios y análisis logístico.

### PÁGINA: RECURSOS (`/recursos`)
* **Descargas:** Guía del Inversionista (Honduras Investment Guide), Boletines Estadísticos, Leyes y Normativas en formato PDF.

### PÁGINAS SECUNDARIAS (Top Bar)
* **Sala de Prensa (`/prensa`):** Noticias institucionales, eventos y comunicados oficiales.
* **Asesoría Gratuita (`/asesoria`):** Formulario de contacto directo con ejecutivos del CNI.