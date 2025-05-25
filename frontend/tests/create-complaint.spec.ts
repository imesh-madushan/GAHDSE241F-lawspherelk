import { test, expect, chromium } from '@playwright/test';

test('auto fill and submit complaint form using new Chrome tab', async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 250, 
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5173/complaints');

  await page.click('button:has-text("Create New Complaint")');

  // Fill complainer details
  await page.fill('input[name="nic"]', '900000000V');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="phone"]', '0771234567');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="address"]', '123 Main St');
  await page.fill('input[name="dob"]', '2000-01-01');

  await page.selectOption('select[name="complaintType"]', { label: 'Criminal' });

  await page.fill('textarea[name="description"]', 'This is a test complaint.');
  await page.fill('textarea[name="evidence_details"]', 'Voice statement details for test.');

  await page.click('button:has-text("Submit Complaint")');

  await expect(page.getByText('Complaint Created Successfully')).toBeVisible();

  await page.click('button:has-text("OK")');

  await browser.close(); 
});
