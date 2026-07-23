import { test, expect } from '@playwright/test';
import { loginLocators, LoginPage, loginTexts } from '@pages/login/loginPage';
import { SecurePage, securePageLocators, securePageTexts } from '@pages/secure/securePage';
import { env } from '../config/env';
import { urls, urlsTexts } from '@pages/urls';

test.describe('Login', () => {
  test('logs in with valid credentials', {
    tag: ['@Staging', '@Prod', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open()
    await loginPage.login(env.USER_NAME, env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);
    expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
    expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
  });

  test('shows an error for an invalid password', {
    tag: ['@Staging', '@Prod', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, 'wrong-password');
    expect(page.locator(loginLocators.errorMessage)).toBeVisible();
    expect(page.locator(loginLocators.errorMessage)).toContainText(loginTexts.errorMessage);
  });
  
  test('Hiển thị thông báo lỗi khi nhập username sai', {
    tag: ['@Staging', '@Prod', '@login'],
  }, async ({ page }) => {
  
    const loginPage = new LoginPage(page);
  
    await loginPage.open();
    await loginPage.login('wrong-username', env.PASSWORD);
  
    await expect(page.locator(loginLocators.errorMessage))
        .toBeVisible();
  
    await expect(page.locator(loginLocators.errorMessage))
        .toContainText('Your password is invalid!');
  });
  test('Kiểm tra hiển thị thông báo khi nhập username đúng và password sai', {
    tag: ['@Staging', '@Prod', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, 'wrong-password');

    await expect(page.locator(loginLocators.errorMessage))
        .toBeVisible();

    await expect(page.locator(loginLocators.errorMessage))
        .toContainText('Your password is invalid!');
  });

  test('Đăng nhập thành công khi nhập username chứa dấu cách ở đầu và cuối giá trị và password đúng', {
    tag: ['@Staging', '@Prod', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('  student ', env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);
    expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
    expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
  });

  test.describe('Kiểm tra hiển thị thông báo lỗi khi nhập username sai', () => {
    const invalidUsernameCases = [
      { name: 'username rỗng', username: '', password: env.PASSWORD, expectedError: 'Your username is invalid!' },
      { name: 'username toàn số', username: '123456', password: env.PASSWORD, expectedError: 'Your username is invalid!' },
      { name: 'username chứa ký tự đặc biệt', username: 'stu@#$%', password: env.PASSWORD, expectedError: 'Your username is invalid!' },
      { name: 'username quá dài (100 ký tự)', username: 'a'.repeat(100), password: env.PASSWORD, expectedError: 'Your username is invalid!' },
    ];

    for (const c of invalidUsernameCases) {
      test(`Hiển thị lỗi khi ${c.name}`, {
        tag: ['@Staging', '@Prod', '@login'],
      }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.login(c.username, c.password);

        await expect(page.locator(loginLocators.errorMessage)).toBeVisible();
        await expect(page.locator(loginLocators.errorMessage)).toContainText(c.expectedError);
      });
    }
  });
});
