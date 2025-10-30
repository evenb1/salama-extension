const API_URL = 'http://localhost:7860';

console.log('SALAMA Background loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('SALAMA Background received:', message);
  
  if (message.type === 'ANALYZE_CONTRACT') {
    analyzeContract(message.contractAddress);
  }
  
  if (message.type === 'PAGE_CONTRACTS') {
    const tabId = sender.tab ? sender.tab.id : 'unknown';
    chrome.storage.local.set({
      [`contracts_${tabId}`]: message.addresses
    });
  }
  
  return true;
});

async function analyzeContract(contractAddress) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_address: contractAddress })
    });
    
    const data = await response.json();
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'SALAMA Analysis',
      message: `Risk: ${data.risk_score}/10`,
      priority: 2
    });
    
  } catch (error) {
    console.error('SALAMA Error:', error);
  }
}