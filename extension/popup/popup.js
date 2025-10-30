const API_URL = 'http://localhost:7860';

document.getElementById('analyzeBtn').addEventListener('click', analyzeContract);

async function analyzeContract() {
  const input = document.getElementById('contractInput');
  const address = input.value.trim();
  
  if (!address) {
    alert('Please enter a contract address');
    return;
  }
  
  const btn = document.getElementById('analyzeBtn');
  const loadingState = document.getElementById('loadingState');
  const results = document.getElementById('results');
  
  // Show loading, hide results
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  loadingState.classList.remove('hidden');
  results.classList.add('hidden');
  
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contract_address: address
      })
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data = await response.json();
    displayResults(data);
    
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze Contract';
    loadingState.classList.add('hidden');
  }
}

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const riskValue = document.getElementById('riskValue');
  const explanationText = document.getElementById('explanationText');
  const warningsDiv = document.getElementById('warnings');
  
  // Show results
  resultsDiv.classList.remove('hidden');
  
  // Risk score with color class
  riskValue.textContent = data.risk_score;
  
  // Remove old risk classes
  riskValue.classList.remove('risk-low', 'risk-medium', 'risk-high');
  
  // Add appropriate risk class
  if (data.risk_score <= 3) {
    riskValue.classList.add('risk-low');
  } else if (data.risk_score <= 6) {
    riskValue.classList.add('risk-medium');
  } else {
    riskValue.classList.add('risk-high');
  }
  
  // Explanation
  explanationText.textContent = data.explanation;
  
  // Warnings
  warningsDiv.innerHTML = '';
  if (data.warnings && data.warnings.length > 0) {
    data.warnings.forEach(warning => {
      const div = document.createElement('div');
      div.className = 'warning-item';
      div.textContent = warning;
      warningsDiv.appendChild(div);
    });
  }
}