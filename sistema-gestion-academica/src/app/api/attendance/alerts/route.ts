import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

const LIMIT_FALTAS = 14;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");
  const profesorId = searchParams.get("profesorId");

  if (!grupoId && !profesorId) {
    return NextResponse.json({ error: "Se requiere grupoId o profesorId" }, { status: 400 });
  }

  try {
    let query = "";
    // Corregimos el tipo de 'params' para evitar error de TypeScript
    let params: any[] = [];

    // CASO 1: Consulta por Grupo (Para la pantalla de gestión)
    if (grupoId) {
       query = `
        SELECT
          a.id AS alumno_id,
          a.expediente,
          TRIM(a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') || ' ' || a.nombre) as "nombreCompleto",
          a.correo,
          g.clave_grupo,
          m.nombre as materia_nombre,
          (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = g.id AND i.tipo = 'FALTA') as faltas_brutas,
          (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = g.id AND i.tipo = 'JUSTIFICACION') as justificaciones
        FROM alumno a
        JOIN grupo g ON g.id = $1
        JOIN materia m ON g.materia_id = m.id
        WHERE a.id IN (
            SELECT k.alumno_id FROM kardex k WHERE k.materia_id = g.materia_id AND k.periodo_id = g.periodo_id
            UNION
            SELECT ag.alumno_id FROM alumno_grupo ag WHERE ag.grupo_id = g.id
        )
        ORDER BY a.apellido_paterno, a.nombre;
      `;
      params = [grupoId];
    } 
    // CASO 2: Consulta Global por Profesor (Para la campana de notificaciones)
    else if (profesorId) {
      query = `
        SELECT
          a.id AS alumno_id,
          a.expediente,
          TRIM(a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') || ' ' || a.nombre) as "nombreCompleto",
          a.correo,
          g.clave_grupo,
          m.nombre as materia_nombre,
          (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = g.id AND i.tipo = 'FALTA') as faltas_brutas,
          (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = g.id AND i.tipo = 'JUSTIFICACION') as justificaciones
        FROM alumno a
        JOIN alumno_grupo ag_union ON ag_union.alumno_id = a.id
        JOIN grupo g ON ag_union.grupo_id = g.id
        JOIN materia m ON g.materia_id = m.id
        JOIN asignacion_profesor ap ON ap.grupo_id = g.id
        WHERE ap.profesor_id = $1
        ORDER BY faltas_brutas DESC;
      `;
      params = [profesorId];
    }

    const result = await pool.query(query, params);

    // Procesar datos (calcular semáforo)
    const alumnosProcesados = result.rows.map((row) => {
      const faltas = Math.max(0, parseInt(row.faltas_brutas || '0') - parseInt(row.justificaciones || '0'));
      return {
        id: row.alumno_id,
        nombre: row.nombreCompleto,
        expediente: row.expediente,
        grupo: row.clave_grupo,
        materia: row.materia_nombre,
        faltas,
        restantes: LIMIT_FALTAS - faltas,
        tipo: faltas >= LIMIT_FALTAS ? 'REPROBADO' 
              : faltas === (LIMIT_FALTAS - 1) ? 'CRITICO' 
              : faltas > 6 ? 'ADVERTENCIA' 
              : 'NORMAL'
      };
    });

    // CORRECCIÓN CLAVE: Filtrado Condicional
    if (grupoId) {
        // Si estoy viendo un grupo específico, quiero ver a TODOS (incluso los verdes/normales)
        return NextResponse.json(alumnosProcesados);
    } else {
        // Si es para la campana (profesorId), SOLO quiero ver alertas (oculto los normales)
        return NextResponse.json(alumnosProcesados.filter(a => a.tipo !== 'NORMAL'));
    }

  } catch (error) {
    console.error("Error alertas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}