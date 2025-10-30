const API_URL = 'http://localhost:7860'\;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🛡️ SALAMA Background received:', message);
  
  if (message.type === 'ANALYZE_CONTRACT') {
    analyzeAndNotify(message.contractAddress, sender.tab.id);
  }
  
  if (message.type === 'PAGE_CONTRACTS') {
    // Store detected contracts for this tab
    chrome.storage.local.set({
      [`contracts_${sender.tab.id}`]: message.addresses
    });
  }
  
  return true;
});

async function analyzeAndNotify(contractAddress, tabId) {
  try {
    console.log('🛡️ Analyzing:', contractAddress);
    
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_address: contractAddress })
    });
    
    const data = await response.json();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: '🛡️ SALAMA Analysis',
      message: `Risk: ${data.risk_score}/10\n${data.explanation.substring(0, 100)}...`,
      priority: 2
    });
    
    // Store analysis for popup to access
    chrome.storage.local.set({
      [`analysis_${contractAddress}`]: data
    });
    
  } catch (error) {
    console.error('🛡️ SALAMA Error:', error);
  }
}
