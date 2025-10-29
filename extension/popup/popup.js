const API_URL = 'http://localhost:7860'\;

document.getElementById('analyzeBtn').addEventListener('click', analyzeContract);

async function analyzeContract() {
  const input = document.getElementById('contractInput');
  const address = input.value.trim();
  
  if (!address) {
    alert('Please enter a contract address');
    return;
  }
  
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  
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
  }
}

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const riskValue = document.getElementById('riskValue');
  const explanationText = document.getElementById('explanationText');
  const warningsDiv = document.getElementById('warnings');
  
  // Show results
  resultsDiv.classList.remove('hidden');
  
  // Risk score
  riskValue.textContent = data.risk_score;
  riskValue.style.color = getRiskColor(data.risk_score);
  
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

function getRiskColor(score) {
  if (score <= 3) return '#10b981'; // green
  if (score <= 6) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}
