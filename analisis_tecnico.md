# Analisis tecnico de performance

Caso: el modulo de agendamientos del dia tarda entre 6 y 10 segundos en cargar.

## Objetivo

No cambiaria codigo antes de medir. Primero separaria si el tiempo se pierde en frontend, backend, base de datos, red o infraestructura. El resultado esperado de la investigacion seria una evidencia clara del cuello de botella y una medicion antes/despues.

## Pasos de diagnostico

1. Reproducir el problema con datos concretos.
   Pediria usuario, sede, rango horario, navegador, hora del reporte, cantidad aproximada de registros y captura de Network. Confirmaria si ocurre siempre, solo en horas pico, solo en una sede o solo con algunos usuarios.

2. Medir tiempos en el navegador.
   Revisaria Network y Performance para separar DNS/TLS, espera del backend, descarga, parsing de JSON, render de React y llamadas repetidas. Tambien verificaria si hay requests duplicadas o polling innecesario.

3. Correlacionar con logs del backend.
   Agregaria logs temporales con request id para medir entrada, autenticacion, servicio, consultas, serializacion y salida. Asi sabria si los 6-10 segundos se consumen dentro del backend o fuera de el.

4. Analizar consultas SQL.
   Activaria logging de queries o usaria `EXPLAIN ANALYZE`, `pg_stat_statements` y slow query log. Buscaria lecturas secuenciales grandes, joins costosos, filtros no indexables, ordenamientos caros o locks.

5. Buscar N+1 y exceso de payload.
   Revisaria si por cada agendamiento se consultan estudiante, asesor, sede o pagos en consultas separadas. Tambien miraria si el endpoint trae columnas o relaciones que la pantalla no usa.

6. Revisar paginacion, filtros e indices.
   Confirmaria que la consulta filtre por fecha, sede y estado desde SQL, no en JavaScript. Si aplica, propondria indices compuestos sobre campos usados juntos en filtros y ordenamiento.

7. Descartar infraestructura.
   Miraria CPU, memoria, conexiones activas, pool de base de datos, locks, disco y latencia entre app y DB. Si el problema coincide con saturacion, lo trataria distinto a una query lenta.

8. Aplicar el cambio minimo y medir otra vez.
   Solo despues de identificar el cuello de botella haria el ajuste: indice, paginacion, query agregada, cache, reduccion de payload o cambio de render. Cerraria comparando tiempos antes/despues con una metrica objetivo.

## Informacion que pediria al equipo

- Usuario y rol afectado.
- Sede y hora aproximada del reporte.
- Tamano de datos esperado para ese dia.
- Captura de Network con duracion de cada request.
- Logs del backend para el mismo request.
- Si el problema empezo despues de un despliegue o carga masiva.

## Como descartaria causas comunes

- Frontend lento: backend responde rapido, pero el navegador tarda en renderizar o procesar una respuesta grande.
- Backend lento: el tiempo alto aparece como waiting/TTFB en Network y en logs del servidor.
- Query lenta: `EXPLAIN ANALYZE` muestra scans grandes, joins caros o falta de indices.
- N+1: muchos queries similares por cada item listado.
- Red: alta latencia o fallos intermitentes sin consumo alto en backend/DB.
- Infraestructura: CPU, memoria, pool de conexiones o locks saturados durante la ventana del problema.

