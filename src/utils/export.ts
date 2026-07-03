import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AuditReport } from '../types/audit'
import { getScoreLabel } from './scoring'

type DocWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } }

export function exportToPDF(report: AuditReport): void {
  const { session, categoryScores, overallScore, criticalItems, warningItems } = report
  const doc = new jsPDF() as DocWithAutoTable

  const auditDate = session.completedAt
    ? new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Header
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('York.ie Product Audit Report', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(`${session.projectName}${session.clientName ? ` · ${session.clientName}` : ''}  ·  Auditor: ${session.auditorName}  ·  ${auditDate}`, 14, 22)

  // Overall score summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Overall Score: ${overallScore}% — ${getScoreLabel(overallScore)}`, 14, 38)

  const answered = Object.keys(session.answers).length
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`${answered}/40 questions answered  ·  ${criticalItems.length} critical items  ·  ${warningItems.length} improvement areas`, 14, 44)

  // Category scores table
  doc.setTextColor(0, 0, 0)
  autoTable(doc, {
    startY: 50,
    head: [['Category', 'Score', 'Status', 'Answered', 'Flagged']],
    body: categoryScores.map((c) => [
      c.label,
      `${c.score}%`,
      getScoreLabel(c.score),
      `${c.answeredCount}/${c.totalCount}`,
      c.flaggedQuestions > 0 ? String(c.flaggedQuestions) : '—',
    ]),
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 8 },
    columnStyles: { 1: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  })

  // Critical action items
  if (criticalItems.length > 0) {
    const y1 = doc.lastAutoTable.finalY + 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text(`Critical Action Items (${criticalItems.length})`, 14, y1)

    autoTable(doc, {
      startY: y1 + 4,
      head: [['Category', 'Question', 'Score', 'Actions Required']],
      body: criticalItems.map((item) => [
        item.categoryLabel,
        item.questionText,
        `${item.normalizedScore}%`,
        item.actionItems.join('\n'),
      ]),
      headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 65 }, 2: { cellWidth: 14, halign: 'center' }, 3: { cellWidth: 70 } },
    })
  }

  // Warning items
  if (warningItems.length > 0) {
    const y2 = doc.lastAutoTable.finalY + 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(180, 83, 9)
    doc.text(`Improvement Areas (${warningItems.length})`, 14, y2)

    autoTable(doc, {
      startY: y2 + 4,
      head: [['Category', 'Question', 'Score', 'Actions']],
      body: warningItems.map((item) => [
        item.categoryLabel,
        item.questionText,
        `${item.normalizedScore}%`,
        item.actionItems.slice(0, 2).join('\n'),
      ]),
      headStyles: { fillColor: [180, 83, 9], fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 65 }, 2: { cellWidth: 14, halign: 'center' }, 3: { cellWidth: 70 } },
    })
  }

  const filename = `york-audit-${session.projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}
