
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: "./videos/", size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  page.on("dialog", dialog => {
    dialog.accept();
  });

  const baseUrl = "http://localhost:3000";

  try {
    // 1. PUBLIC BOOKING
    await page.goto(`${baseUrl}/book`);
    await page.waitForTimeout(2000);
    await page.locator("button.group").first().click();
    await page.waitForTimeout(1500);
    await page.locator("h3:has-text(\"Dr.\")").first().click();
    await page.waitForTimeout(1500);
    await page.fill("input[type=\"text\"]", "Mega Demo Patient");
    await page.fill("input[type=\"tel\"]", "8888888888");
    await page.fill("input[type=\"date\"]", "2026-10-10");
    await page.selectOption("select", "10:00 AM");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(4000);

    // 2. DOCTOR DASHBOARD
    await page.goto(`${baseUrl}/staff`);
    await page.waitForTimeout(1500);
    await page.fill("input[type=\"email\"]", "dr.smith@clinic.com");
    await page.fill("input[type=\"password\"]", "doctor123");
    await page.click("button[type=\"submit\"]");
    
    // IMPORTANT: Wait for queue to load
    await page.waitForTimeout(5000); 
    
    // Select the patient
    const patientBtn = page.locator("button:has-text(\"Mega Demo Patient\")").first();
    if (await patientBtn.isVisible()) {
        await patientBtn.click();
        await page.waitForTimeout(1500);
        await page.fill("input[placeholder=\"120\"]", "120");
        await page.fill("input[placeholder=\"80\"]", "80");
        await page.fill("input[placeholder=\"72\"]", "75");
        await page.fill("input[placeholder=\"65.5\"]", "70");
        await page.fill("input[placeholder=\"98.6\"]", "99");
        await page.fill("input[placeholder=\"e.g. Fever, Headache for 2 days...\"]", "High Fever");
        await page.fill("textarea", "Patient requires 3 days rest and antibiotics.");
        await page.click("button:has-text(\"Complete Consultation\")");
        await page.waitForTimeout(4000);
    }

    // 3. RECEPTIONIST DASHBOARD
    await page.goto(`${baseUrl}/reception`);
    await page.waitForTimeout(4000); // wait for fetch
    
    const collectBtn = page.locator("button:has-text(\"Collect\")").first();
    if (await collectBtn.isVisible()) {
        await collectBtn.click();
        await page.waitForTimeout(3000);
    }

    // 4. PATIENT PORTAL
    await page.goto(`${baseUrl}/health`);
    await page.waitForTimeout(1500);
    await page.fill("input[type=\"text\"]", "PAT-1001");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(4000);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await context.close();
    await browser.close();
    
    const videosDir = path.resolve("./videos");
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith(".webm") && !f.includes("Perfect"));
    if (files.length > 0) {
      files.sort((a, b) => fs.statSync(path.join(videosDir, b)).mtime.getTime() - fs.statSync(path.join(videosDir, a)).mtime.getTime());
      const latestVideo = path.join(videosDir, files[0]);
      const targetVideo = path.join(videosDir, "Perfect_ClinicOS_Demo.webm");
      if (fs.existsSync(targetVideo)) fs.unlinkSync(targetVideo);
      fs.renameSync(latestVideo, targetVideo);
    }
  }
})();

