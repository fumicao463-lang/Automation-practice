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

    await test.step('Mở trang login', async () => {
      await loginPage.open();
    });

    await test.step('Nhập username và password hợp lệ, submit form', async () => {
      await loginPage.login(env.USER_NAME, env.PASSWORD);
    });

    await test.step('Xác nhận chuyển hướng đến trang secure', async () => {
      await expect(page).toHaveURL(urls.secure);
    });

    await test.step('Xác nhận hiển thị heading và nút Log out', async () => {
      await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
      await expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
    });
  });

  test('Đăng nhập không thành công khi cả username và password đều sai', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Mở trang login', async () => {
      await loginPage.open();
    });

    await test.step('Nhập username và password đều sai, submit form', async () => {
      await loginPage.login('wrong-username', 'wrong-password');
    });

    await test.step('Xác nhận hiển thị thông báo lỗi username invalid', async () => {
      await expect(page.locator(loginLocators.errorMessage)).toBeVisible();
      await expect(page.locator(loginLocators.errorMessage)).toContainText('Your username is invalid!');
    });
  });

  test('Hiển thị thông báo lỗi khi nhập username sai', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Mở trang login', async () => {
      await loginPage.open();
    });

    await test.step('Nhập username sai, password đúng, submit form', async () => {
      await loginPage.login('wrong-username', env.PASSWORD);
    });

    await test.step('Xác nhận hiển thị thông báo lỗi username invalid', async () => {
      await expect(page.locator(loginLocators.errorMessage)).toBeVisible();
      await expect(page.locator(loginLocators.errorMessage)).toContainText('Your username is invalid!');
    });
  });

  test('Kiểm tra hiển thị thông báo khi nhập username đúng và password sai', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Mở trang login', async () => {
      await loginPage.open();
    });

    await test.step('Nhập username đúng, password sai, submit form', async () => {
      await loginPage.login(env.USER_NAME, 'wrong-password');
    });

    await test.step('Xác nhận hiển thị thông báo lỗi password invalid', async () => {
      await expect(page.locator(loginLocators.errorMessage)).toBeVisible();
      await expect(page.locator(loginLocators.errorMessage)).toContainText('Your password is invalid!');
    });
  });

  test(
    'Đăng nhập thành công khi nhập username chứa dấu cách ở đầu và cuối giá trị',
    {
      tag: ['@Staging', '@login'],
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
  
      await test.step('Mở trang login', async () => {
        await loginPage.open();
      });
  
      await test.step('Nhập username có khoảng trắng đầu/cuối, password đúng, submit form', async () => {
        await loginPage.login('  student ', env.PASSWORD);
      });
  
      await test.step('Xác nhận chuyển hướng đến trang secure', async () => {
        await expect(page).toHaveURL(urls.secure, { timeout: 5_000 });
      });
  
      await test.step('Xác nhận hiển thị heading và nút Log out', async () => {
        await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
        await expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
      });
  });

  test('Đăng nhập thành công khi nhấn Enter thay vì click Submit', {
    tag: ['@Staging', '@login'],
  }, async ({ page }) => {
    
    const loginPage = new LoginPage(page);

    await test.step('Mở trang login', async () => {
      await loginPage.open();
    });

    await test.step('Điền username và password', async () => {
      await page.locator(loginLocators.usernameInput).fill(env.USER_NAME);
      await page.locator(loginLocators.passwordInput).fill(env.PASSWORD);
    });

    await test.step('Nhấn Enter trong ô password để submit', async () => {
      await page.locator(loginLocators.passwordInput).press('Enter');
    });

    await test.step('Xác nhận chuyển hướng đến trang secure', async () => {
      await expect(page).toHaveURL(urls.secure, { timeout: 5_000 });
    });

    await test.step('Xác nhận hiển thị heading và nút Log out', async () => {
      await expect(page.locator(securePageLocators.successHeading)).toContainText(urlsTexts.secure);
      await expect(page.getByRole('link', { name: securePageTexts.logoutButton })).toBeVisible();
    });
  });

  test( 'Không thể truy cập lại trang secure sau khi logout',
    {  tag: ['@Staging', '@login'],  },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
  
      await test.step('Mở trang login và đăng nhập thành công', async () => {
        await loginPage.open();
        await loginPage.login(env.USER_NAME, env.PASSWORD);
  
        await expect(page).toHaveURL(urls.secure);
        await expect(
          page.getByRole('link', { name: securePageTexts.logoutButton })
        ).toBeVisible();
      });
  
      await test.step('Đăng xuất khỏi hệ thống', async () => {
        await page.getByRole('link', { name: securePageTexts.logoutButton }).click();
  
        await expect(page).toHaveURL(urls.login);
      });
  
      await test.step('Truy cập lại trang secure bằng URL', async () => {
        await page.goto(urls.secure);
      });
  
      await test.step('Xác nhận người dùng bị chuyển hướng về trang login', async () => {
        await expect(page).toHaveURL(urls.login);
        await expect(page.getByRole('button', { name: loginPageTexts.loginButton })).toBeVisible();
  
      });
  });
});
