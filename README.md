# LAZO V1 — Portal Clínico de Monitoreo Remoto para Diabetes Tipo 2 (DM2)

LAZO es una plataforma de salud digital diseñada para acompañar a pacientes adultos con Diabetes Mellitus Tipo 2 (DM2) en el tiempo que transcurre entre sus consultas médicas habituales. 

El sistema realiza seguimiento automatizado mediante **llamadas telefónicas con audio de voz humana pregrabada y clasificación de lenguaje natural (NLU)**, detectando a tiempo síntomas cardinales, descompensaciones glucémicas, problemas de adherencia y barreras socioeconómicas.

Este repositorio contiene el **Portal Web del Médico (Médico de Atención Primaria)**, diseñado para optimizar el tiempo de consulta, priorizar pacientes en riesgo y proporcionar contexto clínico accionable y transparente.

---

## 🩺 Características Principales

1. **Dashboard de Triage Clínico Diferenciado:**
   - **Emergencias Médicas Inmediatas:** Módulo de máxima prioridad (rojo clínico `#DC2626`), activado únicamente por descompensaciones agudas graves (ej. glucosa >300 mg/dL con síntomas cardinales o hipoglucemia severa).
   - **Valoración Prioritaria:** Detección de síntomas tempranos (cambios visuales, úlceras o lesiones en pies) y barreras de adherencia para agendar consulta antes de la fecha programada.
   - **Seguimiento de Contacto:** Gestión de pacientes no localizables tras múltiples intentos (separando problemas operativos de emergencias médicas).
   - **Citas del Día:** Preparación rápida de consulta con acceso directo a resúmenes pre-consulta de 2 minutos.

2. **Expediente Clínico Digital Especializado (7 Pestañas):**
   - **Resumen:** Vista general de control glucémico, último contacto, alertas activas y próximas acciones sugeridas con navegación directa.
   - **Seguimiento:** Gráfica interactiva de glucosa capilar con filtros (*Todas*, *En ayunas*, *Posprandial*) y banda de meta personalizada, combinada con detección de síntomas y barreras socioeconómicas.
   - **Medicación:** 
     - *Tratamiento farmacológico actual*: Tabla detallada de fármacos prescritos, posología e indicación.
     - *Matriz semanal de adherencia*: Matriz lunes-domingo de tomas confirmadas, omitidas y justificaciones reportadas por llamada.
   - **Laboratorios:** Evolución longitudinal de HbA1c, función renal (eGFR, uACR) y perfil de lípidos, con botones para generar órdenes médicas.
   - **Antecedentes:** Comorbilidades, alergias, estilo de vida y antecedentes heredofamiliares con edición rápida.
   - **Llamadas y Ver Fuente:** Historial de llamadas automatizadas con reproductor de audio sincronizado, resumen clínico estructurado en 6 secciones y cajón lateral (*slide-out drawer*) para auditar la transcripción original contra la inferencia de la IA.
   - **Notas Médicas:** Línea de tiempo de notas de evolución (NOM-004-SSA3-2012) vinculadas a los contactos telefónicos.

3. **Operación de Llamadas y Telemetría:**
   - Monitoreo en tiempo real de llamadas programadas, contestadas, no contestadas e inconclusas, junto con análisis de causas técnicas y desglose etario.

4. **Calendario y Agenda Médica:**
   - Vistas de semana y mes para coordinar consultas presenciales y de telemedicina, con reprogramación y cancelación integrada.

5. **Reportes Poblacionales (Cohorte Pareada $n=98$):**
   - Análisis de efectividad clínica (reducción media de HbA1c de 8.9% a 7.6%), adherencia global (82%) y distribución de barreras para directores médicos y gestores de salud. Con exportación a PDF y CSV.

---

## 🎨 Sistema de Diseño ("Que Respire")

La interfaz sigue principios de diseño moderno y editorial inspirados en espacios clínicos escandinavos:
- **Lienzo suave y luminoso:** `#F8FAFC` y tarjetas en `#FFFFFF` con esquinas redondeadas generosas (`rounded-2xl` y `rounded-3xl`) y sombras sutiles.
- **Identidad:** Verde esmeralda profundo nórdico (`#0D4744`) con acentos salvia y menta (`#EBF5F3`, `#D8EDE9`).
- **Gobernanza del color rojo:** El color rojo `#DC2626` está **estrictamente reservado** para emergencias clínicas reales para prevenir la fatiga de alertas en el personal de salud.

---

## 📁 Estructura del Proyecto

```
lazo-web/
├── index.html                   # Plantilla HTML con tipografía Inter
├── package.json                 # Dependencias y scripts
├── vite.config.js               # Configuración del bundler Vite (puerto 3000)
├── tailwind.config.js           # Paleta de colores, sombras y radios personalizados
├── postcss.config.js            # PostCSS para Tailwind
├── src/
│   ├── main.jsx                 # Entrada React 18
│   ├── App.jsx                  # Estado global de sesión, navegación y layout
│   ├── index.css                # Directivas de Tailwind y estilos utilitarios
│   ├── components/
│   │   ├── common/
│   │   │   ├── ErrorBoundary.jsx       # Escudo de captura de errores en vistas
│   │   │   ├── NewAppointmentModal.jsx # Modal para agendar nuevas citas
│   │   │   └── NewNoteModal.jsx        # Modal para redactar notas clínicas (NOM-004)
│   │   └── layout/
│   │       ├── Sidebar.jsx             # Barra de navegación lateral con perfil y logout
│   │       └── Header.jsx              # Encabezado con banner de emergencia y dropdown de notificaciones
│   ├── data/
│   │   ├── mockPatients.js             # Expedientes clínicos completos de 4 perfiles arquetípicos
│   │   └── mockReports.js              # Métricas de telefonía y analítica poblacional
│   └── views/
│       ├── LoginView.jsx               # Pantalla de acceso editorial
│       ├── DashboardView.jsx           # Panel de control y triage de pacientes
│       ├── PatientsDirectoryView.jsx   # Directorio y búsqueda de pacientes con filtros
│       ├── CallOperationsView.jsx      # Métricas operativas del servicio de llamadas
│       ├── CalendarView.jsx            # Agenda médica interactiva
│       ├── PopulationReportsView.jsx   # Reportes de cohorte y exportación
│       ├── SettingsView.jsx            # Configuración de perfil y protocolo clínico
│       └── patient/
│           ├── PatientHeader.jsx       # Banner de paciente con alertas y selector de pestañas
│           ├── PatientDetailView.jsx   # Contenedor del expediente
│           └── tabs/                   # Las 7 pestañas clínicas del expediente
│               ├── TabResumen.jsx
│               ├── TabSeguimiento.jsx
│               ├── TabMedicacion.jsx
│               ├── TabLaboratorios.jsx
│               ├── TabAntecedentes.jsx
│               ├── TabLlamadas.jsx
│               └── TabNotas.jsx
```

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.0.0 o superior
- [npm](https://www.npmjs.com/) v9.0.0 o superior

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/anamarcv/Lazo.git
   cd Lazo
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador web.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

---

## 🔒 Cumplimiento Normativo y Seguridad

- **NOM-004-SSA3-2012:** Del expediente clínico.
- **NOM-024-SSA3-2012:** Sistemas de información de registro electrónico para la salud.
- **Protección de Datos Personales en Posesión de Sujetos Obligados/Particulares (LGPDPPSO / LFPDPPP):** En fases de producción, el sistema implementa cifrado en reposo (AES-256) y en tránsito (TLS 1.3), y anonimización de identificadores en analítica poblacional.
- **Gobernanza de IA Clínica:** La IA asiste y clasifica las respuestas del paciente para estructurarlas en el portal, pero **nunca diagnostica, no prescribe y no modifica tratamientos de forma autónoma**. Todas las decisiones terapéuticas corresponden al médico tratante.

---

## 👩‍⚕️ Equipo y Contacto

- **Proyecto:** LAZO
- **Repositorio:** [github.com/anamarcv/Lazo](https://github.com/anamarcv/Lazo)
