# Analisis tecnico de performance

Caso: el modulo de agendamientos del dia tarda entre 6 y 10 segundos en cargar.

1. Reproducir el problema con datos concretos.
   Pediria usuario, sede, rango horario, navegador, hora del reporte y una captura de la pestaña Network. Primero confirmaria si ocurre siempre, solo en horas pico, solo en una sede o solo con algunos usuarios.

2. Medir tiempos extremo a extremo.
   En frontend revisaria Web Vitals, Network y Performance del navegador. Separaria tiempo de DNS/TLS, espera del backend, descarga, parsing/render y llamadas repetidas.

3. Revisar trazas y logs del backend.
   Agregaria logs temporales con request id para medir entrada, autenticacion, consultas, serializacion y salida. Asi sabria si los 6-10 segundos se consumen en backend o fuera de el.

4. Analizar las consultas SQL.
   Activaria logging de queries o usaria herramientas de PostgreSQL como `EXPLAIN ANALYZE`, `pg_stat_statements` y slow query log. Buscaria queries sin indices, joins costosos, filtros por fecha mal usados o lecturas secuenciales grandes.

5. Detectar N+1 y exceso de datos.
   Revisaria si por cada agendamiento se consultan estudiante, asesor, sede o pagos en consultas separadas. Tambien miraria si el endpoint trae columnas o relaciones que la pantalla no usa.

6. Revisar paginacion, filtros e indices.
   Confirmaria que la consulta filtre por fecha y sede de forma indexable, por ejemplo con indices compuestos sobre `fecha`, `sedeId` y `estado` si aplican. Si se trae todo el dia de todas las sedes y luego se filtra en JS, lo corregiria.

7. Descartar infraestructura.
   Miraria CPU, memoria, conexiones activas, pool de base de datos, locks, disco y latencia entre app y DB. Si el problema coincide con saturacion, lo trataria distinto a una query lenta.

8. Definir el cambio minimo y medir de nuevo.
   Solo despues de identificar el cuello de botella haria el cambio: indice, paginacion, query agregada, cache o ajuste de payload. Cerraria comparando tiempos antes/despues y dejando una metrica objetivo.
