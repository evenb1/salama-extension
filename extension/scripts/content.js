// Detect MetaMask transactions
console.log('🛡️ SALAMA: Content script loaded');

// Listen for MetaMask ethereum requests
if (window.ethereum) {
  console.log('🛡️ SALAMA: MetaMask detected');
  
  const originalRequest = window.ethereum.request;
  
  window.ethereum.request = async function(args) {
    console.log('🛡️ SALAMA: Ethereum request detected', args);
    
    if (args.method === 'eth_sendTransaction' || 
        args.method === 'eth_signTypedData_v4') {
      
      const params = args.params?.[0];
      const contractAddress = params?.to;
      
      if (contractAddress) {
        console.log('🛡️ SALAMA: Contract interaction detected:', contractAddress);
        
        chrome.runtime.sendMessage({
          type: 'ANALYZE_CONTRACT',
          contractAddress: contractAddress,
          transactionData: params
        });
      }
    }
    
    return originalRequest.apply(this, arguments);
  };
}

// Detect contract addresses on the page
function detectContractsOnPage() {
  const text = document.body.innerText;
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const addresses = text.match(addressRegex);
  
  if (addresses && addresses.length > 0) {
    console.log('🛡️ SALAMA: Found addresses on page:', addresses.length);
    
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTRACTS',
      addresses: [...new Set(addresses)]
    });
  }
}

// Create floating SALAMA button
function createFloatingButton() {
  // Don't add button if already exists
  if (document.getElementById('salama-float-btn')) return;
  
  const button = document.createElement('div');
  button.id = 'salama-float-btn';
  button.innerHTML = `
    <div class="salama-btn-content">
      <span class="salama-icon">🛡️</span>
      <span class="salama-text">SALAMA</span>
    </div>
  `;
  
  // Add styles
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
    }
    
    #salama-float-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      background: #2a2a2a;
    }
    
    .salama-btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .salama-icon {
      font-size: 18px;
    }
    
    .salama-text {
      letter-spacing: 0.5px;
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
    
    .salama-overlay-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .salama-overlay-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .salama-close-btn {
      cursor: pointer;
      font-size: 24px;
      color: #737373;
    }
    
    .salama-contract-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .salama-contract-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-family: 'SF Mono', monospace;
      font-size: 13px;
    }
    
    .salama-contract-item:hover {
      background: #f0f0f0;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(button);
  
  // Click handler
  button.addEventListener('click', showContractOverlay);
}

function showContractOverlay() {
  // Get detected contracts from storage
  chrome.storage.local.get([`contracts_${getCurrentTabId()}`], (result) => {
    const contracts = result[`contracts_${getCurrentTabId()}`] || [];
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'salama-backdrop';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'salama-overlay';
    overlay.innerHTML = `
      <div class="salama-overlay-header">
        <div class="salama-overlay-title">🛡️ Contracts on this page</div>
        <div class="salama-close-btn">×</div>
      </div>
      <div class="salama-contract-list">
        ${contracts.length > 0 
          ? contracts.map(addr => `
              <div class="salama-contract-item" data-address="${addr}">
                ${addr}
              </div>
            `).join('')
          : '<p style="color: #737373; text-align: center;">No contracts detected on this page</p>'
        }
      </div>
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
    
    // Close handlers
    backdrop.addEventListener('click', closeOverlay);
    overlay.querySelector('.salama-close-btn').addEventListener('click', closeOverlay);
    
    // Contract click handlers
    overlay.querySelectorAll('.salama-contract-item').forEach(item => {
      item.addEventListener('click', () => {
        const address = item.dataset.address;
        chrome.runtime.sendMessage({
          type: 'ANALYZE_CONTRACT',
          contractAddress: address
        });
        closeOverlay();
      });
    });
  });
}

function closeOverlay() {
  document.getElementById('salama-backdrop')?.remove();
  document.getElementById('salama-overlay')?.remove();
}

function getCurrentTabId() {
  // Helper to get consistent tab identifier
  return window.location.hostname;
}

// Initialize
setTimeout(() => {
  detectContractsOnPage();
  createFloatingButton();
}, 2000);
