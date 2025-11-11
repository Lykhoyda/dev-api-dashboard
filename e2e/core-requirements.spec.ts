import { expect, test } from '@playwright/test';

/**
 * Core Requirements E2E Test
 *
 * Validates all required functionality per challenge requirements:
 * - Guest sign-in
 * - Create API key
 * - Revoke API key
 * - Feature flag toggles UI
 * - Usage chart visible with data
 * - Empty state
 */

test.describe('Core Requirements', () => {
	test('should validate all required features', async ({ page }) => {
		// ========================================
		// 1. GUEST SIGN-IN
		// ========================================
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.goto('/login');

		await page.getByRole('button', { name: /sign in as guest/i }).click();
		await expect(page).toHaveURL('/');
		await expect(
			page.getByRole('heading', { name: /welcome back/i })
		).toBeVisible();

		// ========================================
		// 2. CREATE API KEY
		// ========================================
		await page.getByRole('link', { name: /api keys/i }).click();
		await expect(page).toHaveURL('/keys');

		// Click create button
		await page.getByRole('button', { name: /create api key/i }).click();

		// Wait for modal to appear
		await expect(
			page.getByRole('heading', { name: /create api key/i })
		).toBeVisible();

		// Fill in the name field (first text input in the modal)
		const nameField = page.getByLabel(/name/i);
		await nameField.fill('E2E Test Key');

		// Click create button in modal (wait for it to be enabled)
		const createButton = page.getByRole('button', { name: /create key/i });
		await expect(createButton).toBeEnabled();
		await createButton.click();

		// Wait for success state (Done button appears)
		await expect(page.getByRole('button', { name: /done/i })).toBeVisible({
			timeout: 10000
		});
		await page.getByRole('button', { name: /done/i }).click();

		// Wait for modal to close and verify key appears in table
		await expect(
			page.getByRole('heading', { name: /create api key/i })
		).not.toBeVisible();
		await expect(page.getByText('E2E Test Key')).toBeVisible();

		// ========================================
		// 3. REVOKE API KEY
		// ========================================
		// Find the key we just created and revoke it
		const actionsButtons = page.getByRole('button', { name: /open menu/i });
		await actionsButtons.first().click();

		await page.getByRole('menuitem', { name: /revoke/i }).click();

		// Confirm revocation
		await page.getByRole('button', { name: /revoke key/i }).click();

		// Wait for dialog to close and verify revoked status appears
		await expect(page.getByRole('alertdialog')).not.toBeVisible();
		const revokedBadges = page.getByText(/revoked/i);
		await expect(revokedBadges.first()).toBeVisible();

		// ========================================
		// 3B. DELETE REVOKED API KEY
		// ========================================
		// Now delete the revoked key to test delete flow
		await actionsButtons.first().click();
		await page.getByRole('menuitem', { name: /delete/i }).click();

		// Confirm deletion
		await page.getByRole('button', { name: /delete key/i }).click();

		// Wait for dialog to close and verify key is removed from table
		await expect(page.getByRole('alertdialog')).not.toBeVisible();

		// Check that the table no longer has a row with this key
		const tableRows = page.getByRole('table').getByRole('row');
		const keyRow = tableRows.filter({ hasText: 'E2E Test Key' });
		await expect(keyRow).toHaveCount(0);

		// ========================================
		// 4. FEATURE FLAG TOGGLES UI
		// ========================================
		await page.getByRole('link', { name: /dashboard/i }).click();

		// Find and toggle feature flag
		const featureToggle = page.getByRole('switch', {
			name: /toggle card view/i
		});
		await expect(featureToggle).toBeVisible();

		// Check initial state is off
		await expect(featureToggle).toHaveAttribute('aria-checked', 'false');

		// Toggle on
		await featureToggle.click();
		await expect(featureToggle).toHaveAttribute('aria-checked', 'true');

		// Navigate to API Keys to verify UI changed
		await page.getByRole('link', { name: /api keys/i }).click();

		// Verify card view is active (table should not be visible)
		await expect(page.getByRole('table')).not.toBeVisible();
		// Verify API key cards are displayed instead
		await expect(
			page
				.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
				.first()
		).toBeVisible();

		// Toggle back off
		await page.getByRole('link', { name: /dashboard/i }).click();
		await featureToggle.click();
		await expect(featureToggle).toHaveAttribute('aria-checked', 'false');

		// Verify table view restored
		await page.getByRole('link', { name: /api keys/i }).click();
		await expect(page.getByRole('table')).toBeVisible();

		// ========================================
		// 5. USAGE CHART VISIBLE WITH DATA
		// ========================================
		await page.getByRole('link', { name: /usage/i }).click();
		await expect(page).toHaveURL('/usage');

		// Verify page loaded
		await expect(
			page.getByRole('heading', { name: /usage analytics/i })
		).toBeVisible();

		// Verify stats cards (use exact text to avoid matching multiple elements)
		await expect(
			page.getByText('Total Requests', { exact: true })
		).toBeVisible();
		await expect(page.getByText('Success Rate', { exact: true })).toBeVisible();

		// Verify chart exists (Recharts uses SVG)
		const chartSvg = page.locator('svg').first();
		await expect(chartSvg).toBeVisible();

		// Verify chart has actual data (path elements)
		const chartPaths = page.locator('svg path');
		await expect(chartPaths.first()).toBeVisible();

		// Test time range filter works
		await page.getByRole('button', { name: /7 days/i }).click();
		await expect(
			page.getByText('Total Requests', { exact: true })
		).toBeVisible();

		// ========================================
		// 6. EMPTY STATE
		// ========================================
		// Clear localStorage to trigger empty state
		await page.evaluate(() => localStorage.removeItem('api_keys'));

		// Navigate to API keys page to see empty state
		await page.getByRole('link', { name: /api keys/i }).click();

		// Verify empty state appears
		await expect(page.getByText('No API keys yet')).toBeVisible();
		await expect(
			page.getByText(/get started by creating your first api key/i)
		).toBeVisible();

		// Verify create button exists (both in header and empty state)
		await expect(
			page.getByRole('button', { name: /create api key/i }).first()
		).toBeVisible();

		// ========================================
		// CLEANUP: Sign out
		// ========================================
		await page.getByRole('button', { name: /sign out/i }).click();
		await expect(page).toHaveURL('/login');
	});
});
