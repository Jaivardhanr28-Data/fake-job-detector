// Fake Job Detector - Content Script
// Runs on every page to extract job posting data

function extractJobData() {
  const title = extractBySelectors([
    'h1',
    '.job-title',
    '.position-title',
    '[class*="job-title"]',
    '[class*="jobtitle"]',
    '[class*="position"]',
    '[id*="job-title"]'
  ]);

  const company = extractBySelectors([
    '[class*="company"]',
    '[class*="employer"]',
    '[class*="org"]',
    '[class*="organisation"]',
    '[class*="organization"]'
  ]);

  let description = extractBySelectors([
    '[class*="description"]',
    '[class*="job-desc"]',
    '[class*="details"]',
    '[class*="overview"]',
    '[class*="responsibilities"]',
    'article',
    'main'
  ]);
  if (description.length > 2000) {
    description = description.substring(0, 2000);
  }

  const salary = extractBySelectors([
    '[class*="salary"]',
    '[class*="pay"]',
    '[class*="compensation"]',
    '[class*="ctc"]',
    '[class*="package"]'
  ]);

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const bodyText = document.body ? document.body.innerText : '';
  const emailMatches = bodyText.match(emailRegex);
  const email = emailMatches ? emailMatches[0] : '';

  const jobData = {
    title,
    company,
    description,
    salary,
    email,
    url: window.location.href,
    timestamp: Date.now()
  };

  chrome.storage.local.set({ jobData });

  console.log('[Fake Job Detector] Extracted job data:');
  console.log('  Title:', title);
  console.log('  Company:', company);
  console.log('  Description:', description.substring(0, 100) + (description.length > 100 ? '...' : ''));
  console.log('  Salary:', salary);
  console.log('  Email:', email);
  console.log('  URL:', jobData.url);
}

function extractBySelectors(selectors) {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.innerText.trim()) {
        return element.innerText.trim();
      }
    } catch (e) {
      // Invalid selector, skip
    }
  }
  return '';
}

// Run extraction immediately
extractJobData();

// Watch for URL changes (handles single-page apps like LinkedIn)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('[Fake Job Detector] URL changed, re-extracting...');
    extractJobData();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
