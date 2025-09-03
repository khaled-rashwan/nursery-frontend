from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/en-US/teacher-portal")

    # Wait for the student roster to load
    page.wait_for_selector('div[style*="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"]')

    # Find the first student and click on them
    first_student = page.locator('div[style*="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"] > div').first
    first_student.click()

    # Wait for the report card modal to appear
    page.wait_for_selector('div[style*="max-width: 600px"]')

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
