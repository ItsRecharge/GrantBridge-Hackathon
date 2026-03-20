import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function fillFAFSAPDF(data) {
  const bytes = await fetch('/fafsa-form.pdf').then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(bytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Helper: draw text on a page (pdf-lib y=0 is bottom of page)
  const draw = (pageIdx, text, x, y, size = 9) => {
    if (!text || pageIdx >= pages.length) return;
    pages[pageIdx].drawText(String(text), {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0.65), // blue ink — visually distinct from printed form
    });
  };

  const maskSSN = (ssn) => (ssn ? `***-**-${String(ssn).slice(-4)}` : '');

  // ── PAGE INDEX NOTES ──
  // Pages 1–6 of the PDF are instructions; the actual form starts at page index 6 (page 7).
  // Coordinates are in points (72 pts = 1 inch). pdf-lib origin is bottom-left.
  // Page size: 612 × 792 pts (US Letter).
  // These coordinates are calibrated for the 2025-26 FAFSA PDF layout and may need
  // minor adjustment after visual inspection of the downloaded PDF.

  // ── STUDENT SECTION ──

  // Q1 — Student Identity (page index 6)
  draw(6, data.last_name,       87,  616);
  draw(6, data.first_name,      260, 616);
  draw(6, data.middle_initial,  460, 616);
  draw(6, data.date_of_birth,   87,  585);
  draw(6, maskSSN(data.ssn),    280, 585);

  // Q2 — Contact Info (page index 6)
  draw(6, data.address,         87,  554);
  draw(6, data.city,            87,  523);
  draw(6, data.state,           345, 523);
  draw(6, data.zip_code,        430, 523);
  draw(6, data.phone,           87,  492);
  draw(6, data.email,           280, 492);

  // Q3 — Marital Status (page index 6)
  draw(6, data.marital_status,  87,  461);

  // Q4 — Education Level (page index 7)
  draw(7, data.education_level, 87,  730);

  // Q5–8 — Special Circumstances (page index 7)
  const circumstances = [
    data.is_active_duty && 'Active duty military',
    data.is_veteran && 'Veteran',
    data.is_orphan && 'Orphan/ward of court',
    data.is_emancipated && 'Emancipated minor',
    data.has_legal_guardianship && 'Legal guardianship',
    data.is_homeless && 'Homeless/at risk',
    data.has_unusual_circumstances && 'Unusual circumstances',
    data.direct_unsub_only && 'Direct unsubsidized only',
  ]
    .filter(Boolean)
    .join(', ');
  draw(7, circumstances || 'None', 87, 695);

  // Q9–10 — Family Numbers (page index 7)
  draw(7, data.household_size,   87,  660);
  draw(7, data.num_in_college,   280, 660);

  // Q11 — Gender (page index 7)
  draw(7, data.gender,           87,  625);

  // Q12 — Ethnicity (page index 7)
  draw(7, (data.ethnicity || []).join(', '), 87, 594);

  // Q13 — Citizenship (page index 7)
  draw(7, data.citizenship_status, 87, 559);

  // Q15 — Parent Education Level (page index 7)
  draw(7, data.parent_edu_level,   87,  500);

  // Q16 — Parent killed on duty (page index 7)
  draw(7, data.parent_killed_duty ? 'Yes' : 'No', 87, 469);

  // Q17 — High School (page index 7)
  draw(7, data.high_school,        87,  434);

  // Q18 — Federal Benefits (page index 8)
  draw(8, (data.federal_benefits || []).join(', '), 87, 730);

  // Q19–22 — Tax / Financial Info (page index 8)
  draw(8, data.tax_filing_status,        87,  695);
  draw(8, data.agi,                      87,  660);
  draw(8, data.income_tax_paid,          87,  625);
  draw(8, data.child_support_received,   87,  590);
  draw(8, data.student_cash_savings,     87,  555);
  draw(8, data.student_investments,      87,  520);
  draw(8, data.student_business_assets,  87,  485);

  // Q23 — Colleges (page index 9)
  draw(9, data.colleges_list ? data.colleges_list.replace(/\n/g, '  |  ') : '', 87, 730);

  // ── STUDENT SPOUSE SECTION (page index 10) ──
  if (
    data.marital_status &&
    ['Married (not separated)', 'Remarried'].includes(data.marital_status)
  ) {
    draw(10, data.spouse_last_name,       87,  700);
    draw(10, data.spouse_first_name,      280, 700);
    draw(10, data.spouse_date_of_birth,   87,  669);
    draw(10, maskSSN(data.spouse_ssn),    280, 669);
    draw(10, data.spouse_tax_filing,      87,  634);
    draw(10, data.spouse_agi,             87,  599);
    draw(10, data.spouse_income_tax_paid, 87,  564);
  }

  // ── PARENT SECTION (page indices 11–13) ──
  if (data.is_dependent === 'Yes') {
    draw(11, data.parent_marital_status,  87,  700);
    draw(11, data.parent1_last_name,      87,  669);
    draw(11, data.parent1_first_name,     280, 669);
    draw(11, data.parent1_date_of_birth,  87,  638);
    draw(11, maskSSN(data.parent1_ssn),   280, 638);
    draw(11, data.parent_state,           87,  607);
    draw(11, data.parent_household_size,  87,  572);
    draw(11, data.parent_num_in_college,  280, 572);

    draw(12, (data.parent_federal_benefits || []).join(', '), 87, 730);
    draw(12, data.parent_tax_filing_status, 87, 695);
    draw(12, data.parent_agi,              87,  660);
    draw(12, data.parent_income_tax_paid,  87,  625);
    draw(12, data.parent_child_support,    87,  590);
    draw(12, data.parent_cash_savings,     87,  555);
    draw(12, data.parent_investments,      87,  520);
    draw(12, data.parent_business_assets,  87,  485);

    // ── PARENT SPOUSE SECTION (page index 13) ──
    if (
      [
        'Married (not separated)',
        'Remarried',
        'Unmarried and both legal parents living together',
      ].includes(data.parent_marital_status)
    ) {
      draw(13, data.parent2_last_name,        87,  700);
      draw(13, data.parent2_first_name,       280, 700);
      draw(13, data.parent2_date_of_birth,    87,  669);
      draw(13, maskSSN(data.parent2_ssn),     280, 669);
      draw(13, data.parent2_tax_filing,       87,  634);
      draw(13, data.parent2_agi,              87,  599);
      draw(13, data.parent2_income_tax_paid,  87,  564);
    }
  }

  // ── PREPARER SECTION (page index 14) ──
  if (data.include_preparer) {
    draw(14, data.preparer_first_name, 87,  700);
    draw(14, data.preparer_last_name,  280, 700);
    draw(14, data.preparer_firm,       87,  669);
    draw(14, data.preparer_address,    87,  638);
    draw(14, data.preparer_phone,      87,  607);
  }

  const filledBytes = await pdfDoc.save();
  const blob = new Blob([filledBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FAFSA-Filled-2025-26.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
