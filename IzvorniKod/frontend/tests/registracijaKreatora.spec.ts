import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Registracija' }).click();
  await page.getByRole('textbox', { name: 'Ime i prezime' }).click();
  await page.getByRole('textbox', { name: 'Ime i prezime' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).fill('S');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).fill('Sara ');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).fill('Sara S');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ime i prezime' }).fill('Sara Sarić');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('sarasaric1234@gmail.com');
  await page.getByRole('textbox', { name: 'Lozinka' }).click();
  await page.getByRole('textbox', { name: 'Lozinka' }).fill('lozinka12345');
  await page.getByRole('button', { name: 'Registriraj se' }).click();
  await page.getByRole('button', { name: '👨‍🍳 Ja sam Kreator' }).click();
}); 