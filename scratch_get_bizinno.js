const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Launching Edge...");
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true,
      args: ['--disable-gpu', '--no-sandbox']
    });
  } catch (e) {
    console.error("Failed to launch Edge, trying Chrome paths...", e.message);
    try {
      browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--disable-gpu', '--no-sandbox']
      });
    } catch (err) {
      console.error("Failed to launch Chrome:", err.message);
      process.exit(1);
    }
  }
  
  try {
    const page = await browser.newPage();
    console.log("Navigating to Bizinno...");
    await page.goto('https://www.bizinno.kr/?accounts=5', { waitUntil: 'networkidle2', timeout: 45000 });
    
    console.log("Waiting 6 seconds for client-side API requests to populate page 1...");
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // Function to extract products from current page view
    const extractProducts = async () => {
      return await page.evaluate(() => {
        const list = [];
        const cardElements = document.querySelectorAll('a[href*="/product/"]');
        
        cardElements.forEach((card) => {
          const href = card.getAttribute('href');
          
          // Image
          const imgEl = card.querySelector('img');
          const thumbnail = imgEl ? imgEl.getAttribute('src') : '';
          
          // Product Name
          const h3El = card.querySelector('h3');
          const name = h3El ? h3El.textContent.trim() : '';
          
          // Model
          const pEl = card.querySelector('p.truncate');
          const model = pEl ? pEl.textContent.trim() : '';
          
          // Plan
          const spanEl = card.querySelector('span.bg-navy');
          const plan = spanEl ? spanEl.textContent.trim() : '';
          
          if (name && thumbnail) {
            // Avoid duplicate additions
            const isDuplicate = list.some(item => item.model === model && item.name === name);
            if (!isDuplicate) {
              list.push({
                name,
                model,
                thumbnail,
                plan,
                href
              });
            }
          }
        });
        
        return list;
      });
    };
    
    console.log("Extracting products from Page 1...");
    const page1Products = await extractProducts();
    console.log(`Extracted ${page1Products.length} products from Page 1.`);
    
    // Find page 2 button and click it
    console.log("Finding Page 2 button...");
    const buttons = await page.$$('button');
    let page2Btn;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text === '2') {
        page2Btn = btn;
        break;
      }
    }
    
    let allProducts = [...page1Products];
    
    if (page2Btn) {
      console.log("Clicking Page 2 button using page.evaluate...");
      await page.evaluate(el => el.click(), page2Btn);
      
      console.log("Waiting 7 seconds for page 2 load and DOM update...");
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      console.log("Current URL after click:", page.url());
      
      // Let's save page 2 HTML to check if it actually changed
      const p2Content = await page.content();
      fs.writeFileSync(path.join(__dirname, 'rendered_page_2.html'), p2Content);
      console.log("Saved page 2 rendered DOM to rendered_page_2.html");
      
      console.log("Extracting products from Page 2...");
      const page2Products = await extractProducts();
      console.log(`Extracted ${page2Products.length} products from Page 2.`);
      
      // Merge unique
      page2Products.forEach(p => {
        if (!allProducts.some(existing => existing.model === p.model && existing.name === p.name)) {
          allProducts.push(p);
        }
      });
    } else {
      console.warn("Could not find Page 2 button!");
    }
    
    console.log(`Total products extracted: ${allProducts.length}`);
    
    const outputData = {
      productsCount: allProducts.length,
      products: allProducts
    };
    
    const brainJsonPath = 'C:\\Users\\FORYOUCOM\\.gemini\\antigravity\\brain\\cbe46bd3-7034-4d59-9f58-04727e4f393b\\scratch\\puppeteer_products.json';
    fs.writeFileSync(brainJsonPath, JSON.stringify(outputData, null, 2));
    fs.writeFileSync(path.join(__dirname, 'puppeteer_products.json'), JSON.stringify(outputData, null, 2));
    console.log("Saved extracted JSON data to scratch and workspace.");
    
  } catch (err) {
    console.error("Error during scraping:", err.message);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
})();

