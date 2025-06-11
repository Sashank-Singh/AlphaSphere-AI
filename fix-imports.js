import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process
const filesToFix = [
  'src/pages/ImprovedStockDetailPage.tsx',
  'src/components/StockAnalysisPanel.tsx',
  'src/components/PredictivePriceForecasting.tsx',
  'src/components/AIFinancialHealthAnalysis.tsx',
  'src/components/AINewsImpactAnalysis.tsx',
  'src/components/AIFundamentalScore.tsx',
  'src/components/AIPatternRecognition.tsx',
  'src/components/AIEarningsPrediction.tsx',
  'src/components/AIInsiderTradingAnalysis.tsx',
  'src/components/AIOptionsFlowAnalysis.tsx',
  'src/pages/MarketPage.tsx',
  'src/pages/DashboardPage.tsx',
  'src/components/ImprovedSphereAI.tsx',
  'src/components/OptionChain.tsx',
  'src/pages/OptionsPage.tsx',
  'src/components/Layout.tsx',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/StockCard.tsx',
  'src/components/StockPriceChart.tsx',
  'src/pages/HomePage.tsx',
  'src/components/TopBar.tsx'
];

// Map of incorrect imports to correct ones
const importMap = {
  "'components/": "'@/components/",
  "'lib/": "'@/lib/",
  "'types'": "'@/types'",
  "'data/": "'@/data/",
  "'context/": "'@/context/",
  "'hooks/": "'@/hooks/'"
};

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix imports
    for (const [oldImport, newImport] of Object.entries(importMap)) {
      const regex = new RegExp(oldImport, 'g');
      content = content.replace(regex, newImport);
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed imports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Import fixing complete!');
