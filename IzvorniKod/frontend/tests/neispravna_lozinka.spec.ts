import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Prijava' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('ivanko_ivankovic1234@gmail.com');
  await page.getByRole('textbox', { name: 'Lozinka' }).click();
  await page.getByRole('textbox', { name: 'Lozinka' }).fill('kriva lozinka');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(
  page.getByText(/Neispravna lozinka./i)
).toBeVisible();
});