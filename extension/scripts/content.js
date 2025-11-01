console.log('SALAMA: Content script loaded');

if (window.ethereum) {
  console.log('SALAMA: MetaMask detected');
  
  const originalRequest = window.ethereum.request;
  
  window.ethereum.request = async function(args) {
    console.log('SALAMA: Ethereum request detected', args);
    
    if (args.method === 'eth_sendTransaction' || 
        args.method === 'eth_signTypedData_v4') {
      
      const params = args.params ? args.params[0] : null;
      const contractAddress = params ? params.to : null;
      
      if (contractAddress) {
        console.log('SALAMA: Contract interaction detected:', contractAddress);
        
        chrome.runtime.sendMessage({
          type: 'ANALYZE_CONTRACT',
          contractAddress: contractAddress
        });
      }
    }
    
    return originalRequest.apply(this, arguments);
  };
}

function detectContractsOnPage() {
  const addresses = new Set();
  
  // Method 1: Search in text content
  const text = document.body.innerText;
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const matches = text.match(addressRegex);
  
  if (matches) {
    matches.forEach(addr => addresses.add(addr));
  }
  
  // Method 2: Search in code/pre tags
  document.querySelectorAll('code, pre, span[class*="address"]').forEach(el => {
    const match = el.textContent.match(/0x[a-fA-F0-9]{40}/);
    if (match) addresses.add(match[0]);
  });
  
  // Method 3: Search in input fields
  document.querySelectorAll('input[type="text"]').forEach(input => {
    const match = input.value.match(/0x[a-fA-F0-9]{40}/);
    if (match) addresses.add(match[0]);
  });
  
  const addressArray = Array.from(addresses);
  
  console.log('SALAMA: Found', addressArray.length, 'addresses on page');
  
  if (addressArray.length > 0) {
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTRACTS',
      addresses: addressArray
    });
  }
}

function createFloatingButton() {
  if (document.getElementById('salama-float-btn')) return;
  
  const style = document.createElement('style');
  style.textContent = `
    #salama-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #000000;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 50px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s;
      font-family: -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    #salama-float-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      background: #2a2a2a;
    }
    
    #salama-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 1000000;
      max-width: 500px;
      width: 90%;
      max-height: 400px;
      overflow-y: auto;
    }
    
    #salama-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
    }
    
    .salama-contract-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      font-family: monospace;
      font-size: 13px;
      word-break: break-all;
    }
    
    .salama-contract-item:hover {
      background: #f0f0f0;
    }
  `;
  
  document.head.appendChild(style);
  
  const button = document.createElement('div');
  button.id = 'salama-float-btn';
  button.innerHTML = '<span>🛡️</span><span>SALAMA</span>';
  button.onclick = showOverlay;
  
  document.body.appendChild(button);
}

function showOverlay() {
  chrome.storage.local.get([`contracts_${window.location.hostname}`], (result) => {
    const contracts = result[`contracts_${window.location.hostname}`] || [];
    
    const backdrop = document.createElement('div');
    backdrop.id = 'salama-backdrop';
    backdrop.onclick = closeOverlay;
    
    const overlay = document.createElement('div');
    overlay.id = 'salama-overlay';
    overlay.innerHTML = `
      <h2 style="margin-bottom: 16px;">🛡️ Contracts on this page</h2>
      <div>
        ${contracts.length > 0 
          ? contracts.map(addr => `
              <div class="salama-contract-item" onclick="analyzeThis('${addr}')">
                ${addr}
              </div>
            `).join('')
          : '<p style="color: #737373;">No contracts detected yet. Try interacting with the page.</p>'
        }
      </div>
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
  });
}

window.analyzeThis = function(address) {
  chrome.runtime.sendMessage({
    type: 'ANALYZE_CONTRACT',
    contractAddress: address
  });
  closeOverlay();
};

function closeOverlay() {
  document.getElementById('salama-backdrop')?.remove();
  document.getElementById('salama-overlay')?.remove();
}

setTimeout(() => {
  detectContractsOnPage();
  createFloatingButton();
}, 3000);

setInterval(detectContractsOnPage, 10000);