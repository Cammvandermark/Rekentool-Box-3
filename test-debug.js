const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[ERROR] ${err.message}`));
  
  // Navigate to page
  await page.goto('http://localhost:8000/index.html');
  await page.waitForLoadState('networkidle');
  
  console.log('Page loaded');
  
  // Now click period
  const periodBtn = await page.querySelector('button[data-period="2023-2024"]');
  if (periodBtn) {
    console.log('Found 2023-2024 button, clicking...');
    await periodBtn.click();
    await page.waitForTimeout(300);
  }
  
  // Select year
  const yearSelect = await page.$('#tax-year');
  if (yearSelect) {
    console.log('Found year select, changing to 2023...');
    await page.selectOption('#tax-year', '2023');
    await page.waitForTimeout(300);
  }
  
  // Check result
  const heading2023 = await page.locator('#overbrugging-heading-with-year-2023').first();
  const heading2023Text = await heading2023.textContent();
  
  console.log('Final state:', {
    heading2023Text
  });
  
  await browser.close();
})();
