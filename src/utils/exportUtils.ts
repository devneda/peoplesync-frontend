import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Fichaje, Usuario } from '../types';

// Le decimos a TypeScript exactamente qué forma tiene nuestro acumulador
type FichajesAgrupados = Record<string, Fichaje[]>;

// Función para agrupar fichajes por día (E1, S1, E2, S2)
const prepararDatosPlantillaLegal = (fichajes: Fichaje[]) => {
  // Reemplazamos el 'any' por nuestro nuevo tipo 'FichajesAgrupados'
  const agrupados = fichajes.reduce<FichajesAgrupados>((acc, f) => {
    const fecha = new Date(f.fechaHoraEntrada).toLocaleDateString();
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(f);
    return acc;
  }, {});

  return Object.keys(agrupados).map((fecha) => {
    const turnosDelDia = agrupados[fecha];
    turnosDelDia.sort(
      (a, b) => new Date(a.fechaHoraEntrada).getTime() - new Date(b.fechaHoraEntrada).getTime()
    );

    const turno1 = turnosDelDia[0];
    const turno2 = turnosDelDia[1];

    const formatHora = (fechaIso?: string | Date | null) =>
      fechaIso
        ? new Date(fechaIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    return [
      fecha,
      formatHora(turno1?.fechaHoraEntrada),
      formatHora(turno1?.fechaHoraSalida),
      formatHora(turno2?.fechaHoraEntrada),
      formatHora(turno2?.fechaHoraSalida),
      turno1?.tipo === 'TELETRABAJO' || turno2?.tipo === 'TELETRABAJO' ? 'Remoto' : 'Oficina',
    ];
  });
};

export const exportUtils = {
  generarPDFRegistroHorario: (empleado: Usuario, fichajes: Fichaje[], mesAno: string) => {
    const doc = new jsPDF();
    const azulCorporativo = [37, 99, 235] as [number, number, number];

    // --- 1. CABECERA CON ICONO ---
    // Dibujamos el icono (simulando el logo de Layers)
    doc.setFillColor(azulCorporativo[0], azulCorporativo[1], azulCorporativo[2]);
    doc.roundedRect(14, 12, 10, 10, 2, 2, 'F'); // Fondo azul redondeado
    // Dibujamos unas líneas blancas simulando capas
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(16, 15, 22, 15);
    doc.line(16, 17, 22, 17);
    doc.line(16, 19, 22, 19);

    // Texto del Logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(azulCorporativo[0], azulCorporativo[1], azulCorporativo[2]);
    doc.text('PeopleSync', 28, 20);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Registro de Jornada Diaria', 14, 32);

    // --- 2. DATOS DEL EMPLEADO ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Empleado: ${empleado.nombreCompleto}`, 14, 42);
    doc.text(`DNI/NIE: ${empleado.dni}`, 14, 47);
    doc.text(`Periodo: ${mesAno}`, 14, 52);

    // --- 3. TABLA DE DATOS ---
    const filas = prepararDatosPlantillaLegal(fichajes);
    autoTable(doc, {
      startY: 60,
      head: [['Fecha', 'Entrada 1', 'Salida 1', 'Entrada 2', 'Salida 2', 'Modalidad']],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: azulCorporativo, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // --- 4. FIRMAS Y PROTECCIÓN DE DATOS ---
    // Reemplazamos el '(doc as any)' por una intersección de tipos segura
    const docWithAutoTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
    const finalY = docWithAutoTable.lastAutoTable?.finalY || 60;

    // Bloque de Firmas
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Empleado:', 14, finalY + 15);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, finalY + 25, 80, finalY + 25);

    doc.text('Firma de la Empresa:', 120, finalY + 15);
    doc.line(120, finalY + 25, 186, finalY + 25);

    // TEXTO LEGAL (LOPD) con asteriscos
    const textoLOPD =
      '* De acuerdo con la normativa vigente en materia de protección de datos (RGPD UE 2016/679 y LOPDGDD 3/2018), le informamos que los datos recogidos en este documento serán tratados por la empresa con la exclusiva finalidad de gestionar el control horario y la jornada laboral, sirviendo este registro como prueba documental del cumplimiento de la normativa laboral vigente.';

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    // Ajustamos el texto al ancho de la página (margin 14)
    const lineasLOPD = doc.splitTextToSize(textoLOPD, 180);
    doc.text(lineasLOPD, 14, finalY + 40);

    doc.save(`Registro_Horario_${empleado.nombreCompleto.replace(/\s+/g, '_')}_${mesAno}.pdf`);
  },

  generarExcelRegistroHorario: (empleado: Usuario, fichajes: Fichaje[], mesAno: string) => {
    const filas = prepararDatosPlantillaLegal(fichajes);
    const datosExcel = [
      ['PeopleSync - Control Horario Inteligente'],
      ['Registro de Jornada Diaria'],
      [],
      [`Empleado: ${empleado.nombreCompleto}`, `DNI: ${empleado.dni}`, `Periodo: ${mesAno}`],
      [],
      ['Fecha', 'Entrada Mañana', 'Salida Mañana', 'Entrada Tarde', 'Salida Tarde', 'Modalidad'],
      ...filas,
      [],
      [
        '* Información de Protección de Datos: Los datos contenidos en este registro son tratados para el cumplimiento de obligaciones legales de control horario conforme al Art. 34.9 del ET.',
      ],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datosExcel);
    XLSX.utils.book_append_sheet(wb, ws, 'Registro Horario');
    XLSX.writeFile(
      wb,
      `Registro_Horario_${empleado.nombreCompleto.replace(/\s+/g, '_')}_${mesAno}.xlsx`
    );
  },
};
