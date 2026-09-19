
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

(async () => {
  console.log("Starting Full Flow Recording...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: "./videos/", size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Auto-accept all alerts
  page.on("dialog", dialog => {
    console.log("Dialog accepted: ", dialog.message());
    dialog.accept();
  });

  const baseUrl = "http://localhost:3000";

  try {
    // 1. PUBLIC BOOKING
    console.log("-> 1. Public Booking...");
    await page.goto(`${baseUrl}/book`);
    await page.waitForTimeout(2000);
    // Click hospital
    await page.locator("button.group").first().click();
    await page.waitForTimeout(1000);
    // Click doctor
    await page.locator("h3:has-text(\"Dr.\")").first().click();
    await page.waitForTimeout(1000);
    // Fill form
    await page.fill("input[type=\"text\"]", "VIP Patient Demo");
    await page.fill("input[type=\"tel\"]", "9999999999");
    await page.fill("input[type=\"date\"]", "2026-10-10");
    await page.selectOption("select", "10:00 AM");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(4000);

    // 2. DOCTOR DASHBOARD
    console.log("-> 2. Doctor Dashboard...");
    await page.goto(`${baseUrl}/staff`);
    await page.waitForTimeout(1500);
    // Login
    await page.fill("input[type=\"email\"]", "dr.smith@clinic.com");
    await page.fill("input[type=\"password\"]", "doctor123");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(3000);
    // Click patient in queue
    await page.locator("button:has-text(\"VIP Patient Demo\")").first().click();
    await page.waitForTimeout(1500);
    // Fill vitals
    await page.fill("input[placeholder=\"120\"]", "120");
    await page.fill("input[placeholder=\"80\"]", "80");
    await page.fill("input[placeholder=\"72\"]", "75");
    await page.fill("input[placeholder=\"65.5\"]", "70");
    await page.fill("input[placeholder=\"98.6\"]", "99");
    await page.fill("input[placeholder=\"e.g. Fever, Headache for 2 days...\"]", "High Fever");
    await page.fill("textarea", "Patient requires 3 days rest and antibiotics.");
    await page.click("button:has-text(\"Complete Consultation\")");
    await page.waitForTimeout(3000);

    // 3. RECEPTIONIST BILLING
    console.log("-> 3. Receptionist Dashboard...");
    await page.goto(`${baseUrl}/reception`);
    await page.waitForTimeout(2000);
    // Collect Payment
    await page.locator("button:has-text(\"Collect\")").first().click();
    await page.waitForTimeout(3000);

    // 4. PATIENT PORTAL
    console.log("-> 4. Patient Portal...");
    await page.goto(`${baseUrl}/health`);
    await page.waitForTimeout(1500);
    // Login to patient portal - We need the token generated. Since we hardcoded earlier, we can just use PAT-1001 to show history.
    await page.fill("input[type=\"text\"]", "PAT-1001");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(4000);

  } catch (err) {
    console.error("Error during recording:", err);
  } finally {
    console.log("Saving video...");
    await context.close();
    await browser.close();
    
    const videosDir = path.resolve("./videos");
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith(".webm") && !f.includes("demo_video"));
    if (files.length > 0) {
      files.sort((a, b) => fs.statSync(path.join(videosDir, b)).mtime.getTime() - fs.statSync(path.join(videosDir, a)).mtime.getTime());
      const latestVideo = path.join(videosDir, files[0]);
      const targetVideo = path.join(videosDir, "Full_Hospital_Flow_Demo.webm");
      if (fs.existsSync(targetVideo)) fs.unlinkSync(targetVideo);
      fs.renameSync(latestVideo, targetVideo);
      console.log("Video saved at: " + targetVideo);
    }
  }
})();

