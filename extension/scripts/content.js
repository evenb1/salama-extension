// Detect MetaMask transactions
console.log('🛡️ SALAMA: Content script loaded');

// Listen for MetaMask ethereum requests
if (window.ethereum) {
  console.log('🛡️ SALAMA: MetaMask detected');
  
  // Intercept eth_sendTransaction and contract interactions
  const originalRequest = window.ethereum.request;
  
  window.ethereum.request = async function(args) {
    console.log('🛡️ SALAMA: Ethereum request detected', args);
    
    // Check if it's a transaction
    if (args.method === 'eth_sendTransaction' || 
        args.method === 'eth_signTypedData_v4') {
      
      const params = args.params?.[0];
      const contractAddress = params?.to;
      
      if (contractAddress) {
        console.log('🛡️ SALAMA: Contract interaction detected:', contractAddress);
        
        // Send to background script for analysis
        chrome.runtime.sendMessage({
          type: 'ANALYZE_CONTRACT',
          contractAddress: contractAddress,
          transactionData: params
        });
      }
    }
    
    // Call original MetaMask request
    return originalRequest.apply(this, arguments);
  };
}

// Also detect contract addresses on the page
function detectContractsOnPage() {
  const text = document.body.innerText;
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const addresses = text.match(addressRegex);
  
  if (addresses && addresses.length > 0) {
    console.log('🛡️ SALAMA: Found addresses on page:', addresses.length);
    
    // Send to background for storage
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTRACTS',
      addresses: [...new Set(addresses)] // Remove duplicates
    });
  }
}

// Run detection after page loads
setTimeout(detectContractsOnPage, 2000);
EOF
