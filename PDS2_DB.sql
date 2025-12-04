-- =========================================================
-- 1) Crear base de datos (ajusta el nombre si quieres)
-- =========================================================
CREATE DATABASE sga_pds2
  WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_MX.utf8'
    LC_CTYPE = 'es_MX.utf8'
    TEMPLATE = template0;

-- Conectarse a la nueva BD (en psql)
\c sga_pds2

-- =========================================================
-- 2) Extensiones necesarias
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- para crypt() y gen_salt()

-- =========================================================
-- 3) Tipos ENUM usados en la BD
--  (Ajusta los valores según tu modelo real)
-- =========================================================

CREATE TYPE estado_academico AS ENUM (
  'ACTIVO',
  'BAJA',
  'EGRESADO',
  'SUSPENDIDO'
);

CREATE TYPE estatus_inscripcion AS ENUM (
  'INSCRITO',
  'BAJA',
  'PREINSCRITO'
);

CREATE TYPE tipo_materia AS ENUM (
  'OBLIGATORIA',
  'OPTATIVA',
  'LIBRE'
);

CREATE TYPE rol_docente AS ENUM (
  'TITULAR',
  'CO_TITULAR',
  'AYUDANTE'
);

CREATE TYPE severidad AS ENUM (
  'INFO',
  'WARN',
  'ERROR',
  'CRITICO'
);

-- =========================================================
-- 4) Secuencias
-- =========================================================

CREATE SEQUENCE public.alumno_id_seq;
CREATE SEQUENCE public.alumno_grupo_id_seq;
CREATE SEQUENCE public.archivo_cargado_id_seq;
CREATE SEQUENCE public.asignacion_profesor_id_seq;
CREATE SEQUENCE public.auditoria_cargas_id_seq;
CREATE SEQUENCE public.calificacion_id_seq;
CREATE SEQUENCE public.grupo_id_seq;
CREATE SEQUENCE public.horario_id_seq;
CREATE SEQUENCE public.incidencia_id_seq;
CREATE SEQUENCE public.inscripcion_id_seq;
CREATE SEQUENCE public.kardex_id_seq;
CREATE SEQUENCE public.materia_id_seq;
CREATE SEQUENCE public.migrations_id_seq;
CREATE SEQUENCE public.optativa_progreso_id_seq;
CREATE SEQUENCE public.periodo_id_seq;
CREATE SEQUENCE public.plan_estudio_id_seq;
CREATE SEQUENCE public.profesor_id_seq;
CREATE SEQUENCE public.sancion_id_seq;
CREATE SEQUENCE public.usuario_id_seq;
CREATE SEQUENCE public.validacion_resultado_id_seq;

-- =========================================================
-- 5) Tablas base sin FKs “hacia adelante”
--    (ordenado para minimizar problemas de dependencias)
-- =========================================================

CREATE TABLE public.usuario (
  id integer NOT NULL DEFAULT nextval('usuario_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);

CREATE TABLE public.rol (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT rol_pkey PRIMARY KEY (id)
);

CREATE TABLE public.plan_estudio (
  id integer NOT NULL DEFAULT nextval('plan_estudio_id_seq'::regclass),
  nombre character varying NOT NULL,
  version character varying NOT NULL,
  total_creditos integer NOT NULL,
  semestres_sugeridos integer NOT NULL,
  creditos_servicio integer,
  creditos_practicas integer,
  CONSTRAINT plan_estudio_pkey PRIMARY KEY (id)
);

CREATE TABLE public.periodo (
  id integer NOT NULL DEFAULT nextval('periodo_id_seq'::regclass),
  anio integer NOT NULL,
  ciclo integer NOT NULL,
  etiqueta character varying NOT NULL UNIQUE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  CONSTRAINT periodo_pkey PRIMARY KEY (id)
);

CREATE TABLE public.materia (
  id integer NOT NULL DEFAULT nextval('materia_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  creditos integer NOT NULL,
  tipo tipo_materia NOT NULL DEFAULT 'OBLIGATORIA'::tipo_materia,
  plan_estudio_id integer NOT NULL,
  CONSTRAINT materia_pkey PRIMARY KEY (id),
  CONSTRAINT materia_plan_estudio_id_fkey FOREIGN KEY (plan_estudio_id) REFERENCES public.plan_estudio(id)
);

CREATE TABLE public.archivo_cargado (
  id integer NOT NULL DEFAULT nextval('archivo_cargado_id_seq'::regclass),
  tipo character varying NOT NULL,
  nombre_archivo character varying NOT NULL,
  hash character varying NOT NULL,
  usuario character varying NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  estado_proceso character varying NOT NULL DEFAULT 'PENDIENTE'::character varying CHECK (
    estado_proceso::text = ANY (
      ARRAY[
        'PENDIENTE'::character varying,
        'COMPLETADO'::character varying,
        'ERROR'::character varying,
        'CANCELADO'::character varying
      ]::text[]
    )
  ),
  stored_name text,
  mime_type text,
  size_bytes bigint,
  storage_path text,
  expediente text,
  CONSTRAINT archivo_cargado_pkey PRIMARY KEY (id)
);

CREATE TABLE public.migrations (
  id integer NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
  timestamp bigint NOT NULL,
  name character varying NOT NULL,
  CONSTRAINT migrations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.codigos_verificacion (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying NOT NULL,
  codigo character varying NOT NULL,
  tipo character varying NOT NULL,
  expira_en timestamp with time zone NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT codigos_verificacion_pkey PRIMARY KEY (id)
);

-- =========================================================
-- 6) Tablas que dependen de las anteriores
-- =========================================================

CREATE TABLE public.alumno (
  id integer NOT NULL DEFAULT nextval('alumno_id_seq'::regclass),
  matricula character varying NOT NULL UNIQUE,
  expediente character varying,
  nombre character varying NOT NULL,
  apellido_paterno character varying NOT NULL,
  apellido_materno character varying,
  correo character varying,
  estado_academico estado_academico NOT NULL DEFAULT 'ACTIVO'::estado_academico,
  nivel_ingles_actual character varying,
  plan_estudio_id integer NOT NULL,
  total_creditos integer NOT NULL DEFAULT 0,
  sexo character varying,
  fecha_nacimiento date,
  tipo_alumno character varying,
  promedio_general numeric,
  promedio_periodo numeric,
  usuario_id integer,
  materias_aprobadas smallint DEFAULT '0'::smallint,
  materias_reprobadas smallint DEFAULT '0'::smallint,
  periodo_inicio integer,
  acta_examen_profesional text,
  constancia_exencion_examen_profesional text,
  fecha_titulacion date DEFAULT '0001-01-01'::date,
  creditos_culturest real DEFAULT '0'::real,
  creditos_deportes smallint DEFAULT '0'::smallint,
  CONSTRAINT alumno_pkey PRIMARY KEY (id),
  CONSTRAINT alumno_plan_estudio_id_fkey FOREIGN KEY (plan_estudio_id) REFERENCES public.plan_estudio(id),
  CONSTRAINT alumno_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);

CREATE TABLE public.profesor (
  id integer NOT NULL DEFAULT nextval('profesor_id_seq'::regclass),
  nombre character varying NOT NULL,
  apellido_paterno character varying NOT NULL,
  apellido_materno character varying,
  correo character varying NOT NULL,
  num_empleado integer NOT NULL UNIQUE,
  usuario_id integer NOT NULL,
  CONSTRAINT profesor_pkey PRIMARY KEY (id),
  CONSTRAINT profesor_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);

CREATE TABLE public.grupo (
  id integer NOT NULL DEFAULT nextval('grupo_id_seq'::regclass),
  materia_id integer NOT NULL,
  periodo_id integer NOT NULL,
  clave_grupo character varying NOT NULL,
  cupo integer NOT NULL,
  CONSTRAINT grupo_pkey PRIMARY KEY (id),
  CONSTRAINT grupo_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materia(id),
  CONSTRAINT grupo_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo(id)
);

CREATE TABLE public.horario (
  id integer NOT NULL DEFAULT nextval('horario_id_seq'::regclass),
  grupo_id integer NOT NULL,
  dia_semana integer NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  aula character varying NOT NULL,
  CONSTRAINT horario_pkey PRIMARY KEY (id),
  CONSTRAINT horario_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupo(id)
);

CREATE TABLE public.asignacion_profesor (
  id integer NOT NULL DEFAULT nextval('asignacion_profesor_id_seq'::regclass),
  grupo_id integer NOT NULL,
  profesor_id integer NOT NULL,
  rol_docente rol_docente NOT NULL DEFAULT 'TITULAR'::rol_docente,
  CONSTRAINT asignacion_profesor_pkey PRIMARY KEY (id),
  CONSTRAINT asignacion_profesor_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupo(id),
  CONSTRAINT asignacion_profesor_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesor(id)
);

CREATE TABLE public.alumno_grupo (
  id integer NOT NULL DEFAULT nextval('alumno_grupo_id_seq'::regclass),
  alumno_id integer NOT NULL,
  grupo_id integer NOT NULL,
  archivo_id integer,
  fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
  fuente character varying NOT NULL DEFAULT 'LISTA_ASISTENCIA'::character varying,
  CONSTRAINT alumno_grupo_pkey PRIMARY KEY (id),
  CONSTRAINT alumno_grupo_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id),
  CONSTRAINT alumno_grupo_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupo(id),
  CONSTRAINT alumno_grupo_archivo_id_fkey FOREIGN KEY (archivo_id) REFERENCES public.archivo_cargado(id)
);

CREATE TABLE public.auditoria_cargas (
  id integer NOT NULL DEFAULT nextval('auditoria_cargas_id_seq'::regclass),
  archivo_id integer NOT NULL,
  etapa character varying NOT NULL CHECK (
    upper(TRIM(BOTH FROM etapa)) = ANY (
      ARRAY['UPLOAD','PARSE','VALIDACION','INGESTA','POST_INGESTA']
    )
  ),
  estado character varying NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  detalle text,
  CONSTRAINT auditoria_cargas_pkey PRIMARY KEY (id),
  CONSTRAINT auditoria_cargas_archivo_id_fkey FOREIGN KEY (archivo_id) REFERENCES public.archivo_cargado(id)
);

CREATE TABLE public.validacion_resultado (
  id integer NOT NULL DEFAULT nextval('validacion_resultado_id_seq'::regclass),
  archivo_id integer NOT NULL,
  severidad severidad NOT NULL DEFAULT 'INFO'::severidad,
  regla_codigo character varying NOT NULL,
  descripcion text NOT NULL,
  fila_origen character varying,
  CONSTRAINT validacion_resultado_pkey PRIMARY KEY (id),
  CONSTRAINT validacion_resultado_archivo_id_fkey FOREIGN KEY (archivo_id) REFERENCES public.archivo_cargado(id)
);

CREATE TABLE public.kardex (
  id integer NOT NULL DEFAULT nextval('kardex_id_seq'::regclass),
  alumno_id integer NOT NULL,
  materia_id integer NOT NULL,
  periodo_id integer NOT NULL,
  calificacion numeric,
  estatus character varying NOT NULL,
  promedio_kardex integer NOT NULL DEFAULT 0,
  promedio_sem_act integer NOT NULL DEFAULT 0,
  filename text,
  uploadedAt timestamp with time zone NOT NULL DEFAULT now(),
  e2 character varying,
  CONSTRAINT kardex_pkey PRIMARY KEY (id),
  CONSTRAINT kardex_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id),
  CONSTRAINT kardex_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materia(id),
  CONSTRAINT kardex_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo(id)
);

CREATE TABLE public.calificacion (
  id integer NOT NULL DEFAULT nextval('calificacion_id_seq'::regclass),
  kardex_id integer NOT NULL UNIQUE,
  materia_id integer NOT NULL,
  ordinario numeric,
  extraordinario numeric,
  final numeric,
  fecha_cierre date,
  CONSTRAINT calificacion_pkey PRIMARY KEY (id),
  CONSTRAINT calificacion_kardex_id_fkey FOREIGN KEY (kardex_id) REFERENCES public.kardex(id),
  CONSTRAINT calificacion_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materia(id)
);

CREATE TABLE public.inscripcion (
  id integer NOT NULL DEFAULT nextval('inscripcion_id_seq'::regclass),
  alumno_id integer NOT NULL,
  periodo_id integer NOT NULL,
  estatus estatus_inscripcion NOT NULL DEFAULT 'INSCRITO'::estatus_inscripcion,
  fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inscripcion_pkey PRIMARY KEY (id),
  CONSTRAINT inscripcion_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id),
  CONSTRAINT inscripcion_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo(id)
);

CREATE TABLE public.optativa_progreso (
  id integer NOT NULL DEFAULT nextval('optativa_progreso_id_seq'::regclass),
  alumno_id integer NOT NULL UNIQUE,
  creditos_optativos_cursados integer NOT NULL DEFAULT 0,
  creditos_optativos_requeridos integer NOT NULL DEFAULT 0,
  CONSTRAINT optativa_progreso_pkey PRIMARY KEY (id),
  CONSTRAINT optativa_progreso_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id)
);

CREATE TABLE public.sancion (
  id integer NOT NULL DEFAULT nextval('sancion_id_seq'::regclass),
  alumno_id integer NOT NULL,
  profesor_id integer NOT NULL,
  regla character varying NOT NULL,
  fecha timestamp with time zone NOT NULL,
  detalle text,
  CONSTRAINT sancion_pkey PRIMARY KEY (id),
  CONSTRAINT sancion_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id),
  CONSTRAINT sancion_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesor(id)
);

CREATE TABLE public.incidencia (
  id integer NOT NULL DEFAULT nextval('incidencia_id_seq'::regclass),
  alumno_id integer NOT NULL,
  profesor_id integer NOT NULL,
  materia_id integer NOT NULL,
  grupo_id integer NOT NULL,
  tipo character varying NOT NULL,
  fecha timestamp with time zone NOT NULL,
  descripcion text NOT NULL,
  CONSTRAINT incidencia_pkey PRIMARY KEY (id),
  CONSTRAINT incidencia_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumno(id),
  CONSTRAINT incidencia_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesor(id),
  CONSTRAINT incidencia_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materia(id),
  CONSTRAINT incidencia_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupo(id)
);

CREATE TABLE public.usuario_rol (
  usuario_id integer NOT NULL,
  rol_id integer NOT NULL,
  CONSTRAINT usuario_rol_pkey PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT usuario_rol_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT usuario_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.rol(id)
);

-- =========================================================
-- 7) Vistas
-- =========================================================

CREATE OR REPLACE VIEW public.vista_horarios_grupos AS
SELECT
  p.etiqueta          AS periodo,
  m.codigo            AS codigo_materia,
  m.nombre            AS nombre_materia,
  g.clave_grupo       AS grupo,
  h.dia_semana,
  h.hora_inicio,
  h.hora_fin,
  h.aula,
  pr.num_empleado,
  pr.nombre           AS profesor_nombre,
  pr.apellido_paterno AS profesor_apellido_paterno,
  pr.apellido_materno AS profesor_apellido_materno,
  g.cupo
FROM horario h
JOIN grupo g      ON g.id = h.grupo_id
JOIN materia m    ON m.id = g.materia_id
JOIN periodo p    ON p.id = g.periodo_id
LEFT JOIN asignacion_profesor ap ON ap.grupo_id = g.id
LEFT JOIN profesor pr            ON pr.id = ap.profesor_id;

DROP VIEW IF EXISTS public.vista_asistencia_grupos;

CREATE OR REPLACE VIEW public.vista_asistencia_grupos AS
SELECT
  p.etiqueta          AS periodo,
  m.codigo            AS codigo_materia,
  m.nombre            AS nombre_materia,
  g.clave_grupo       AS grupo,
  a.matricula,
  a.expediente,
  a.nombre            AS nombre_alumno,
  a.apellido_paterno,
  a.apellido_materno,
  ag.fecha_alta,
  ag.fuente,
  ac.id               AS archivo_id,
  ac.nombre_archivo,
  ac.fecha            AS fecha_archivo
FROM public.alumno_grupo ag
JOIN public.alumno  a  ON a.id = ag.alumno_id
JOIN public.grupo   g  ON g.id = ag.grupo_id
JOIN public.materia m  ON m.id = g.materia_id
JOIN public.periodo p  ON p.id = g.periodo_id
LEFT JOIN public.archivo_cargado ac ON ac.id = ag.archivo_id;

-- =========================================================
-- 8) Función para crear usuario con password encriptado
-- =========================================================

CREATE OR REPLACE FUNCTION crear_usuario_con_password(
  p_email TEXT,
  p_password TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  INSERT INTO usuario (email, password_hash)
  VALUES (p_email, crypt(p_password, gen_salt('bf')))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- 9) UPDATE de passwords de profesores (opcional, solo si ya hay datos)
-- =========================================================

-- Esto actualizará password_hash de usuarios que correspondan a profesores
-- usando num_empleado como password en texto plano antes de encriptar.
UPDATE public.usuario u
SET password_hash = crypt(p.num_empleado::text, gen_salt('bf'))
FROM public.profesor p
WHERE u.email = p.correo;
