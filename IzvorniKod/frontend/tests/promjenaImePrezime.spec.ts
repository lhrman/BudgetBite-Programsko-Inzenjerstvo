import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Prijava' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('sarasaric1234@gmail.com');
  await page.getByRole('textbox', { name: 'Lozinka' }).click();
  await page.getByRole('textbox', { name: 'Lozinka' }).fill('lozinka12345');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await page.getByRole('button', { name: 'Postavke' }).click();
  await page.getByRole('button', { name: 'Uredi' }).click();
  await page.getByRole('textbox', { name: 'Ime i prezime' }).click();
  await page.getByRole('textbox', { name: 'Ime i prezime' }).fill('Sara Šarić');
  await page.getByRole('button', { name: 'Spremi promjene' }).click();
});
