
export const getCompanyLogo = (symbol: string): string => {
  const logoMap: { [key: string]: string } = {
    // Major Tech Companies
    'AAPL': 'https://companieslogo.com/img/orig/AAPL-e033b5b2.png',
    'MSFT': 'https://companieslogo.com/img/orig/MSFT-e8c5e9b1.png',
    'GOOGL': 'https://companieslogo.com/img/orig/GOOGL-e8b6d1bd.png',
    'GOOG': 'https://companieslogo.com/img/orig/GOOGL-e8b6d1bd.png',
    'AMZN': 'https://companieslogo.com/img/orig/AMZN-e9b42c25.png',
    'TSLA': 'https://companieslogo.com/img/orig/TSLA-b8a7e4a8.png',
    'META': 'https://companieslogo.com/img/orig/META-b5a44e2b.png',
    'NVDA': 'https://companieslogo.com/img/orig/NVDA-02f9b5d7.png',
    'NFLX': 'https://companieslogo.com/img/orig/NFLX-b5b7c8c1.png',
    'CRM': 'https://companieslogo.com/img/orig/CRM-0d7e0a7c.png',
    'ORCL': 'https://companieslogo.com/img/orig/ORCL-d5b3b8d2.png',
    'INTC': 'https://companieslogo.com/img/orig/INTC-c0b3b2d1.png',
    'AMD': 'https://companieslogo.com/img/orig/AMD-c3a2b1d0.png',
    'IBM': 'https://companieslogo.com/img/orig/IBM-c1a2b3d4.png',
    
    // Financial Services
    'JPM': 'https://companieslogo.com/img/orig/JPM-b1c2d3e4.png',
    'BAC': 'https://companieslogo.com/img/orig/BAC-c2d3e4f5.png',
    'WFC': 'https://companieslogo.com/img/orig/WFC-d3e4f5g6.png',
    'GS': 'https://companieslogo.com/img/orig/GS-e4f5g6h7.png',
    'MS': 'https://companieslogo.com/img/orig/MS-f5g6h7i8.png',
    
    // Healthcare
    'JNJ': 'https://companieslogo.com/img/orig/JNJ-g6h7i8j9.png',
    'PFE': 'https://companieslogo.com/img/orig/PFE-h7i8j9k0.png',
    'UNH': 'https://companieslogo.com/img/orig/UNH-i8j9k0l1.png',
    'MRNA': 'https://companieslogo.com/img/orig/MRNA-j9k0l1m2.png',
    
    // Consumer Goods
    'KO': 'https://companieslogo.com/img/orig/KO-k0l1m2n3.png',
    'PEP': 'https://companieslogo.com/img/orig/PEP-l1m2n3o4.png',
    'WMT': 'https://companieslogo.com/img/orig/WMT-m2n3o4p5.png',
    'TGT': 'https://companieslogo.com/img/orig/TGT-n3o4p5q6.png',
    
    // ETFs
    'SPY': 'https://companieslogo.com/img/orig/SPY-e2b3c1d0.png',
    'QQQ': 'https://companieslogo.com/img/orig/QQQ-f1a2b3c4.png',
    'IWM': 'https://companieslogo.com/img/orig/IWM-g2b3c4d5.png',
    'VTI': 'https://companieslogo.com/img/orig/VTI-h3c4d5e6.png',
    
    // Energy
    'XOM': 'https://companieslogo.com/img/orig/XOM-o4p5q6r7.png',
    'CVX': 'https://companieslogo.com/img/orig/CVX-p5q6r7s8.png',
    
    // Industrial
    'BA': 'https://companieslogo.com/img/orig/BA-q6r7s8t9.png',
    'GE': 'https://companieslogo.com/img/orig/GE-r7s8t9u0.png',
    
    // Real Estate
    'AMT': 'https://companieslogo.com/img/orig/AMT-s8t9u0v1.png',
    
    // Utilities
    'NEE': 'https://companieslogo.com/img/orig/NEE-t9u0v1w2.png'
  };
  
  // Return specific logo if exists, otherwise try Clearbit API, then fallback
  return logoMap[symbol] || `https://logo.clearbit.com/${getCompanyDomain(symbol)}`;
};

const getCompanyDomain = (symbol: string): string => {
  const domainMap: { [key: string]: string } = {
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'GOOGL': 'google.com',
    'GOOG': 'google.com',
    'AMZN': 'amazon.com',
    'TSLA': 'tesla.com',
    'META': 'meta.com',
    'NVDA': 'nvidia.com',
    'NFLX': 'netflix.com',
    'CRM': 'salesforce.com',
    'ORCL': 'oracle.com',
    'INTC': 'intel.com',
    'AMD': 'amd.com',
    'IBM': 'ibm.com',
    'JPM': 'jpmorganchase.com',
    'BAC': 'bankofamerica.com',
    'WFC': 'wellsfargo.com',
    'JNJ': 'jnj.com',
    'PFE': 'pfizer.com',
    'KO': 'coca-cola.com',
    'PEP': 'pepsico.com',
    'WMT': 'walmart.com',
    'XOM': 'exxonmobil.com',
    'CVX': 'chevron.com',
    'BA': 'boeing.com'
  };
  
  return domainMap[symbol] || `${symbol.toLowerCase()}.com`;
};

export const getFallbackLogo = (): string => {
  return 'https://companieslogo.com/img/orig/STOCK-96087f37.png?t=1648063409';
};
