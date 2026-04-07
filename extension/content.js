// Fake Job Detector - Content Script (v2)
// Handles dynamic SPAs like LinkedIn, Naukri, Indeed, Glassdoor

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // PLATFORM-SPECIFIC SELECTORS
  // ═══════════════════════════════════════════════════════════════

  const PLATFORM_SELECTORS = {
    linkedin: {
      detect: () => window.location.hostname.includes('linkedin.com'),
      title: [
        'h1.t-24',
        'h1.t-24.t-bold',
        'h1[class*="t-24"]',
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title h1',
        'h1'
      ],
      company: [
        'a[href*="/company/"][class*="app-aware-link"]',
        '.job-details-jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name a',
        'a[href*="/company/"]'
      ],
      description: [
        'article.jobs-description__container',
        '.jobs-description__container',
        '.jobs-description',
        '.jobs-box--fadein.jobs-description'
      ],
      salary: [
        '.jobs-unified-top-card__job-insight--highlight',
        '.compensation__salary',
        '.salary-main-rail__data-amount',
        '[class*="salary"]'
      ]
    },

    naukri: {
      detect: () => window.location.hostname.includes('naukri.com'),
      title: [
        '.jd-header-title',
        'h1.jd-header-title',
        '.job-header h1',
        'h1[class*="title"]'
      ],
      company: [
        '.jd-header-comp-name',
        '.comp-name',
        'a.comp-name',
        '[class*="comp-name"]',
        '.company-name',
        '[class*="company-name"]',
        'a[href*="/company/"]'
      ],
      description: [
        '.job-desc',
        '.dang-inner-html',
        '.job-description',
        '.jd-desc',
        '#job-desc-container',
        '.styles_JDC__dang-inner-html__h0K4t'
      ],
      salary: [
        '.salary',
        '.sal-wrap',
        '[class*="salary"]',
        '.ni-job-tuple-icon-srp-rupee'
      ]
    },

    indeed: {
      detect: () => window.location.hostname.includes('indeed.com'),
      title: [
        '.jobsearch-JobInfoHeader-title',
        'h1.jobsearch-JobInfoHeader-title',
        '.jobTitle',
        'h1[data-testid="jobsearch-JobInfoHeader-title"]'
      ],
      company: [
        '[data-testid="inlineHeader-companyName"]',
        '.jobsearch-InlineCompanyRating-companyHeader',
        '.companyName',
        '.jobsearch-CompanyInfoContainer a'
      ],
      description: [
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText',
        '.jobDescription',
        'div[id="jobDescriptionText"]'
      ],
      salary: [
        '#salaryInfoAndJobType',
        '.jobsearch-JobMetadataHeader-item',
        '[class*="salary"]'
      ]
    },

    glassdoor: {
      detect: () => window.location.hostname.includes('glassdoor.com'),
      title: [
        '.job-title',
        '[data-test="job-title"]',
        'h1.heading',
        '.css-w04er4'
      ],
      company: [
        '.employer-name',
        '[data-test="employer-name"]',
        '.css-16nw49e'
      ],
      description: [
        '.jobDescriptionContent',
        '[data-test="description"]',
        '.desc',
        '.jobDescription'
      ],
      salary: [
        '.salary-estimate',
        '[data-test="detailSalary"]',
        '.css-1bluz6i'
      ]
    },

    // Fallback generic selectors for other job sites
    generic: {
      detect: () => true,
      title: [
        'h1',
        '.job-title',
        '.position-title',
        '[class*="job-title"]',
        '[class*="jobtitle"]',
        '[class*="position"]',
        '[id*="job-title"]',
        '[data-testid*="title"]'
      ],
      company: [
        '[class*="company"]',
        '[class*="employer"]',
        '[class*="org"]',
        '[class*="organisation"]',
        '[class*="organization"]',
        '[data-testid*="company"]'
      ],
      description: [
        '[class*="description"]',
        '[class*="job-desc"]',
        '[class*="details"]',
        '[class*="overview"]',
        '[class*="responsibilities"]',
        'article',
        'main'
      ],
      salary: [
        '[class*="salary"]',
        '[class*="pay"]',
        '[class*="compensation"]',
        '[class*="ctc"]',
        '[class*="package"]'
      ]
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  function detectPlatform() {
    for (const [name, config] of Object.entries(PLATFORM_SELECTORS)) {
      if (name !== 'generic' && config.detect()) {
        console.log(`[FJD] Detected platform: ${name}`);
        return name;
      }
    }
    console.log('[FJD] Using generic selectors');
    return 'generic';
  }

  function extractBySelectors(selectors) {
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.innerText?.trim();
          // Must have actual content, not just whitespace or very short text
          if (text && text.length > 1 && !text.match(/^[\s\n]*$/)) {
            return text;
          }
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }
    return '';
  }

  function extractEmail() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const bodyText = document.body?.innerText || '';
    const matches = bodyText.match(emailRegex);
    // Filter out common non-recruiter emails
    const filtered = (matches || []).filter(email => {
      const lower = email.toLowerCase();
      return !lower.includes('example.com') &&
        !lower.includes('email.com') &&
        !lower.includes('domain.com');
    });
    return filtered[0] || '';
  }

  function isJobPage() {
    const url = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // LinkedIn: only direct job view pages, not collections or feed
    if (url.includes('linkedin.com')) {
      if (pathname.includes('/jobs/view/') || url.includes('currentJobId=')) {
        return true;
      }
      return false;
    }
    // Naukri job pages
    if (url.includes('naukri.com') && pathname.includes('/job-listings')) {
      return true;
    }
    // Indeed job pages
    if (url.includes('indeed.com') && (pathname.includes('/viewjob') || url.includes('vjk='))) {
      return true;
    }
    // Glassdoor job pages
    if (url.includes('glassdoor.com') && pathname.includes('/job-listing')) {
      return true;
    }
    // Generic: check for job-related keywords in URL
    const jobKeywords = ['job', 'career', 'position', 'opening', 'vacancy', 'hiring'];
    return jobKeywords.some(kw => url.includes(kw));
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN EXTRACTION LOGIC
  // ═══════════════════════════════════════════════════════════════

  async function extractJobData() {
    chrome.storage.local.remove('jobData');

    if (!isJobPage()) {
      console.log('[FJD] Not a job page, skipping extraction');
      return null;
    }

    const platform = detectPlatform();
    const selectors = PLATFORM_SELECTORS[platform];

    let title = '';
    let company = '';

    // For LinkedIn, use document.title as primary source
    // Format is always: "Job Title | Company Name | LinkedIn"
    if (platform === 'linkedin') {
      const parts = document.title.split(' | ');
      if (parts.length >= 2) {
        title = parts[0].trim();
        company = parts[1].trim();
      }
    }

    // Only fall back to DOM selectors if title still empty
    if (!title) title = extractBySelectors(selectors.title);
    if (!company) company = extractBySelectors(selectors.company);

    if (platform === 'naukri' && company) {
      company = company.replace(/^about\s+(the\s+)?company\s*/i, '').trim();
      company = company.split('\n')[0].trim();
    }
    // If company still empty on Naukri, parse from page title
    // Naukri title format: "Job Title - Location - Company | Naukri.com"
    if (platform === 'naukri' && (!company || company.length < 2)) {
      const parts = document.title.split('-');
      if (parts.length >= 3) {
        company = parts[parts.length - 1].replace(/\|.*$/, '').trim();
      }
    }

    let description = extractBySelectors(selectors.description);

    // LinkedIn: click "See more" to expand description first
    if (platform === 'linkedin') {
      // Click any expand buttons
      const expandBtns = Array.from(document.querySelectorAll('button')).filter(btn => {
        const txt = btn.innerText?.trim();
        return txt === '… more' || txt === '...more' || txt === 'See more' || txt === 'Show more';
      });
      expandBtns.forEach(btn => {
        try { btn.click(); } catch(e) {}
      });

      // Wait 800ms for expansion then extract
      await new Promise(resolve => setTimeout(resolve, 800));

      // Now find description via "About the job" heading
      const allEls = Array.from(document.querySelectorAll('*'));
      for (const el of allEls) {
        if (el.children.length === 0 && el.innerText?.trim() === 'About the job') {
          let parent = el.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!parent) break;
            const txt = parent.innerText?.trim();
            if (txt && txt.length > 200) {
              description = txt;
              break;
            }
            parent = parent.parentElement;
          }
          if (description) break;
        }
      }
    }
    const salary = extractBySelectors(selectors.salary);
    const email = extractEmail();

    // Clean up description prefix
    if (description.startsWith('About the job')) {
      description = description.slice('About the job'.length).trim();
    }
    // Discard too-short descriptions
    if (description.length < 50) {
      description = '';
    }

    // Truncate description if too long
    if (description.length > 3000) {
      description = description.substring(0, 3000);
    }

    const jobData = {
      title,
      company,
      description,
      salary,
      email,
      url: window.location.href,
      platform,
      timestamp: Date.now()
    };

    // Validate: at least title OR description must be present
    const isValid = (title.length > 2) || (description.length > 50);

    console.log('[FJD] Extracted job data:');
    console.log('  Platform:', platform);
    console.log('  Title:', title || '(empty)');
    console.log('  Company:', company || '(empty)');
    console.log('  Description:', description.substring(0, 80) + (description.length > 80 ? '...' : '') || '(empty)');
    console.log('  Salary:', salary || '(empty)');
    console.log('  Email:', email || '(empty)');
    console.log('  Valid:', isValid);

    return isValid ? jobData : null;
  }

  function saveJobData(jobData) {
    if (jobData) {
      chrome.storage.local.set({ jobData }, () => {
        console.log('[FJD] ✓ Job data saved to storage');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RETRY LOGIC FOR ASYNC-RENDERED CONTENT (LinkedIn, React apps)
  // ═══════════════════════════════════════════════════════════════

  let extractionAttempts = 0;
  const MAX_ATTEMPTS = 8;
  const RETRY_DELAYS = [300, 500, 800, 1200, 1800, 2500, 3500, 5000]; // Progressive backoff

  async function attemptExtraction() {
    const jobData = await extractJobData();

    if (jobData) {
      saveJobData(jobData);
      extractionAttempts = 0; // Reset for next page
      return true;
    }

    // Retry if we haven't maxed out attempts
    if (extractionAttempts < MAX_ATTEMPTS) {
      const delay = RETRY_DELAYS[extractionAttempts] || 5000;
      console.log(`[FJD] Extraction incomplete, retrying in ${delay}ms (attempt ${extractionAttempts + 1}/${MAX_ATTEMPTS})`);
      extractionAttempts++;
      setTimeout(attemptExtraction, delay);
      return false;
    }

    console.log('[FJD] Max attempts reached, saving partial data');
    // Save whatever we have, even if incomplete
    const partialData = {
      title: '',
      company: '',
      description: '',
      salary: '',
      email: '',
      url: window.location.href,
      platform: detectPlatform(),
      timestamp: Date.now(),
      partial: true
    };
    saveJobData(partialData);
    extractionAttempts = 0;
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  // MUTATION OBSERVER FOR SPA NAVIGATION & CONTENT LOADING
  // ═══════════════════════════════════════════════════════════════

  let lastUrl = window.location.href;
  let debounceTimer = null;

  function handleMutation() {
    // Debounce rapid mutations
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const currentUrl = window.location.href;

      // If URL changed, reset and re-extract
      if (currentUrl !== lastUrl) {
        console.log('[FJD] URL changed:', currentUrl);
        lastUrl = currentUrl;
        extractionAttempts = 0;
        attemptExtraction();
      }
    }, 250);
  }

  // Watch for DOM changes (catches React re-renders, content loading, etc.)
  const observer = new MutationObserver(handleMutation);

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false
      });
      console.log('[FJD] MutationObserver started');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTEN FOR MANUAL TRIGGER FROM POPUP
  // ═══════════════════════════════════════════════════════════════

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'extractNow') {
      console.log('[FJD] Manual extraction triggered from popup');
      extractionAttempts = 0;
      const jobData = await extractJobData();
      if (jobData) {
        saveJobData(jobData);
        sendResponse({ success: true, jobData });
      } else {
        // Try with retry
        attemptExtraction();
        sendResponse({ success: false, message: 'Extraction in progress' });
      }
    }
    return true; // Keep channel open for async response
  });

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  console.log('[FJD] Fake Job Detector content script loaded');
  console.log('[FJD] Current URL:', window.location.href);

  // Start extraction after a small delay to let initial content render
  setTimeout(() => {
    attemptExtraction();
    startObserver();
  }, 500);

  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    console.log('[FJD] Popstate event detected');
    extractionAttempts = 0;
    setTimeout(attemptExtraction, 300);
  });

})();