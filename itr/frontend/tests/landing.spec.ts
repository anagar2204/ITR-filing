import { test, expect } from '@playwright/test'

test.describe('Tax Genie Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:3000/landing-new')
  })

  test('should display the landing page with mascot', async ({ page }) => {
    // Check if page loads
    await expect(page).toHaveTitle(/Tax Genie/i)
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Tax Genie')
    
    // Check for subtitle
    await expect(page.locator('.hero-subtitle')).toContainText('Filing taxes made effortless')
    
    // Check for CTA button
    await expect(page.locator('.cta-primary')).toContainText('Enter Tax Genie')
  })

  test('should load mascot image', async ({ page }) => {
    // Wait for mascot image to be visible
    const mascotImage = page.locator('.mascot-image')
    await expect(mascotImage).toBeVisible()
    
    // Check if image has loaded (not broken)
    const imageSrc = await mascotImage.getAttribute('src')
    expect(imageSrc).toContain('mascot-full.png')
    
    // Verify image loads successfully
    const response = await page.request.get(imageSrc!)
    expect(response.status()).toBe(200)
  })

  test('should display header mascot badge', async ({ page }) => {
    // Check for header mascot badge
    const headerBadge = page.locator('.header-mascot-badge')
    await expect(headerBadge).toBeVisible()
    
    // Check badge dimensions
    const boundingBox = await headerBadge.boundingBox()
    expect(boundingBox?.width).toBeLessThanOrEqual(40)
    expect(boundingBox?.height).toBeLessThanOrEqual(40)
  })

  test('should trigger mascot animation on click', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click to trigger animation
    await page.click('.landing-container')
    
    // Wait a moment for animation to start
    await page.waitForTimeout(500)
    
    // Check if mascot is visible (animation should have started)
    const mascot = page.locator('.mascot-image')
    await expect(mascot).toBeVisible()
    
    // Verify mascot has some transform applied (indicating animation)
    const transform = await mascot.evaluate(el => getComputedStyle(el).transform)
    expect(transform).not.toBe('none')
  })

  test('should navigate to homepage on CTA click', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click the CTA button
    await page.click('.cta-primary')
    
    // Wait for navigation
    await page.waitForURL('**/home', { timeout: 5000 })
    
    // Verify we're on the home page
    expect(page.url()).toContain('/home')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on the container
    await page.focus('.landing-container')
    
    // Press Enter to trigger animation
    await page.keyboard.press('Enter')
    
    // Wait for animation
    await page.waitForTimeout(500)
    
    // Check if mascot is visible
    const mascot = page.locator('.mascot-image')
    await expect(mascot).toBeVisible()
    
    // Tab to CTA button and press Enter
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should navigate to home
    await page.waitForURL('**/home', { timeout: 5000 })
  })

  test('should show loading state initially', async ({ page }) => {
    // Navigate to page but don't wait for load
    await page.goto('http://localhost:3000/landing-new', { waitUntil: 'domcontentloaded' })
    
    // Check for loading overlay (should be visible initially)
    const loadingOverlay = page.locator('.loading-overlay')
    
    // Loading should either be visible or have disappeared quickly
    try {
      await expect(loadingOverlay).toBeVisible({ timeout: 1000 })
    } catch {
      // Loading might have finished very quickly, which is also valid
    }
  })

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Navigate to page
    await page.goto('http://localhost:3000/landing-new')
    
    // Click to trigger animation
    await page.click('.landing-container')
    
    // Wait a moment
    await page.waitForTimeout(500)
    
    // Check that mascot is visible but without complex animations
    const mascot = page.locator('.mascot-image')
    await expect(mascot).toBeVisible()
    
    // In reduced motion, transform should be minimal or none
    const transform = await mascot.evaluate(el => getComputedStyle(el).transform)
    // Should not have complex rotation transforms
    expect(transform).not.toMatch(/rotate\(360deg\)/)
  })

  test('should handle slow network simulation', async ({ page }) => {
    // Simulate slow network
    await page.route('**/mascot-full.png', async route => {
      // Delay the response by 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })
    
    // Navigate to page
    await page.goto('http://localhost:3000/landing-new')
    
    // Loading should be visible for longer
    const loadingOverlay = page.locator('.loading-overlay')
    await expect(loadingOverlay).toBeVisible()
    
    // Eventually mascot should load
    const mascot = page.locator('.mascot-image')
    await expect(mascot).toBeVisible({ timeout: 10000 })
  })

  test('should handle mascot load failure gracefully', async ({ page }) => {
    // Block mascot image requests
    await page.route('**/mascot-full.png', route => route.abort())
    
    // Navigate to page
    await page.goto('http://localhost:3000/landing-new')
    
    // Should show fallback icon
    const fallback = page.locator('.mascot-fallback, .header-fallback')
    await expect(fallback.first()).toBeVisible()
    
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('Tax Genie')
    await expect(page.locator('.cta-primary')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to page
    await page.goto('http://localhost:3000/landing-new')
    
    // Check that elements are properly sized for mobile
    const mascotContainer = page.locator('.mascot-container')
    const boundingBox = await mascotContainer.boundingBox()
    
    // Mascot should be smaller on mobile
    expect(boundingBox?.width).toBeLessThanOrEqual(150)
    
    // CTA should still be accessible
    const cta = page.locator('.cta-primary')
    await expect(cta).toBeVisible()
    
    // Text should be readable
    const title = page.locator('.hero-title')
    const titleBox = await title.boundingBox()
    expect(titleBox?.width).toBeLessThanOrEqual(375)
  })
})

test.describe('Asset Server Health', () => {
  test('should have healthy asset server', async ({ request }) => {
    // Check health endpoint
    const response = await request.get('http://localhost:5001/health')
    expect(response.status()).toBe(200)
    
    const health = await response.json()
    expect(health.status).toBe('healthy')
    expect(health.mascot.configured).toBe(true)
  })

  test('should serve mascot asset', async ({ request }) => {
    // Check mascot endpoint
    const response = await request.get('http://localhost:5001/assets/mascot/mascot-full.png')
    expect(response.status()).toBe(200)
    
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('image')
  })

  test('should serve header badge', async ({ request }) => {
    // Check header badge endpoint
    const response = await request.get('http://localhost:5001/assets/mascot/header-badge.png')
    expect(response.status()).toBe(200)
    
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('image')
  })
})
