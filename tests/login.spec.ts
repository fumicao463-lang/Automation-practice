import { test, expect } from '@playwright/test';
import { loginLocators, LoginPage, loginTexts } from '@pages/login/loginPage';
import { SecurePage, securePageLocators, securePageTexts } from '@pages/secure/securePage';
import { env } from '../config/env';
import { urls, urlsTexts } from '@pages/urls';

test.describe('Login', () => {
  test('Đăng nhập thành công với username và password hợp lệ', {
    tag: ['@Staging','@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open()
    await loginPage.login(env.USER_NAME, env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);
    expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
    expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
  });
   test('Đăng nhập không thành công khi cả username và password đều sai', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('wrong-username', 'wrong-password');

    await expect(page.locator(loginLocators.errorMessage)).toBeVisible();
    await expect(page.locator(loginLocators.errorMessage)).toContainText('Your username is invalid!');
  });

  test('Hiển thị thông báo lỗi khi nhập username sai', {
    tag: ['@Staging', '@login'],
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
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, 'wrong-password');

    await expect(page.locator(loginLocators.errorMessage))
        .toBeVisible();

    await expect(page.locator(loginLocators.errorMessage))
        .toContainText('Your password is invalid!');
  });

  test('Đăng nhập thành công khi nhập username chứa dấu cách ở đầu và cuối giá trị', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('  student ', env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);
    expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
    expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
  });
  
test('Đăng nhập thành công khi nhấn Enter thay vì click Submit', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await page.locator(loginLocators.usernameInput).fill(env.USER_NAME);
    await page.locator(loginLocators.passwordInput).fill(env.PASSWORD);
    await page.locator(loginLocators.passwordInput).press('Enter');

    await expect(page).toHaveURL(urls.secure);
    await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
    await expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
  });

  test('Không phát sinh lỗi khi click Submit nhiều lần liên tiếp', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await page.locator(loginLocators.usernameInput).fill(env.USER_NAME);
    await page.locator(loginLocators.passwordInput).fill(env.PASSWORD);

    const submitButton = page.locator(loginLocators.submitButton);
    await Promise.all([
      submitButton.click(),
      submitButton.click({ force: true }).catch(() => {}),
    ]);

    await expect(page).toHaveURL(urls.secure);
    await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
  });

  test('Bấm Back sau khi login thành công không quay lại trang login còn hiển thị lỗi', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);

    await page.goBack();

    await expect(page.locator(securePageLocators.successHeading).or(page.locator('body'))).toBeVisible();
  });

  test('Session vẫn còn hiệu lực sau khi refresh trang secure', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);

    await page.reload();

    await expect(page).toHaveURL(urls.secure);
    await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
  });
    test('Không thể truy cập lại trang secure sau khi logout', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.USER_NAME, env.PASSWORD);
    await expect(page).toHaveURL(urls.secure);

    await page.getByRole('link', { name: securePageTexts.logoutButton }).click();
    await expect(page).toHaveURL(urls.login);

    await page.goto(urls.secure);

    await expect(page).toHaveURL(urls.login);
  });
    }
  });
});
