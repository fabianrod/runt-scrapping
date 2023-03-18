import puppeteer from 'puppeteer';
import Captcha from "2captcha";
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 10 });
  const page = await browser.newPage();
  const solver = new Captcha.Solver("API_KEY_HERE");

  // Step 1: Enter to the site and capture the captcha image
  await page.goto('https://www.runt.com.co/consultaCiudadana/#/consultaPersona', {  waitUntil: "domcontentloaded", });
  await page.waitForSelector('#imgCaptcha', { timeout: 5000 });
  const element = await page.$("#imgCaptcha");
  await element.screenshot({"path": "./captcha.png", "type": "png"});

  // Step 2: Call 2Captcha API to solve the captcha
  let text = await solver.imageCaptcha(fs.readFileSync("./captcha.png", "base64"))
  .then((res) => res.data);

  // Step 3: Put the text of solved captcha in the input field
  await page.waitForSelector('input[name="captcha"]', { timeout: 2000 });
  await page.focus('input[name="captcha"]');
  await page.type('input[name="captcha"]', text);


  // Step 4: Choose the type of document, in Colombia is "Cédula de ciudadania"
  await page.waitForSelector('select.form-control');
  await page.select('select.form-control', 'C');
  await page.waitForSelector('input[name=noDocumento]');

  // Step 5: Set the ID of the person in the "Nro. de documento de propietario" field
  await page.type('input[name=noDocumento]', '1110479792', { delay: 100 });
  await setTimeout(async () => {
    await page.click('button[type=submit]', { clickCount: 1, delay: 1000});
    await page.waitForNetworkIdle();
  }, 1000);


  // Step 6: I need to arrive to this view to extract the data.
  
  /*await page.waitForSelector('div[ng-show="verResultado"] label', { timeout: 30000 });
  await page.waitForTimeout(5000);
  let data = await page.evaluate(() => {
    let labels = document.querySelectorAll('div[ng-show="verResultado"] label');
    let values = document.querySelectorAll('.show-grande');
    let data = {};
    values.forEach((value) => {
      console.log(value)
    });
  });*/

})();