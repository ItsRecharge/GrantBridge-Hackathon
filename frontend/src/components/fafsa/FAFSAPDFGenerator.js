import jsPDF from 'jspdf';

export const generateFAFSAAnswerSheet = (data) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const MARGIN = 14;
  const LINE_H = 7;
  let y = 20;

  const checkPage = () => {
    if (y > PAGE_H - 20) {
      doc.addPage();
      y = 20;
    }
  };

  const addHeader = () => {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('FAFSA\u00AE Answer Sheet', PAGE_W / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}   \u2022   Reference only \u2014 fill your actual form at fafsa.gov`,
      PAGE_W / 2,
      y,
      { align: 'center' }
    );
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
  };

  const addSectionHeader = (title) => {
    checkPage();
    y += 2;
    doc.setFillColor(30, 64, 175); // blue-800
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.rect(MARGIN, y - 4, PAGE_W - MARGIN * 2, 8, 'F');
    doc.text(title, MARGIN + 3, y + 1);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'normal');
    y += LINE_H + 2;
  };

  const addRow = (qNum, label, value) => {
    checkPage();
    const displayVal = Array.isArray(value)
      ? value.length ? value.join(', ') : '\u2014'
      : value !== '' && value !== null && value !== undefined && value !== false
        ? String(value)
        : '\u2014';

    doc.setFontSize(9);
    // Q number
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`Q${qNum}`, MARGIN, y);
    // Label
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, MARGIN + 10, y);
    // Answer
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 30, 30);
    const answerX = 130;
    const answerLines = doc.splitTextToSize(displayVal, PAGE_W - answerX - MARGIN);
    doc.text(answerLines, answerX, y);
    y += LINE_H * Math.max(1, answerLines.length);
  };

  const addBoolRow = (qNum, label, value) => {
    addRow(qNum, label, value ? 'Yes' : 'No');
  };

  const maskSSN = (ssn) => {
    if (!ssn) return '\u2014';
    const clean = String(ssn).replace(/\D/g, '');
    return clean.length >= 4 ? `\u2022\u2022\u2022-\u2022\u2022-${clean.slice(-4)}` : '\u2014';
  };

  // ---- Build PDF ----
  addHeader();

  // Section 1: Student
  addSectionHeader('Section 1: Student  (Q1\u201324)');

  const fullName = [data.first_name, data.middle_initial, data.last_name].filter(Boolean).join(' ');
  addRow(1, 'Full Name', fullName || '\u2014');
  addRow(1, 'Date of Birth', data.date_of_birth);
  addRow(1, 'SSN (last 4 only)', maskSSN(data.ssn));
  addRow(2, 'Phone', data.phone);
  addRow(2, 'Email', data.email);
  const address = [data.address, data.city, data.state, data.zip_code].filter(Boolean).join(', ');
  addRow(2, 'Mailing Address', address || '\u2014');
  addRow(3, 'Marital Status', data.marital_status);
  addRow(4, 'Education Level', data.education_level);
  addRow(4, 'Dependent Student?', data.is_dependent);
  addBoolRow(5, 'Active Duty', data.is_active_duty);
  addBoolRow(5, 'Veteran', data.is_veteran);
  addBoolRow(5, 'Orphan / Foster Care', data.is_orphan);
  addBoolRow(5, 'Emancipated Minor', data.is_emancipated);
  addBoolRow(5, 'Legal Guardianship', data.has_legal_guardianship);
  addBoolRow(6, 'Homeless / At Risk', data.is_homeless);
  addBoolRow(7, 'Unusual Circumstances', data.has_unusual_circumstances);
  addBoolRow(8, 'Direct Unsubsidized Loan Only', data.direct_unsub_only);
  addRow(9, 'Household / Family Size', data.household_size);
  addRow(10, 'Number in College', data.num_in_college);
  addRow(11, 'Gender', data.gender);
  addRow(12, 'Race / Ethnicity', data.ethnicity);
  addRow(13, 'Citizenship Status', data.citizenship_status);
  addRow(14, 'State of Legal Residence', data.state);
  addRow(15, 'Parent Education Level', data.parent_edu_level);
  addBoolRow(16, 'Parent Killed in Line of Duty', data.parent_killed_duty);
  addRow(17, 'High School', data.high_school);
  addRow(18, 'Federal Benefits Received', data.federal_benefits);
  addRow(19, 'Tax Filing Status', data.tax_filing_status);
  addRow(20, 'Adjusted Gross Income (AGI)', data.agi ? `$${data.agi}` : '\u2014');
  addRow(20, 'Income Tax Paid', data.income_tax_paid ? `$${data.income_tax_paid}` : '\u2014');
  addRow(21, 'Child Support Received', data.child_support_received ? `$${data.child_support_received}` : '\u2014');
  addRow(22, 'Cash / Savings', data.student_cash_savings ? `$${data.student_cash_savings}` : '\u2014');
  addRow(22, 'Net Worth of Investments', data.student_investments ? `$${data.student_investments}` : '\u2014');
  addRow(22, 'Net Worth of Businesses / Farms', data.student_business_assets ? `$${data.student_business_assets}` : '\u2014');
  addRow(23, 'Colleges Listed', data.colleges_list || '\u2014');
  addBoolRow(24, 'Consent & Signature Acknowledged', data.agreed_to_signature);

  // Section 2: Student Spouse (conditional)
  if (['Married', 'Remarried'].includes(data.marital_status)) {
    addSectionHeader('Section 2: Student Spouse  (Q25\u201329)');
    const spouseName = [data.spouse_first_name, data.spouse_last_name].filter(Boolean).join(' ');
    addRow(25, 'Spouse Full Name', spouseName || '\u2014');
    addRow(25, 'Spouse Date of Birth', data.spouse_date_of_birth);
    addRow(25, 'Spouse SSN (last 4 only)', maskSSN(data.spouse_ssn));
    addRow(27, 'Spouse Tax Filing Status', data.spouse_tax_filing);
    addRow(28, 'Spouse AGI', data.spouse_agi ? `$${data.spouse_agi}` : '\u2014');
    addRow(28, 'Spouse Income Tax Paid', data.spouse_income_tax_paid ? `$${data.spouse_income_tax_paid}` : '\u2014');
  }

  // Section 3: Parent (conditional)
  if (data.is_dependent === 'Yes') {
    addSectionHeader('Section 3: Parent  (Q30\u201341)');
    addRow(32, 'Parent Marital Status', data.parent_marital_status);
    const parent1Name = [data.parent1_first_name, data.parent1_last_name].filter(Boolean).join(' ');
    addRow(30, 'Parent 1 Full Name', parent1Name || '\u2014');
    addRow(30, 'Parent 1 Date of Birth', data.parent1_date_of_birth);
    addRow(30, 'Parent 1 SSN (last 4 only)', maskSSN(data.parent1_ssn));
    addRow(33, 'Parent State of Residence', data.parent_state);
    addRow(34, 'Parent Family Size', data.parent_household_size);
    addRow(35, 'Number in College (parent family)', data.parent_num_in_college);
    addRow(36, 'Parent Federal Benefits', data.parent_federal_benefits);
    addRow(37, 'Parent Tax Filing Status', data.parent_tax_filing_status);
    addRow(38, 'Parent AGI', data.parent_agi ? `$${data.parent_agi}` : '\u2014');
    addRow(38, 'Parent Income Tax Paid', data.parent_income_tax_paid ? `$${data.parent_income_tax_paid}` : '\u2014');
    addRow(39, 'Parent Child Support Received', data.parent_child_support ? `$${data.parent_child_support}` : '\u2014');
    addRow(40, 'Parent Cash / Savings', data.parent_cash_savings ? `$${data.parent_cash_savings}` : '\u2014');
    addRow(40, 'Parent Investment Net Worth', data.parent_investments ? `$${data.parent_investments}` : '\u2014');
    addRow(40, 'Parent Business / Farm Net Worth', data.parent_business_assets ? `$${data.parent_business_assets}` : '\u2014');
  }

  // Section 4: Parent Spouse / Partner (conditional)
  const hasTwoParents =
    data.is_dependent === 'Yes' &&
    ['Married', 'Remarried', 'Unmarried and both parents living together'].includes(data.parent_marital_status);

  if (hasTwoParents) {
    addSectionHeader('Section 4: Parent Spouse / Partner  (Q42\u201346)');
    const parent2Name = [data.parent2_first_name, data.parent2_last_name].filter(Boolean).join(' ');
    addRow(42, 'Parent 2 Full Name', parent2Name || '\u2014');
    addRow(42, 'Parent 2 Date of Birth', data.parent2_date_of_birth);
    addRow(42, 'Parent 2 SSN (last 4 only)', maskSSN(data.parent2_ssn));
    addRow(44, 'Parent 2 Tax Filing Status', data.parent2_tax_filing);
    addRow(45, 'Parent 2 AGI', data.parent2_agi ? `$${data.parent2_agi}` : '\u2014');
    addRow(45, 'Parent 2 Income Tax Paid', data.parent2_income_tax_paid ? `$${data.parent2_income_tax_paid}` : '\u2014');
  }

  // Section 5: Preparer (conditional)
  if (data.include_preparer) {
    addSectionHeader('Section 5: Preparer  (Q47\u201349)');
    addRow(47, 'Preparer Name', data.preparer_name);
    addRow(47, 'Preparer Firm / Organization', data.preparer_firm);
    addRow(48, 'Preparer Address', data.preparer_address);
    addRow(48, 'Preparer Phone', data.preparer_phone);
  }

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}   \u2022   This is a reference document only. Complete the official form at fafsa.gov.`,
      PAGE_W / 2,
      PAGE_H - 8,
      { align: 'center' }
    );
  }

  doc.save('FAFSA-Answer-Sheet.pdf');
};
