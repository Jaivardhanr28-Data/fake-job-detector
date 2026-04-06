// FJD Debug Script - Run this in Chrome DevTools Console on a LinkedIn job page
// Paste the entire script and press Enter

(function() {
  console.log('='.repeat(70));
  console.log('FJD SELECTOR DEBUG - LinkedIn DOM Inspector');
  console.log('='.repeat(70));

  // 1. All h1/h2 elements (job title candidates)
  console.log('\n--- H1 ELEMENTS ---');
  document.querySelectorAll('h1').forEach((el, i) => {
    console.log(`h1[${i}] class="${el.className}" id="${el.id}"`);
    console.log(`  text: "${el.innerText?.trim().substring(0, 80)}"`);
    console.log(`  parent: <${el.parentElement?.tagName} class="${el.parentElement?.className?.substring?.(0, 80)}">`);
  });

  console.log('\n--- H2 ELEMENTS ---');
  document.querySelectorAll('h2').forEach((el, i) => {
    console.log(`h2[${i}] class="${el.className}" id="${el.id}"`);
    console.log(`  text: "${el.innerText?.trim().substring(0, 80)}"`);
  });

  // 2. Elements with "company" or "employer" in class/id
  console.log('\n--- COMPANY/EMPLOYER ELEMENTS ---');
  document.querySelectorAll('[class*="company"], [class*="Company"], [id*="company"], [class*="employer"], [class*="Employer"], [id*="employer"], [class*="org-name"], [class*="companyName"]').forEach((el, i) => {
    console.log(`[${i}] <${el.tagName} class="${el.className?.substring?.(0, 100)}" id="${el.id}">`);
    console.log(`  text: "${el.innerText?.trim().substring(0, 80)}"`);
  });

  // 3. Elements with "description" or "job-details" in class/id
  console.log('\n--- DESCRIPTION/JOB-DETAILS ELEMENTS ---');
  document.querySelectorAll('[class*="description"], [class*="Description"], [id*="description"], [class*="job-details"], [id*="job-details"], [id*="jobDetails"], [class*="jobDescription"]').forEach((el, i) => {
    console.log(`[${i}] <${el.tagName} class="${el.className?.substring?.(0, 100)}" id="${el.id}">`);
    console.log(`  text length: ${el.innerText?.trim().length} chars`);
    console.log(`  preview: "${el.innerText?.trim().substring(0, 100)}"`);
  });

  // 4. Elements with "salary", "compensation", or "pay" in class/id
  console.log('\n--- SALARY/COMPENSATION ELEMENTS ---');
  document.querySelectorAll('[class*="salary"], [class*="Salary"], [class*="compensation"], [class*="Compensation"], [class*="pay-range"], [id*="salary"]').forEach((el, i) => {
    console.log(`[${i}] <${el.tagName} class="${el.className?.substring?.(0, 100)}" id="${el.id}">`);
    console.log(`  text: "${el.innerText?.trim().substring(0, 80)}"`);
  });

  // 5. LinkedIn-specific: elements with "topcard" or "top-card" or "unified" in class
  console.log('\n--- LINKEDIN TOP-CARD / UNIFIED ELEMENTS ---');
  document.querySelectorAll('[class*="topcard"], [class*="top-card"], [class*="unified"], [class*="Unified"]').forEach((el, i) => {
    console.log(`[${i}] <${el.tagName} class="${el.className?.substring?.(0, 120)}">`);
    console.log(`  text: "${el.innerText?.trim().substring(0, 100)}"`);
  });

  // 6. LinkedIn-specific: elements with "jobs" in class name
  console.log('\n--- ELEMENTS WITH "jobs" IN CLASS (first 20) ---');
  const jobsEls = document.querySelectorAll('[class*="jobs-"]');
  Array.from(jobsEls).slice(0, 20).forEach((el, i) => {
    const text = el.innerText?.trim();
    if (text && text.length > 2 && text.length < 200) {
      console.log(`[${i}] <${el.tagName} class="${el.className?.substring?.(0, 120)}">`);
      console.log(`  text: "${text.substring(0, 100)}"`);
    }
  });

  // 7. Try the CURRENT content.js selectors and show which ones match
  console.log('\n--- TESTING CURRENT CONTENT.JS SELECTORS ---');
  const currentSelectors = {
    title: [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.t-24.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      '.topcard__title',
      'h1[class*="job-title"]',
      'h2.jobs-unified-top-card__job-title'
    ],
    company: [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      '.jobs-unified-top-card__subtitle-primary-grouping a',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]'
    ],
    description: [
      '.jobs-description__content',
      '.jobs-box__html-content',
      '#job-details',
      '.jobs-description-content__text',
      '.description__text',
      'article.jobs-description'
    ]
  };

  for (const [field, selectors] of Object.entries(currentSelectors)) {
    console.log(`\n  ${field.toUpperCase()}:`);
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      const status = el ? `FOUND - "${el.innerText?.trim().substring(0, 60)}"` : 'NOT FOUND';
      console.log(`    ${sel} => ${status}`);
    }
  }

  // 8. Smart guess: find the most likely title, company, description
  console.log('\n--- BEST GUESSES ---');

  // Title: first h1 with meaningful text
  const h1s = Array.from(document.querySelectorAll('h1'));
  const bestTitle = h1s.find(el => el.innerText?.trim().length > 2);
  if (bestTitle) {
    console.log(`TITLE: "${bestTitle.innerText.trim()}" => class="${bestTitle.className}" | parent class="${bestTitle.parentElement?.className?.substring?.(0, 80)}"`);
  }

  // Company: first link near the title area
  const bestCompany = document.querySelector('[class*="company"] a, [class*="Company"] a, [class*="employer"] a');
  if (bestCompany) {
    console.log(`COMPANY: "${bestCompany.innerText.trim()}" => class="${bestCompany.className}" | parent class="${bestCompany.parentElement?.className?.substring?.(0, 80)}"`);
  }

  // Description: largest text block with "description" or "details" in class/id
  const descCandidates = document.querySelectorAll('[class*="description"], [id*="job-details"], [id*="jobDetails"]');
  let bestDesc = null;
  let maxLen = 0;
  descCandidates.forEach(el => {
    const len = el.innerText?.trim().length || 0;
    if (len > maxLen) { maxLen = len; bestDesc = el; }
  });
  if (bestDesc) {
    console.log(`DESCRIPTION: ${maxLen} chars => class="${bestDesc.className?.substring?.(0, 100)}" id="${bestDesc.id}"`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('Copy everything above and share it with Claude to update selectors');
  console.log('='.repeat(70));
})();
