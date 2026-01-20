const { test, expect } = require('@playwright/test');
const path = require('path');

const filePath = `file://${path.resolve(__dirname, 'index.html')}`;

test.describe('쇼핑 리스트 앱 테스트', () => {

    test.beforeEach(async ({ page }) => {
        // localStorage 초기화를 위해 페이지 로드 후 클리어
        await page.goto(filePath);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('1. 페이지가 올바르게 로드되어야 한다', async ({ page }) => {
        // 제목 확인
        await expect(page.locator('header h1')).toHaveText('쇼핑 리스트');

        // 입력 필드 확인
        await expect(page.locator('#itemInput')).toBeVisible();

        // 추가 버튼 확인
        await expect(page.locator('button:has-text("추가")')).toBeVisible();

        // 빈 상태 메시지 확인
        await expect(page.locator('.empty-state')).toContainText('리스트가 비어있습니다');

        console.log('✅ 페이지 로드 테스트 통과');
    });

    test('2. 아이템 추가 기능 - 버튼 클릭', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 입력 및 추가
        await input.fill('우유');
        await addButton.click();

        // 아이템이 리스트에 추가되었는지 확인
        await expect(page.locator('.item-text').first()).toHaveText('우유');

        // 입력 필드가 비워졌는지 확인
        await expect(input).toHaveValue('');

        // 통계 표시 확인
        await expect(page.locator('#stats')).toContainText('1개 중 0개 완료');

        console.log('✅ 아이템 추가(버튼) 테스트 통과');
    });

    test('3. 아이템 추가 기능 - Enter 키', async ({ page }) => {
        const input = page.locator('#itemInput');

        // Enter 키로 아이템 추가
        await input.fill('빵');
        await input.press('Enter');

        // 아이템이 추가되었는지 확인
        await expect(page.locator('.item-text').first()).toHaveText('빵');

        console.log('✅ 아이템 추가(Enter) 테스트 통과');
    });

    test('4. 여러 아이템 추가', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 여러 아이템 추가
        const items = ['사과', '바나나', '오렌지'];
        for (const item of items) {
            await input.fill(item);
            await addButton.click();
        }

        // 모든 아이템이 추가되었는지 확인 (최신 항목이 위에)
        const listItems = page.locator('.item-text');
        await expect(listItems).toHaveCount(3);
        await expect(listItems.nth(0)).toHaveText('오렌지');
        await expect(listItems.nth(1)).toHaveText('바나나');
        await expect(listItems.nth(2)).toHaveText('사과');

        // 통계 확인
        await expect(page.locator('#stats')).toContainText('3개 중 0개 완료');

        console.log('✅ 여러 아이템 추가 테스트 통과');
    });

    test('5. 아이템 체크 기능', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 추가
        await input.fill('계란');
        await addButton.click();

        // 체크박스 클릭
        const checkbox = page.locator('.checkbox').first();
        await checkbox.click();

        // 체크 상태 확인
        const listItem = page.locator('.list-item').first();
        await expect(listItem).toHaveClass(/checked/);

        // 통계 업데이트 확인
        await expect(page.locator('#stats')).toContainText('1개 중 1개 완료');

        console.log('✅ 아이템 체크 테스트 통과');
    });

    test('6. 아이템 체크 해제 기능', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 추가
        await input.fill('치즈');
        await addButton.click();

        // 체크 후 해제
        const checkbox = page.locator('.checkbox').first();
        await checkbox.click(); // 체크
        await checkbox.click(); // 해제

        // 체크 해제 상태 확인
        const listItem = page.locator('.list-item').first();
        await expect(listItem).not.toHaveClass(/checked/);

        // 통계 확인
        await expect(page.locator('#stats')).toContainText('1개 중 0개 완료');

        console.log('✅ 아이템 체크 해제 테스트 통과');
    });

    test('7. 아이템 삭제 기능', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 추가
        await input.fill('요거트');
        await addButton.click();

        // 삭제 버튼 클릭
        const deleteButton = page.locator('.delete-btn').first();
        await deleteButton.click();

        // 아이템이 삭제되었는지 확인
        await expect(page.locator('.list-item')).toHaveCount(0);

        // 빈 상태 메시지 표시 확인
        await expect(page.locator('.empty-state')).toBeVisible();

        console.log('✅ 아이템 삭제 테스트 통과');
    });

    test('8. 여러 아이템 중 특정 아이템 삭제', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 여러 아이템 추가
        for (const item of ['첫번째', '두번째', '세번째']) {
            await input.fill(item);
            await addButton.click();
        }

        // 두번째 아이템(중간) 삭제
        const deleteButtons = page.locator('.delete-btn');
        await deleteButtons.nth(1).click();

        // 나머지 아이템 확인
        const listItems = page.locator('.item-text');
        await expect(listItems).toHaveCount(2);
        await expect(listItems.nth(0)).toHaveText('세번째');
        await expect(listItems.nth(1)).toHaveText('첫번째');

        console.log('✅ 특정 아이템 삭제 테스트 통과');
    });

    test('9. 빈 입력 방지', async ({ page }) => {
        const addButton = page.locator('button:has-text("추가")');

        // 빈 상태에서 추가 시도
        await addButton.click();

        // 아이템이 추가되지 않았는지 확인
        await expect(page.locator('.list-item')).toHaveCount(0);
        await expect(page.locator('.empty-state')).toBeVisible();

        console.log('✅ 빈 입력 방지 테스트 통과');
    });

    test('10. localStorage 데이터 유지', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 추가
        await input.fill('저장 테스트');
        await addButton.click();

        // 페이지 새로고침
        await page.reload();

        // 데이터가 유지되는지 확인
        await expect(page.locator('.item-text').first()).toHaveText('저장 테스트');

        console.log('✅ localStorage 데이터 유지 테스트 통과');
    });

    test('11. 체크 상태 유지 (새로고침 후)', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // 아이템 추가 및 체크
        await input.fill('체크 유지 테스트');
        await addButton.click();
        await page.locator('.checkbox').first().click();

        // 새로고침
        await page.reload();

        // 체크 상태 유지 확인
        await expect(page.locator('.list-item').first()).toHaveClass(/checked/);

        console.log('✅ 체크 상태 유지 테스트 통과');
    });

    test('12. XSS 방지 테스트', async ({ page }) => {
        const input = page.locator('#itemInput');
        const addButton = page.locator('button:has-text("추가")');

        // XSS 공격 시도
        const xssPayload = '<script>alert("xss")</script>';
        await input.fill(xssPayload);
        await addButton.click();

        // 스크립트가 실행되지 않고 텍스트로 표시되는지 확인
        await expect(page.locator('.item-text').first()).toHaveText(xssPayload);

        console.log('✅ XSS 방지 테스트 통과');
    });
});
