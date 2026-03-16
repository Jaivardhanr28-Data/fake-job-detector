document.addEventListener('DOMContentLoaded', () => {
  const checkBtn = document.getElementById('checkBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const error = document.getElementById('error');
  const scoreFill = document.getElementById('scoreFill');
  const label = document.getElementById('label');
  const probability = document.getElementById('probability');
  const flagsContainer = document.getElementById('flagsContainer');

  checkBtn.addEventListener('click', () => {
    loading.style.display = 'block';
    result.style.display = 'none';
    error.style.display = 'none';

    chrome.storage.local.get('jobData', (data) => {
      if (!data.jobData) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = 'No job data found. Please navigate to a job posting page first.';
        return;
      }

      const jobData = data.jobData;

      fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobData.title,
          description: jobData.description,
          company: jobData.company,
          salary_range: jobData.salary,
          email: jobData.email
        })
      })
        .then((res) => res.json())
        .then((response) => {
          loading.style.display = 'none';
          result.style.display = 'block';

          const pct = (response.probability * 100).toFixed(1);

          scoreFill.style.width = pct + '%';

          const colorMap = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' };
          const fillColor = colorMap[response.color] || '#4f46e5';
          scoreFill.style.backgroundColor = fillColor;

          label.textContent = response.label;
          label.style.color = fillColor;

          probability.textContent = 'Confidence: ' + pct + '%';

          flagsContainer.innerHTML = '';
          if (response.flags && response.flags.length > 0) {
            response.flags.forEach((flag) => {
              const badge = document.createElement('span');
              badge.className = 'flag-badge';
              badge.textContent = flag;
              flagsContainer.appendChild(badge);
            });
          } else {
            const noFlags = document.createElement('span');
            noFlags.textContent = 'No specific red flags detected';
            noFlags.style.color = '#22c55e';
            noFlags.style.fontSize = '13px';
            flagsContainer.appendChild(noFlags);
          }
        })
        .catch(() => {
          loading.style.display = 'none';
          error.style.display = 'block';
          error.textContent = 'Cannot connect to backend. Make sure the server is running on localhost:8000';
        });
    });
  });
});
