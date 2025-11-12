import { test, expect } from '@playwright/test'

test.describe('AgeFilterBox E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tax calculator page
    await page.goto('http://localhost:6461/tax-calculator')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display age filter box on tax calculator page', async ({ page }) => {
    // Check if age filter box is visible
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    await expect(ageFilterButton).toBeVisible()
    
    // Should show default selection
    await expect(page.getByText('Below 60 years')).toBeVisible()
    await expect(page.getByText('Standard tax slabs')).toBeVisible()
  })

  test('should open dropdown when clicked', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Click to open
    await ageFilterButton.click()
    
    // Dropdown should be visible
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    
    // All three options should be visible
    await expect(page.getByRole('option', { name: /Below 60 years/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /60 - 80 years/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /Above 80 years/i })).toBeVisible()
  })

  test('should select senior citizen age group', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Open dropdown
    await ageFilterButton.click()
    
    // Select senior citizen option
    await page.getByRole('option', { name: /60 - 80 years/i }).click()
    
    // Dropdown should close
    await expect(page.getByRole('listbox')).not.toBeVisible()
    
    // Button should show selected value
    await expect(page.getByText('60 - 80 years')).toBeVisible()
    await expect(page.getByText('Senior citizen benefits')).toBeVisible()
  })

  test('should select super senior citizen age group', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Open dropdown
    await ageFilterButton.click()
    
    // Select super senior citizen option
    await page.getByRole('option', { name: /Above 80 years/i }).click()
    
    // Button should show selected value
    await expect(page.getByText('Above 80 years')).toBeVisible()
    await expect(page.getByText('Super senior citizen benefits')).toBeVisible()
  })

  test('should navigate with keyboard', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Focus the button
    await ageFilterButton.focus()
    
    // Open with Enter key
    await page.keyboard.press('Enter')
    
    // Listbox should be visible
    await expect(page.getByRole('listbox')).toBeVisible()
    
    // Navigate down with arrow key
    await page.keyboard.press('ArrowDown')
    
    // Select with Enter
    await page.keyboard.press('Enter')
    
    // Should have selected the second option (60-80)
    await expect(page.getByText('60 - 80 years')).toBeVisible()
  })

  test('should close dropdown with Escape key', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Open dropdown
    await ageFilterButton.click()
    await expect(page.getByRole('listbox')).toBeVisible()
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Dropdown should close
    await expect(page.getByRole('listbox')).not.toBeVisible()
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Open dropdown
    await ageFilterButton.click()
    await expect(page.getByRole('listbox')).toBeVisible()
    
    // Click outside (on the page heading)
    await page.getByText('Basic Details').click()
    
    // Dropdown should close
    await expect(page.getByRole('listbox')).not.toBeVisible()
  })

  test('should update form state and enable continue button', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Select age group
    await ageFilterButton.click()
    await page.getByRole('option', { name: /60 - 80 years/i }).click()
    
    // Continue button should be enabled (assuming FY is already selected)
    const continueButton = page.getByRole('button', { name: /continue/i })
    await expect(continueButton).toBeEnabled()
  })

  test('should persist selection when navigating steps', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Select senior citizen
    await ageFilterButton.click()
    await page.getByRole('option', { name: /60 - 80 years/i }).click()
    
    // Navigate to next step
    const continueButton = page.getByRole('button', { name: /continue/i })
    await continueButton.click()
    
    // Wait for next step to load
    await page.waitForTimeout(500)
    
    // Navigate back
    const backButton = page.getByRole('button', { name: /back/i })
    await backButton.click()
    
    // Selection should persist
    await expect(page.getByText('60 - 80 years')).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Should be visible and clickable on mobile
    await expect(ageFilterButton).toBeVisible()
    
    // Open dropdown
    await ageFilterButton.click()
    
    // Dropdown should be visible
    await expect(page.getByRole('listbox')).toBeVisible()
    
    // Select option
    await page.getByRole('option', { name: /60 - 80 years/i }).click()
    
    // Should show selected value
    await expect(page.getByText('60 - 80 years')).toBeVisible()
  })

  test('should have proper focus management', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Tab to focus the button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // May need multiple tabs depending on page structure
    
    // Check if button has focus (visible focus ring)
    await expect(ageFilterButton).toBeFocused()
    
    // Open with Space
    await page.keyboard.press('Space')
    
    // Listbox should be visible
    await expect(page.getByRole('listbox')).toBeVisible()
  })

  test('should show check icon for selected option', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Open dropdown
    await ageFilterButton.click()
    
    // First option should have check icon (default selection)
    const firstOption = page.getByRole('option', { name: /Below 60 years/i })
    
    // Check if option has aria-selected="true"
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')
  })

  test('should handle rapid clicks gracefully', async ({ page }) => {
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    // Rapid clicks
    await ageFilterButton.click()
    await ageFilterButton.click()
    await ageFilterButton.click()
    
    // Should still work correctly (either open or closed, but not broken)
    // Final state should be consistent
    await page.waitForTimeout(300)
    
    // Try to select an option
    const listboxVisible = await page.getByRole('listbox').isVisible()
    if (!listboxVisible) {
      await ageFilterButton.click()
    }
    
    await page.getByRole('option', { name: /60 - 80 years/i }).click()
    await expect(page.getByText('60 - 80 years')).toBeVisible()
  })

  test('should pass accessibility audit', async ({ page }) => {
    // This test requires @axe-core/playwright
    // Uncomment when axe is installed
    
    // const { injectAxe, checkA11y } = require('axe-playwright')
    // await injectAxe(page)
    // await checkA11y(page, null, {
    //   detailedReport: true,
    //   detailedReportOptions: { html: true }
    // })
    
    // For now, just check basic ARIA attributes
    const ageFilterButton = page.getByRole('button', { name: /select age group/i })
    
    await expect(ageFilterButton).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(ageFilterButton).toHaveAttribute('aria-expanded', 'false')
    
    await ageFilterButton.click()
    await expect(ageFilterButton).toHaveAttribute('aria-expanded', 'true')
  })
})
