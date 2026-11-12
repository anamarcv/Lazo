# Protocolo Clínico y Reglas del Sistema — LAZO V1

Este documento sintetiza las reglas operativas, de triage y seguridad clínica integradas en el portal de LAZO V1 para pacientes con Diabetes Mellitus Tipo 2 (DM2).

---

## 1. Clasificación de Triage y Semaforización

| Nivel de Triage | Criterios Clínicos | Acción del Sistema | Tiempo de Respuesta | Color en Interfaz |
| :--- | :--- | :--- | :--- | :--- |
| **Emergencia Médica** | Glucosa capilar >300 mg/dL con síntomas cardinales (náusea, vómito, dolor abdominal) o hipoglucemia severa (<54 mg/dL con alteración del estado de alerta). | Notificación inmediata al médico, banner rojo de advertencia, recomendación de derivación a urgencias. | Inmediato (< 2 horas) | **Rojo clínico (`#DC2626`)** — Reservado exclusivamente para este nivel |
| **Valoración Prioritaria** | Glucosa persistentemente fuera de rango (>200 o <70 mg/dL), síntomas nuevos de microangiopatía (visión borrosa, ardor en pies, lesiones plantares), o barreras económicas reportadas. | Alerta ámbar en dashboard, sugerencia de adelantar cita médica o llamada de orientación. | 24 - 48 horas | **Ámbar / Naranja (`#D97706` / `#F59E0B`)** |
| **Seguimiento de Contacto** | 2 o más intentos consecutivos de llamada telefónica no contestados o buzón de voz. | Módulo separado de contacto para trabajo social o enfermería (no se confunde con emergencia clínica). | 72 horas | **Gris / Slate (`#64748B`)** |
| **Seguimiento de Rutina** | Glucosas en meta, adherencia farmacológica confirmada, ausencia de síntomas de alarma. | Registro pasivo en expediente, cálculo de tendencias longitudinales. | Próxima consulta programada | **Verde nórdico (`#0D4744` / `#059669`)** |

---

## 2. Principios de Seguridad e Inteligencia Artificial (NLU)

1. **La IA NO diagnostica:** Las llamadas telefónicas automatizadas utilizan IA (Procesamiento de Lenguaje Natural) únicamente para clasificar y estructurar las respuestas libres del paciente (ej. transcribir *"no me he tomado la pastilla porque se me acabó el dinero"* a la etiqueta `Barrera económica: Falta de recursos para surtir medicamento`).
2. **La IA NO altera prescripciones:** Ningún cambio de dosis, fármaco o intervalo puede ser ejecutado por el sistema automatizado. Todos los cambios requieren firma y validación médica en consulta.
3. **Auditabilidad y Transparencia ("Ver Fuente"):** Toda afirmación o métrica presentada en el portal cuenta con un enlace a la fuente original (audio y transcripción literal de la llamada) para que el médico pueda verificar la precisión de la inferencia.
4. **Respeto a la No-Respuesta:** Una llamada no contestada o una respuesta ambigua nunca se interpreta como "paciente asintomático" ni como "adherencia adecuada".

---

## 3. Normatividad Aplicable en México

- **NOM-004-SSA3-2012:** Del expediente clínico (estructura de notas médicas, historial y antecedentes).
- **NOM-024-SSA3-2012:** Sistemas de información de registro electrónico para la salud (interoperabilidad y trazabilidad).
- **NOM-015-SSA2-2010:** Para la prevención, tratamiento y control de la diabetes mellitus.
