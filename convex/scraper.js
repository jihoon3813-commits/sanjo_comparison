"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

// Convex action to scrape product data from a given URL
export const scrapeProducts = action({
  args: {
    urls: v.array(v.string()),
    accounts: v.optional(v.number()),
    planName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const allProducts = [];
    const errors = [];

    for (const url of args.urls) {
      try {
        const products = await scrapeOneUrl(url, args.accounts, args.planName);
        allProducts.push(...products);
      } catch (err) {
        errors.push({ url, error: err.message || String(err) });
      }
    }

    return { products: allProducts, errors };
  },
});

async function scrapeOneUrl(rawUrl, accountsOverride, planName) {
  // Normalize URL
  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace("www.", "");

  // Route to the appropriate parser based on domain
  if (hostname.includes("bizinno")) {
    // Parse accounts and page query parameters
    let accountsVal = urlObj.searchParams.get("accounts");
    if (!accountsVal) {
      const matchAcc = url.match(/accounts=(\d+)/i);
      if (matchAcc) accountsVal = matchAcc[1];
    }
    let pageVal = urlObj.searchParams.get("page");
    if (!pageVal) {
      const matchPage = url.match(/page=(\d+)/i);
      if (matchPage) pageVal = matchPage[1];
    }

    let dbAccounts = null;
    if (accountsVal) {
      dbAccounts = parseInt(accountsVal);
    } else {
      const accounts = accountsOverride !== undefined ? accountsOverride : 1;
      const name = planName || "";
      if (name.includes("스마트케어4")) {
        if (accounts === 2) dbAccounts = 2;
      } else if (name.includes("스마트케어5")) {
        if (accounts === 1) dbAccounts = 5;
        else if (accounts === 2) dbAccounts = 3;
        else if (accounts === 3) dbAccounts = 4;
        else if (accounts === 4) dbAccounts = 6;
      } else {
        dbAccounts = accounts;
      }
    }

    const page = pageVal ? parseInt(pageVal) : null;

    return fetchBizinnoFromSupabase(dbAccounts, page);
  }

  if (hostname.includes("lifenuri")) {
    return fetchLifenuriProducts(url, accountsOverride);
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  // Generic fallback parser: try to extract product-like data from any page
  return parseGenericHtml(html, url);
}

async function fetchLifenuriProducts(url, accountsOverride) {
  const groupMatch = url.match(/themesgroup\/(\d+)/i);
  const groupNo = groupMatch ? parseInt(groupMatch[1]) : null;

  try {
    // 1. Fetch raw HTML page to find themeNo (themes_no)
    const resHtml = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!resHtml.ok) {
      throw new Error(`라이프누리 페이지 접속 실패: ${resHtml.statusText}`);
    }

    const html = await resHtml.text();
    
    // Extract theme ID using regex
    const themeNoMatch = html.match(/first_theme\s*=\s*['"]?(\d+)['"]?/i) || 
                         html.match(/onclick="listdata\('(\d+)'\);?"/i) ||
                         html.match(/listdata\('(\d+)'\)/i);
    const themeNo = themeNoMatch ? themeNoMatch[1] : null;

    if (!themeNo) {
      throw new Error("라이프누리 페이지에서 테마 ID를 찾을 수 없습니다.");
    }

    // 2. Fetch product list via POST API
    const listRes = await fetch(`https://boram.lifenuri.com/shop/themes/${themeNo}/list`, {
      method: "POST",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": url,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: `actions=goods&themes_no=${themeNo}`
    });

    if (!listRes.ok) {
      throw new Error(`라이프누리 API 호출 실패: ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    if (listData.return_code !== 1000) {
      throw new Error(`라이프누리 API 에러: ${listData.return_msg || "unknown"}`);
    }

    const rawProducts = listData.themeslistrow || [];
    return mapLifenuriRawProducts(rawProducts, accountsOverride);
  } catch (err) {
    console.warn(`Lifenuri scraper failed, falling back to pre-scraped cache for group ${groupNo}:`, err);
    if (groupNo && typeof LIFENURI_FALLBACK_DATA !== 'undefined' && LIFENURI_FALLBACK_DATA[groupNo]) {
      const acc = accountsOverride !== undefined ? accountsOverride : 1;
      let plan = "스마트케어5싱글";
      if (acc === 2) plan = "스마트케어4더블";
      else if (acc === 3) plan = "스마트케어5트리플";
      else if (acc === 4) plan = "스마트케어5쿼드";

      return LIFENURI_FALLBACK_DATA[groupNo].map(p => ({
        name: p.name,
        modelName: p.modelName,
        categoryId: p.categoryId,
        description: `${p.name} (${p.modelName}) - 결합 상조상품: ${plan}`,
        thumbnail: p.thumbnail,
        href: p.href,
        plan: plan
      }));
    }
    throw err;
  }
}

function mapLifenuriRawProducts(rawProducts, accountsOverride) {
  return rawProducts.map(p => {
    const name = p.goods_title || "";
    const modelName = p.goods_info_model || "";
    const thumbnail = p.goods_image_main2 || "";
    const goodsCode = p.goods_code || "";
    
    // Determine category based on name
    let categoryId = "general";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("tv") || nameLower.includes("티비") || nameLower.includes("모니터")) categoryId = "tv";
    else if (nameLower.includes("냉장고")) categoryId = "fridge";
    else if (nameLower.includes("세탁기")) categoryId = "washer";
    else if (nameLower.includes("건조기")) categoryId = "dryer";
    else if (nameLower.includes("에어컨")) categoryId = "aircon";
    else if (nameLower.includes("공기청정기")) categoryId = "airpurifier";
    else if (nameLower.includes("청소기")) categoryId = "cleaner";
    else if (nameLower.includes("의류관리기") || nameLower.includes("스타일러")) categoryId = "styler";
    else if (nameLower.includes("가구")) categoryId = "furniture";
    else if (nameLower.includes("노트북") || nameLower.includes("컴퓨터")) categoryId = "laptop";
    else if (nameLower.includes("정수기")) categoryId = "water";
    else if (nameLower.includes("안마의자")) categoryId = "massage";

    const acc = accountsOverride !== undefined ? accountsOverride : 1;
    let plan = "스마트케어5싱글";
    if (acc === 2) plan = "스마트케어4더블";
    else if (acc === 3) plan = "스마트케어5트리플";
    else if (acc === 4) plan = "스마트케어5쿼드";

    const desc = `${name} (${modelName}) - 결합 상조상품: ${plan}`;

    return {
      name,
      modelName,
      categoryId,
      description: desc,
      thumbnail,
      href: `https://boram.lifenuri.com/shop/products/${goodsCode}`,
      plan
    };
  });
}

async function fetchBizinnoFromSupabase(accounts, page) {
  const supabaseUrl = 'https://tvtpvecnjyjnvjhbozks.supabase.co/rest/v1/products?select=*';
  const response = await fetch(supabaseUrl, {
    headers: {
      'apikey': 'sb_publishable_bgd5nh-qDblE3CfK6SbJXw_brkDvmXC',
      'authorization': 'Bearer sb_publishable_bgd5nh-qDblE3CfK6SbJXw_brkDvmXC',
      'accept-profile': 'public'
    }
  });

  if (!response.ok) {
    throw new Error(`비즈인노 Supabase API 호출에 실패했습니다: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Filter by accounts if provided
  let filtered = data;
  if (accounts !== null) {
    filtered = data.filter(item => item['구좌수'] === accounts);
  }

  // Filter by 공개_여부 !== false
  filtered = filtered.filter(item => item['공개_여부'] !== false);

  // Sort by BIZINNO_MODEL_ORDER for accounts === 2
  if (accounts === 2) {
    const bizinnoOrder = [
      "FG21WNR", "T21GZ9", "HDW06MFW+HW12-BP4959LK-B", "WF21DG6650BW",
      "RS84DB5002CW", "RR70H39E10", "RQ70H32S10 코타화이트", "RZ70H32JN0",
      "50NA1C90AK 벽걸이/스탠드", "KU55MH75AFXKR 벽걸이", "KQ43LSD01AFXKR",
      "WPUIAC414S", "RH10VTA 모던 스테인리스",
      "MX0120BASR", "ROMO 로모 S", "CP-AMS100E", "CVC-DEM2540UG+CFD-EFF201DCNW 노블화이트",
      "CP-SS100WSV", "AC-20T10FWH+CFD-EFF201DCNW 노블화이트", "BBMW-120",
      "SW-42FX", "SE-5100", "MD3Y4KH/Asilver+JCP5428+JCP2723+JCP2602+ID716",
      "LC150KRBL+HD434KR+FA221KR", "LC150KRBL+TB201KR+FA221KR", "VS28D950ACB",
      "NZ63DB657CFH",
      "DF18CG3100TR(HR)", "AR60F11D11WS", "DV21DG8600BW", "SM-X626NZAAKOO",
      "BRAMS-S3800", "Qrevo Curv + H60", "SQRCUKR0N031", "IZZI", "GO+", "LIFT+",
      "X50s Pro Ultra", "L10s Heat/G10", "L30s Pro Ultra Heat/G10", "V12S+Carbonator 3",
      "세라믹파티나 토파즈+허쉬젯 컴팩트", "BBGS-122", "NCB354"
    ];

    const getCleanModel = s => (s || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanOrder = bizinnoOrder.map(getCleanModel);

    filtered.sort((a, b) => {
      const modelA = getCleanModel(a['모델명']);
      const modelB = getCleanModel(b['모델명']);
      
      let idxA = cleanOrder.findIndex(m => m === modelA || m.includes(modelA) || modelA.includes(m));
      let idxB = cleanOrder.findIndex(m => m === modelB || m.includes(modelB) || modelB.includes(m));
      
      if (idxA === -1) idxA = 9999;
      if (idxB === -1) idxB = 9999;
      
      return idxA - idxB;
    });
  } else {
    // Sort by 노출_순위 DESC for other accounts counts
    filtered.sort((a, b) => (b['노출_순위'] || 0) - (a['노출_순위'] || 0));
  }

  // If page is specified, apply pagination (page size of 14)
  if (page !== null) {
    const pageSize = 14;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    filtered = filtered.slice(start, end);
  }

  const results = filtered.map(item => {
    const name = item['제품명'] || '';
    const modelName = item['모델명'] || '';
    
    // Category mapping
    const catName = item['카테고리'] || '';
    let categoryId = 'general';
    if (catName.includes('TV') || catName.includes('티비')) categoryId = 'tv';
    else if (catName.includes('냉장고')) categoryId = 'fridge';
    else if (catName.includes('세탁기')) categoryId = 'washer';
    else if (catName.includes('건조기')) categoryId = 'dryer';
    else if (catName.includes('에어컨')) categoryId = 'aircon';
    else if (catName.includes('공기청정기')) categoryId = 'airpurifier';
    else if (catName.includes('청소기')) categoryId = 'cleaner';
    else if (catName.includes('의류관리기') || catName.includes('스타일러')) categoryId = 'styler';
    else if (catName.includes('가구')) categoryId = 'furniture';
    else if (catName.includes('노트북') || catName.includes('컴퓨터')) categoryId = 'laptop';
    else if (catName.includes('정수기')) categoryId = 'water';
    else if (catName.includes('안마의자')) categoryId = 'massage';

    const thumbnail = item['메인_썸네일(목록용)'] || '';
    const href = `/product/${encodeURIComponent(modelName)}?accounts=${accounts || item['구좌수'] || 1}`;
    
    const acc = item['구좌수'] || accounts || 1;
    let plan = '스마트케어5싱글';
    if (acc === 2) plan = '스마트케어4더블';
    else if (acc === 3) plan = '스마트케어5트리플';
    else if (acc === 4) plan = '스마트케어5쿼드';
    else if (acc === 5) plan = '스마트케어5싱글';
    else if (acc === 6) plan = '스마트케어5쿼드';

    const desc = `${name} (${modelName}) - 결합 상조상품: ${plan}`;

    return {
      name,
      modelName,
      categoryId,
      description: desc,
      thumbnail,
      href,
      plan
    };
  });

  if (results.length === 0) {
    throw new Error("비즈인노 데이터베이스에서 해당 조건의 상품을 찾을 수 없습니다.");
  }

  return results;
}

// ─── bizinno.kr parser ───
// bizinno uses Next.js SSR, product cards are rendered as:
// <a href="/product/MODEL?accounts=N">
//   <img alt="NAME" src="THUMBNAIL_URL">
//   <h3>NAME</h3>
//   <p class="... truncate">MODEL_NAME</p>
//   <span class="... bg-navy ...">PLAN_NAME</span>
// </a>
function parseBizinnoHtml(html, _sourceUrl) {
  const products = [];
  
  // Match product card anchors: <a ... href="/product/..."> ... </a>
  // Use a regex to find each product card block
  const cardRegex = /<a\s[^>]*href="\/product\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let cardMatch;

  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const cardHtml = cardMatch[0];
    const innerHtml = cardMatch[1];

    // Extract href
    const hrefMatch = cardHtml.match(/href="(\/product\/[^"]*)"/);
    const href = hrefMatch ? hrefMatch[1] : "";

    // Extract image (thumbnail) - support both attribute orders and fallback
    const imgMatch = innerHtml.match(
      /<img\s[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/i
    );
    const imgMatchAlt = innerHtml.match(
      /<img\s[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i
    );
    
    let name = "";
    let thumbnail = "";
    if (imgMatch) {
      name = imgMatch[1];
      thumbnail = imgMatch[2];
    } else if (imgMatchAlt) {
      thumbnail = imgMatchAlt[1];
      name = imgMatchAlt[2];
    }

    // Fallback name from h3 if alt was empty
    if (!name) {
      const h3Match = innerHtml.match(/<h3[^>]*>([^<]+)<\/h3>/i);
      name = h3Match ? h3Match[1].trim() : "";
    }

    // Fallback thumbnail from any src in img
    if (!thumbnail) {
      const srcMatch = innerHtml.match(/<img\s[^>]*src="([^"]+)"[^>]*>/i);
      thumbnail = srcMatch ? srcMatch[1] : "";
    }

    // Extract model name from <p> with truncate class
    const modelMatch = innerHtml.match(
      /<p[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/p>/
    );
    const modelName = modelMatch ? modelMatch[1].trim() : "";

    // Extract plan name from <span> with bg-navy
    const planMatch = innerHtml.match(
      /<span[^>]*class="[^"]*bg-navy[^"]*"[^>]*>([^<]+)<\/span>/
    );
    const plan = planMatch ? planMatch[1].trim() : "";

    if (name && thumbnail) {
      // Avoid duplicates by model+name
      const isDup = products.some(
        (p) => p.modelName === modelName && p.name === name
      );
      if (!isDup) {
        // Build description from plan info
        const desc = plan
          ? `${name} (${modelName}) - 결합 상조상품: ${plan}`
          : `${name} (${modelName})`;

        products.push({
          name,
          modelName,
          categoryId: "living", // will be auto-categorized on the client
          description: desc,
          thumbnail,
          href,
          plan,
        });
      }
    }
  }

  if (products.length === 0) {
    throw new Error(
      "bizinno.kr 페이지에서 제품 정보를 찾을 수 없습니다. 페이지 URL이 올바른지 확인해주세요."
    );
  }

  return products;
}

// ─── Generic HTML parser ───
// Attempts to extract product-like items from any webpage by detecting common patterns
function parseGenericHtml(html, sourceUrl) {
  const products = [];

  // Strategy 1: Look for product-card-like patterns with images and text
  // Common e-commerce patterns: <a href="...product..."><img ...><h3/h4/span>NAME</span></a>
  const productLinkRegex =
    /<a\s[^>]*href="([^"]*(?:product|item|goods)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = productLinkRegex.exec(html)) !== null) {
    const href = match[1];
    const inner = match[2];

    // Get image
    const imgMatch = inner.match(
      /<img\s[^>]*src="((?:https?:)?\/\/[^"]+)"[^>]*(?:alt="([^"]*)")?/
    );
    const imgMatchAlt = inner.match(
      /<img\s[^>]*alt="([^"]*)"[^>]*src="((?:https?:)?\/\/[^"]+)"/
    );

    let thumbnail = "";
    let altName = "";
    if (imgMatch) {
      thumbnail = imgMatch[1];
      altName = imgMatch[2] || "";
    } else if (imgMatchAlt) {
      altName = imgMatchAlt[1];
      thumbnail = imgMatchAlt[2];
    }

    // Get product name from heading elements
    const nameMatch = inner.match(
      /<(?:h[1-6]|span|strong|div)[^>]*class="[^"]*(?:name|title|prod)[^"]*"[^>]*>([^<]+)/i
    );
    const name =
      nameMatch?.[1]?.trim() || altName || href.split("/").pop() || "";

    if (name && thumbnail) {
      if (thumbnail.startsWith("//")) thumbnail = "https:" + thumbnail;

      products.push({
        name,
        modelName: "",
        categoryId: "living",
        description: name,
        thumbnail,
        href,
        plan: "",
      });
    }
  }

  // Strategy 2: If Strategy 1 didn't find anything, try JSON-LD structured data
  if (products.length === 0) {
    const jsonLdRegex =
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jsonMatch;

    while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (
            item["@type"] === "Product" ||
            item["@type"] === "ItemList" ||
            item["@type"]?.includes?.("Product")
          ) {
            const extractProduct = (prod) => {
              if (prod.name) {
                products.push({
                  name: prod.name,
                  modelName: prod.model || prod.sku || "",
                  categoryId: "living",
                  description: prod.description || prod.name,
                  thumbnail:
                    prod.image?.url ||
                    prod.image?.[0] ||
                    (typeof prod.image === "string" ? prod.image : ""),
                  href: prod.url || "",
                  plan: "",
                });
              }
            };

            if (item.itemListElement) {
              for (const li of item.itemListElement) {
                extractProduct(li.item || li);
              }
            } else {
              extractProduct(item);
            }
          }
        }
      } catch {
        // Invalid JSON-LD, skip
      }
    }
  }

  // Strategy 3: Try Open Graph product data or meta tags
  if (products.length === 0) {
    const ogTitle = html.match(
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/
    );
    const ogImage = html.match(
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/
    );
    const ogDesc = html.match(
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/
    );

    if (ogTitle && ogImage) {
      products.push({
        name: ogTitle[1],
        modelName: "",
        categoryId: "living",
        description: ogDesc ? ogDesc[1] : ogTitle[1],
        thumbnail: ogImage[1],
        href: sourceUrl,
        plan: "",
      });
    }
  }

  if (products.length === 0) {
    throw new Error(
      `해당 URL에서 제품 정보를 추출할 수 없습니다. HTML에서 제품 카드 패턴을 찾지 못했습니다.`
    );
  }

  return products;
}

const LIFENURI_FALLBACK_DATA = {
  "135": [
    {
      "name": "[보람B299 1호] 레노버 노트북 ThinkVision T32UD-40 31.5-inch UHD 모니터 64B0GAR1KR",
      "modelName": "64B0GAR1KR",
      "categoryId": "tv",
      "thumbnail": "https://image.benenuri.com/goods_thumbnail/2026/02/05/20260205171933QGAVBX.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039490"
    },
    {
      "name": "[보람B299 1호] 삼성 Crystal UHD TV 50인치 스탠드 KU50UH8000FXKR",
      "modelName": "KU50UH8000FXKR",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU50UH8000FXKR_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039507"
    },
    {
      "name": "[보람B299 1호] LG 꼬망스 플러스 8kg",
      "modelName": "F8WVR",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/F8WVR.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038403"
    },
    {
      "name": "[보람B299 1호] 삼성 인피니트 AI 공기청정기 10평형 (S필터/에센셜 블루 그레이) AP90H03163UGD",
      "modelName": "AP90H03163UGD",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AP90H03163UGD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038579"
    },
    {
      "name": "[보람B299 1호] LG 통돌이 세탁기18kg",
      "modelName": "T18MX7",
      "categoryId": "washer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/T18MX7.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038397"
    },
    {
      "name": "[보람B299 1호] LG 디오스 김치톡톡 217L",
      "modelName": "K220S111",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/kimchi/K220S111.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038395"
    },
    {
      "name": "[보람B299 1호] LG 퓨리케어 360˚ 공기청정기 플러스(1단)+무빙휠",
      "modelName": "AS195DWWA+PWH8DBB",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/air-purifier/AS195DWWA+PWH8DBB.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038394"
    },
    {
      "name": "[보람B299 1호] 삼성 BESPOKE 식기세척기 카운터탑 6인용 (베이지) DW30FB300CE0",
      "modelName": "DW30FB300CE0",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW30FB300CE0_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038570"
    },
    {
      "name": "[보람B299 1호] 삼성 벽걸이 에어컨(6평형/화이트) AR06D1150HZS",
      "modelName": "AR06D1150HZS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AR06D1150HZS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038580"
    },
    {
      "name": "[보람B299 1호] 삼성 일반 냉장고 410L (리파인드 이녹스) RT42CG6024S9",
      "modelName": "RT42CG6024S9",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RT42CG6024S9_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038564"
    },
    {
      "name": "[보람B299 1호] 삼성 일반 냉동고 227L (화이트) RZ22CG4000WW",
      "modelName": "RZ22CG4000WW",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RZ22CG4000WW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038563"
    },
    {
      "name": "[보람B299 1호] 삼성 전기레인지 하이브리드(빌트인/2구-인덕션,1구-라디언트/블랙) NZ63T5601AK",
      "modelName": "NZ63T5601AK",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NZ63T5601AK_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038568"
    },
    {
      "name": "[보람B299 1호] LG 모던엣지 냉장고 344L",
      "modelName": "M344MB14",
      "categoryId": "fridge",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/M344MB14.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038396"
    },
    {
      "name": "[보람B299 1호] 삼성 AI 세탁기 12kg (화이트) WW12T504DTW",
      "modelName": "WW12T504DTW",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WW12T504DTW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038573"
    },
    {
      "name": "[보람B299 1호] 삼성 인피니트 AI 공기청정기 10평형 (S필터/에센셜 베이지) AP90H03163EGD",
      "modelName": "AP90H03163EGD",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AP90H03163EGD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038578"
    },
    {
      "name": "[보람B299 1호] 삼성 제트핏 물걸레 청소기 브러시 패키지 (새틴 그레이지) VS70H18GVG",
      "modelName": "VS70H18GVG",
      "categoryId": "cleaner",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS70H18GVG_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038577"
    },
    {
      "name": "[보람B299 1호] 삼성 뚜껑형 김치냉장고(126L/세린실버) RP13C1022Z1",
      "modelName": "RP13C1022Z1",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RP13C1022Z1_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038565"
    },
    {
      "name": "[보람B299 1호] 삼성 제트핏 물걸레 청소기 브러시 패키지 (새틴 블랙) VS70H18GVK",
      "modelName": "VS70H18GVK",
      "categoryId": "cleaner",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS70H18GVK_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038576"
    },
    {
      "name": "[보람B299 1호] 삼성 일반 건조기(9kg/화이트) DV90TA040KE",
      "modelName": "DV90TA040KE",
      "categoryId": "dryer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DV90TA040KE_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038575"
    },
    {
      "name": "[보람B299 1호] 삼성 Crystal UHD TV 50인치 스탠드 KU50UF8030FXKR",
      "modelName": "KU50UF8030FXKR",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU50UF8030FXKR_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038562"
    },
    {
      "name": "[보람B299 1호] 삼성 세탁기 9kg (화이트) WF40F09M0Y",
      "modelName": "WF40F09M0Y",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF40F09M0Y_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038574"
    },
    {
      "name": "[보람B299 1호] 삼성 그랑데 드럼 세탁기 19kg (화이트) WF19T6000KW",
      "modelName": "WF19T6000KW",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF19T6000KW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038572"
    },
    {
      "name": "[보람B299 1호] 삼성 그랑데 통버블 세탁기 21kg (블랙캐비어) WA21A8376KV",
      "modelName": "WA21A8376KV",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WA21A8376KV_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038571"
    },
    {
      "name": "[보람B299 1호] 삼성 BESPOKE 식기세척기 카운터탑 6인용 (화이트) DW30FB300CW0",
      "modelName": "DW30FB300CW0",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW30FB300CW0_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038569"
    }
  ],
  "140": [
    {
      "name": "[보람B299 2호] 인공지능 AI돌봄로봇 다솜K_베이직 48개월 포함형",
      "modelName": "DASIL02",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/dasom/dasom_main/DASIL02.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038665"
    },
    {
      "name": "[보람B299 2호] M혼마 GOLD TOP-NOTCH 4스타 파크골프 세트 (다크브라운)",
      "modelName": "M-100",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/mhonma/main/mhonma_dbr_m.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038664"
    },
    {
      "name": "[보람B299 2호] 카타나 스타덤 스페셜 골드 골프클럽 풀세트 SR스틸 (남성용)",
      "modelName": "KSSET005",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/dmnk/product/thumbnail/golf/KSSET005.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039226"
    },
    {
      "name": "[보람B299 2호] LG 나노셀 AI TV(벽걸이) 75\"",
      "modelName": "75NA1C90AKW",
      "categoryId": "tv",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/tv/75NA1C90AKW.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038442"
    },
    {
      "name": "[보람B299 2호] 삼성 인피니트 AI 공기청정기 30평형 (S필터/에센셜 블루 그레이) AP90H10163UDD",
      "modelName": "AP90H10163UDD",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AP90H10163UDD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038613"
    },
    {
      "name": "[보람B299 2호] 삼성 AI Q9000 스탠드 에어컨 19평 (화이트/바람문 베이지) AF60F19D11BS",
      "modelName": "AF60F19D11BS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF60F19D11BS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038616"
    },
    {
      "name": "[보람B299 2호 ] LG 트롬 세탁기 24kg(스테인리스 실버)",
      "modelName": "F24VDLPR",
      "categoryId": "washer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/F24VDLPR.png",
      "href": "https://boram.lifenuri.com/shop/products/1000039220"
    },
    {
      "name": "[보람B299 2호] LG 65 나노셀 TV(벽걸이) + 사운드바",
      "modelName": "65NA1C90AKW+S20A",
      "categoryId": "tv",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/tv/65NA1C90AKW+S20A.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038441"
    },
    {
      "name": "[보람B299 2호] 삼성 인피니트 AI 공기청정기 30평형 (S필터/에센셜 베이지) AP90H10163EDD",
      "modelName": "AP90H10163EDD",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AP90H10163EDD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038612"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 리네이처 메디킨하이 초음파 고주파 하이푸",
      "modelName": "CSD-AHA110LW",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/skincare-device/CSD-AHA110LW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038496"
    },
    {
      "name": "[보람B299 2호] 삼성 AI Q9000 스탠드 에어컨 17평형 (화이트/바람문 베이지) AF60F17D11BS",
      "modelName": "AF60F17D11BS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF60F17D11BS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038615"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 로봇청소기 스팀 플러스 (새틴 차콜) VR80F01ADH",
      "modelName": "VR80F01ADH",
      "categoryId": "cleaner",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VR80F01ADH_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038611"
    },
    {
      "name": "[보람B299 2호] 삼성 Q9000 AI 스탠드에어컨 17평형 (화이트/바람문 화이트) AF60F17D11WS",
      "modelName": "AF60F17D11WS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF60F17D11WS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038614"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 오브제컬렉션 정수기(라이트온, 온정)(카밍클레이브라운)",
      "modelName": "WD220MNB6V",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/water-purifiers/WD220MNB6V.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038426"
    },
    {
      "name": "[보람B299 2호] 삼성 그랑데 통버블 세탁기 23kg (블랙 캐비어) WA23A8377KV",
      "modelName": "WA23A8377KV",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WA23A8377KV_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038598"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 오브제컬렉션 정수기(라이트온, 온정)(카밍베이지)",
      "modelName": "WD220MCB6V",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/water-purifiers/WD220MCB6V.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038425"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 로봇청소기 스팀 플러스 (새틴 그레이지) VR80F01ADG",
      "modelName": "VR80F01ADG",
      "categoryId": "cleaner",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VR80F01ADG_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038610"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 제트 400W 펫브러시 패키지 (새틴 블랙) VS90F40CNK",
      "modelName": "VS90F40CNK",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS90F40CNK_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038609"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 파워클론 로봇청소기 AI 2",
      "modelName": "CRVC-CAC1620W",
      "categoryId": "cleaner",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/vacuum-cleaners/CRVC-CAC1620W.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038493"
    },
    {
      "name": "[보람B299 2호] LG 나노셀 AI TV(스탠드) 75\"",
      "modelName": "75NA1C90AKS",
      "categoryId": "tv",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/tv/75NA1C90AKS.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038423"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 식기세척기 빌트인 14인용 (컵맞춤세척/새틴베이지) DW90F79P1USBT",
      "modelName": "DW90F79P1USBT",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW90F79P1USBT_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038597"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 식기세척기 빌트인 14인용 (에센셜 화이트)  DW80F73X1UEWT",
      "modelName": "DW80F73X1UEWT",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW80F73X1UEWT_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038596"
    },
    {
      "name": "[보람B299 2호] 카타나 스타덤 스페셜 골드 골프클럽 풀세트 L (여성용)",
      "modelName": "KSSET007",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/dmnk/product/thumbnail/golf/KSSET007.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039225"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE 제트 AI 400W (새틴블랙) VS90F40CSK",
      "modelName": "VS90F40CSK",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS90F40CSK_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038607"
    },
    {
      "name": "[보람B299 2호] LG 65 나노셀 TV(스탠드) + 사운드바",
      "modelName": "65NA1C90AKS+S20A",
      "categoryId": "tv",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/tv/65NA1C90AKS+S20A.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038421"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE 제트 AI 400W (새틴그레이지) VS90F40CSG",
      "modelName": "VS90F40CSG",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS90F40CSG_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038606"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 레스티노 소형 안마의자",
      "modelName": "CMS-G210NW_일시불",
      "categoryId": "massage",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/massage-chairs/CMS-G210NW.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038481"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE 인덕션 (새틴블랙) NZ63DB503CFT",
      "modelName": "NZ63DB503CFT",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NZ63DB503CFT_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038594"
    },
    {
      "name": "[보람B299 2호] LG 컨버터블 패키지 오브제컬렉션 Fit & Max 김치전용고 328L",
      "modelName": "Z324GB3S",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/kimchi/Z324GB3S.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038420"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 울트라 12000 공기청정기 34.9평형 60개월 셀프케어+파워클론 LINE 무선청소기",
      "modelName": "AC-35U10FWS(60M/12C)_셀프+CVC-L1610NW",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_AC-35U10FWS_CVC-L1610NW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038469"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 오브제컬렉션 하이드로타워 5평형(샌드 베이지) / 무빙휠 / 급수비커 세트",
      "modelName": "HY705RSUABM",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/humidifiers/HY705RSUABM.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038419"
    },
    {
      "name": "[보람B299 2호] 삼성 Infinite AI 인덕션 3구 (블랙) CC99F63U1DS",
      "modelName": "CC99F63U1DS",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/CC99F63U1DS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038593"
    },
    {
      "name": "[보람B299 2호] LG 코드제로 AI 오브제컬렉션 로보킹 올인원 (프리스탠딩)흡입+물걸레",
      "modelName": "B93BHB",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/vacuum-cleaners/B93BHB.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038418"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 75인치 스탠드 KU75UH8000FXKR",
      "modelName": "KU75UH8000FXKR",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UH8000FXKR_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039491"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 75인치 벽걸이 KU75UH8000FXKR_W",
      "modelName": "KU75UH8000FXKR_W",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UH8000FXKR_W_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039492"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 100도씨 끓인물 정수기 60개월 셀프케어 (그레이스 화이트)+에코웨일 건조분쇄형 음식물처리기 2L",
      "modelName": "CP-TS100GWH(60M/12C)_셀프+CFD-EFF201DCNW",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CP-TS100GWH_CFD-EFF201DCNW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038472"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 정수기 냉/온/정수(새틴 그레이지)+정수필터  RWP70F15ANWF2",
      "modelName": "RWP70F15ANWF2",
      "categoryId": "water",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RWP70F15ANWF2_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038592"
    },
    {
      "name": "[보람B299 2호] 삼성 AI 건조기 21kg (화이트) DV21DG8600BW",
      "modelName": "DV21DG8600BW",
      "categoryId": "dryer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DV21DG8600BW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038603"
    },
    {
      "name": "[보람B299 2호] LG 코드제로 AI 오브제컬렉션 A9흡입+스팀 물걸레",
      "modelName": "AI958WA",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/vacuum-cleaners/AI958WA.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038417"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 정수기 냉/온/정수(새틴 베이지)+정수필터  RWP70F15ANBF2",
      "modelName": "RWP70F15ANBF2",
      "categoryId": "water",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RWP70F15ANBF2_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038591"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE AI 제트 400W 펫브러시 패키지 (새틴 그레이지) VS90F40CNG",
      "modelName": "VS90F40CNG",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VS90F40CNG_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038608"
    },
    {
      "name": "[보람B299 2호] 삼성 AI 건조기 21kg (블랙캐비어) DV21DG8600BV",
      "modelName": "DV21DG8600BV",
      "categoryId": "dryer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DV21DG8600BV_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038602"
    },
    {
      "name": "[보람B299 2호] 삼성 김치플러스 3도어 328L (리파인드 이녹스) RQ33DG71G1S9",
      "modelName": "RQ33DG71G1S9",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RQ33DG71G1S9_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038590"
    },
    {
      "name": "[보람B299 2호] 삼성 AI 세탁기 25kg (화이트) WF25DG8650BW",
      "modelName": "WF25DG8650BW",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF25DG8650BW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038601"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE 김치플러스 3도어 328L (에센셜 베이지)  RQ33DG71J2ET",
      "modelName": "RQ33DG71J2ET",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RQ33DG71J2ET_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038589"
    },
    {
      "name": "[보람B299 2호] 삼성 AI 세탁기 25kg (블랙캐비어) WF25DG8650BV",
      "modelName": "WF25DG8650BV",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF25DG8650BV_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038600"
    },
    {
      "name": "[보람B299 2호] 삼성 BESPOKE 김치플러스 3도어 키친핏 313L (에센셜 화이트) RQ33DB74B1EW",
      "modelName": "RQ33DB74B1EW",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RQ33DB74B1EW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038588"
    },
    {
      "name": "[보람B299 2호] 삼성 양문형 냉장고 메탈쿨링커버 852L (젠틀 블랙) RS84DG5022B4",
      "modelName": "RS84DG5022B4",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RS84DG5022B4_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038587"
    },
    {
      "name": "[보람B299 2호] LG 스타일러 오브제컬렉션 슈케어최대 4켤레(에센스 그라파이트)",
      "modelName": "SS4RHS60E",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SS4RHS60E.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038413"
    },
    {
      "name": "[보람B299 2호] 삼성 그랑데 통버블 세탁기 25kg (블랙 케비어) WA25B8377KV",
      "modelName": "WA25B8377KV",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WA25B8377KV_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038599"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 AI 오브제컬렉션 360˚ 공기청정기 M5(네이처 그린)",
      "modelName": "AS206NGHA",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/air-purifier/AS206NGHA.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038408"
    },
    {
      "name": "[보람B299 2호] LG 스타일러 오브제컬렉션 슈케어최대 4켤레(에센스 화이트)",
      "modelName": "SS4RWS60E",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SS4RWS60E.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038412"
    },
    {
      "name": "[보람B299 2호] 삼성 양문형 냉장고 852L (코타 PCM 화이트) RS84DB5002CW",
      "modelName": "RS84DB5002CW",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RS84DB5002CW_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038586"
    },
    {
      "name": "[보람B299 2호] 삼성 양문형 냉장고 852L (젠틀 실버) RS84DG5002M9",
      "modelName": "RS84DG5002M9",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RS84DG5002M9_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038585"
    },
    {
      "name": "[보람B299 2호] LG 디오스 AI 오브제컬렉션 냉장고 (양문형) 832L",
      "modelName": "S836P022",
      "categoryId": "fridge",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/S836P022.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038411"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 75인치 [벽걸이] KU75UF8030FXKR_W",
      "modelName": "KU75UF8030FXKR_W",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UF8030FXKR_W_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038584"
    },
    {
      "name": "[보람B299 2호] LG 디오스 오브제컬렉션 김치톡톡 뚜껑씩 냉장고 217L (베이지) + LG 디오스 오브제컬렉션 전자레인지25L",
      "modelName": "Z225MEE151+MWJ25E",
      "categoryId": "fridge",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/kimchi/Z225MEE151+MWJ25E.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038410"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 75인치 [스탠드] KU75UF8030FXKR",
      "modelName": "KU75UF8030FXKR",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UF8030FXKR_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038583"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 레스티노 가구형 안마의자 (그레이)",
      "modelName": "CMS-J310GR",
      "categoryId": "furniture",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/massage-chairs/CMS-J310GR.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038492"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 레스티노 가구형 안마의자 (브라운)",
      "modelName": "CMS-J310BR",
      "categoryId": "furniture",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/massage-chairs/CMS-J310BR.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038491"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 AI 오브제컬렉션 360˚ 공기청정기 M5(카밍 베이지)",
      "modelName": "AS206NSHA",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/air-purifier/AS206NSHA.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038409"
    },
    {
      "name": "[보람B299 2호] LG 퓨리케어 AI 360˚ 공기청정기 플러스 30평형 + LG 퓨리케어 AI 오브제컬렉션 에어로퍼니처",
      "modelName": "AS305DWWA+AS065PWHA",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/air-purifier/AS305DWWA+AS065PWHA.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038407"
    },
    {
      "name": "[보람B299 2호] LG 트롬 오브제컬렉션 건조기19kg(네이처 그린)",
      "modelName": "RG19GN",
      "categoryId": "dryer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/dryers/RG19GN.png\n",
      "href": "https://boram.lifenuri.com/shop/products/1000038406"
    },
    {
      "name": "[보람B299 2호] LG 트롬 오브제컬렉션 건조기19kg(네이처 베이지)",
      "modelName": "RG19EN",
      "categoryId": "dryer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/dryers/RG19EN.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038405"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 미식 컬렉션 프리존 3구 화이트 인덕션레인지 (오로라핑크)+트윈프레셔 저당밥솥 10인용",
      "modelName": "CIR-G301FAP+CRP-LHLR1010FW",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CIR-G301FAP_CRP-LHLR1010FW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038475"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 미식 컬렉션 프리존 3구 화이트 인덕션레인지 (퓨어화이트)+트윈프레셔 저당밥솥 10인용",
      "modelName": "CIR-G301FAW+CRP-LHLR1010FW",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CIR-G301FAW_CRP-LHLR1010FW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038474"
    },
    {
      "name": "[보람B299 2호] LG 스탠바이미 2",
      "modelName": "27LX6TPGA",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/tv/27LX6TPGA.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038404"
    },
    {
      "name": "[보람B299 2호] 소노시즌 컴포터블 매트리스 킹(K)",
      "modelName": "CP_K",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/CP_M_02.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039238"
    },
    {
      "name": "[보람B299 2호] 소노시즌 어드밴스 소프트 매트리스 슈퍼싱글(SS)",
      "modelName": "ADS_SS",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/ADS_M_01.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039235"
    },
    {
      "name": "[보람B299 2호] 소노시즌 어드밴스 미디엄 매트리스 슈퍼싱글(SS)",
      "modelName": "ADM_SS",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/ADM_M_01.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039234"
    },
    {
      "name": "[보람B299 2호] 소노시즌 스탠다드 펌 매트리스 킹(K)",
      "modelName": "STF_K",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/STF_M_04.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039233"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 65인치 스탠드+2.0ch 사운드바 KU65UH8000FXKR_S",
      "modelName": "KU65UH8000FXKR_S",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU65UH8000FXKR_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039508"
    },
    {
      "name": "[보람B299 2호] 삼성 Crystal UHD TV 65인치 벽걸이+2.0ch 사운드바 KU65UH8000FXKR_B",
      "modelName": "KU65UH8000FXKR_B",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU65UH8000FXKR_B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039484"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 제로 100 슬림 바리스타 정수기 60개월 셀프케어 (어스 베이지)",
      "modelName": "CP-AHSC100HEB(60M/4C/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AHSC100HEB.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038499"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 제로 100 슬림 바리스타 정수기 60개월 셀프케어 (어스 화이트)",
      "modelName": "CP-AHSC100HEW(60M/4C/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AHSC100HEW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038498"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 제로 100 슬림 얼음 정수기 60개월 셀프케어 어스 화이트",
      "modelName": "CP-AHS100HEW(S)(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AHS100HEW(S)_60M4C12CSF.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038497"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 미식 컬렉션 셰프스틱 프리존 3구 화이트 인덕션레인지(오로라핑크)",
      "modelName": "CIR-GP301FAP",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/electric-ranges/CIR-GP301FAP.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038495"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 미식 컬렉션 셰프스틱 프리존 3구 화이트 인덕션레인지(퓨어화이트)",
      "modelName": "CIR-GP301FAW",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/electric-ranges/CIR-GP301FAW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038494"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 스팀100 빌트인 정수기 60개월 셀프케어 (루미화이트)",
      "modelName": "CP-AAS100ULW(60M/4C/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AAS100ULW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038490"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 스팀100 빌트인 정수기 60개월 셀프케어 (루미다크실버)",
      "modelName": "CP-AAS100ULDS(60M/4C/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AAS100ULDS.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038489"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 스팀100 끓인물 정수기 60개월 셀프케어 (그레이스 핑크)",
      "modelName": "CP-ABS100GPK(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-ABS100GPK.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038488"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 스팀100 끓인물 정수기 60개월 셀프케어 (그레이스 화이트)",
      "modelName": "CP-ABS100GWH(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-ABS100GWH.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038487"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 미니100 초소형 정수기 60개월 셀프케어 (어스 블루)",
      "modelName": "CP-AMS100EBL(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AMS100EBL.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038486"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 미니100 초소형 정수기 60개월 셀프케어 (어스 브라운)",
      "modelName": "CP-AMS100EBR(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AMS100EBR.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038485"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 미니100 초소형 정수기 60개월 셀프케어 (어스 핑크)",
      "modelName": "CP-AMS100EPK(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AMS100EPK.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038484"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 미니100 초소형 정수기 60개월 셀프케어 (어스 베이지)",
      "modelName": "CP-AMS100EBE(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AMS100EBE.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038483"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 미니100 초소형 정수기 60개월 셀프케어 (어스 화이트)",
      "modelName": "CP-AMS100EWH(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-AMS100EWH.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038482"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 스팀100 바리스타 정수기 60개월 셀프케어 (그레이스 핑크)",
      "modelName": "CP-ABSC100GP(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-ABSC100GP_60M4C12CSF.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038480"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 스팀100 바리스타 정수기 60개월 셀프케어 (그레이스 화이트)",
      "modelName": "CP-ABSC100GW(60M/12C)_셀프",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/water-purifiers/CP-ABSC100GW_60M4C12CSF.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038479"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 대용량 공기청정기 50평형 60개월 셀프케어 노블 화이트",
      "modelName": "AC-52AB10FNW(60M/12C)_셀프",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/air-purifier/AC-52AB10FNW_60M4C12CSF.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038478"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 대용량 공기청정기 41평형 60개월 셀프케어 노블 화이트",
      "modelName": "AC-40AB10FNW(60M/12C)_셀프",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/air-purifier/AC-40AB10FNW_60M4C12CSF.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038477"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 인스퓨어 도기 일체형 비데(도기+비데 세트상품)",
      "modelName": "CBT-M1031ARW(45만)+CBTT-M10(40만) 한세트",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/small-appliances/CBT-M1031ARW.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038476"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 100도씨 끓인물 정수기 60개월 셀프케어 (그레이사 핑크)+에코웨일 건조분쇄형 음식물처리기 2L",
      "modelName": "CP-TS100GPK(60M/12C)_셀프+CFD-EFF201DCNW",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CP-TS100GPK_CFD-EFF201DCNW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038473"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 100도씨 끓인물 정수기 60개월 셀프케어 (그레이,실버)+에코웨일 건조분쇄형 음식물처리기 2L",
      "modelName": "CP-TS100DSL(60M/12C)_셀프+CFD-EFF201DCNW",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CP-TS100DSL_CFD-EFF201DCNW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038471"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 100도씨 끓인물 정수기 60개월 셀프케어 (화이트,실버)+에코웨일 건조분쇄형 음식물처리기 2L",
      "modelName": "CP-TS100WS(60M/12C)_셀프+CFD-EFF201DCNW",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CP-TS100WS_CFD-EFF201DCNW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038470"
    },
    {
      "name": "[보람B299 2호] 쿠쿠 미식 컬렉션 프리미엄 4도어 양문형 냉장고 477L",
      "modelName": "CRG-CNLR4820MS",
      "categoryId": "fridge",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/refrigerators/CRG-CNLR4820MS.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038468"
    },
    {
      "name": "[보람B299 2호] 카타나 스타덤 스페셜 골드 골프클럽 풀세트 SR (남성용)",
      "modelName": "KSSET003",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/dmnk/product/thumbnail/golf/KSSET003.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039227"
    },
    {
      "name": "[보람B299 2호] 카타나 스타덤 스페셜 골드 골프클럽 풀세트 R (남성용)",
      "modelName": "KSSET001",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/dmnk/product/thumbnail/golf/KSSET001.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039228"
    }
  ],
  "145": [
    {
      "name": "[보람B299 3호] 삼성 노트북 갤럭시북4 360 15in (i5/메모리 16GB/SSD 512GB/그레이) NT751QGK-K04C NT751QGK-K04C",
      "modelName": "NT751QGK-K04C",
      "categoryId": "laptop",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NT751QGK-K04C_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039493"
    },
    {
      "name": "[보람B299 3호] 쿠쿠 제로 100 슬림 얼음 정수기 60개월 셀프케어+파워클론 딥 클린(Deep Clean) 무선청소기",
      "modelName": "CP-AHS100HEW(S)(60M/12C)_셀프+CVC-DEM2510NW",
      "categoryId": "cleaner",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CP-AHS100HEW_CVC-DEM2510NW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038501"
    },
    {
      "name": "[보람B299 3호] LG 트롬 오브제컬렉션 세탁기 21kg + LG 트롬 오브제컬렉션 건조기 19kg",
      "modelName": "FG21WNR+RG19WN",
      "categoryId": "washer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/FG21WNR+RG19WN.png",
      "href": "https://boram.lifenuri.com/shop/products/1000039219"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 얼음정수기 냉/온/정수 (사틴베이지)+브루어키트+교체용필터 1SET RWP90H15ANBCF",
      "modelName": "RWP90H15ANBCF",
      "categoryId": "water",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RWP90H15ANBCF_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038628"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 무풍클래식 2in1 에어컨 17평+6평형 (화이트/바람문 베이지) AF70F17D11BRS",
      "modelName": "AF70F17D11BRS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF70F17D11BRS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038643"
    },
    {
      "name": "[보람B299 3호] 소노시즌 어드밴스 소프트 매트리스 퀸(Q)",
      "modelName": "ADS_Q",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/ADS_M_02.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039246"
    },
    {
      "name": "[보람B299 3호] LG 트롬 오브제컬렉션 건조기25kg(네이처 그린)",
      "modelName": "RD25GSG",
      "categoryId": "dryer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/dryers/RD25GSG.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038427"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 얼음정수기 냉/온/정수 (사틴그레이지)+브루어키트+교체용필터 1SET RWP90H15ANWCF",
      "modelName": "RWP90H15ANWCF",
      "categoryId": "water",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RWP90H15ANWCF_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038627"
    },
    {
      "name": "[보람B299 3호] 쿠쿠 레스티노 안마의자 일반형+파워클론 올 클린(AII clean) 스테이션 무선청소기",
      "modelName": "CMS-D10SLGB_일시불+CVC-AEM1410NW",
      "categoryId": "cleaner",
      "thumbnail": "https://dmnk02.hubweb.net/cuckoo/main/etc/BRP_CMS-D10SLGB_CVC-AEM1410NW.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038500"
    },
    {
      "name": "[보람B299 3호] 삼성 AI Q9000 2in1 에어컨 19평+6평형 (화이트/바람문 베이지) AF60F19D11BRS",
      "modelName": "AF60F19D11BRS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF60F19D11BRS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038642"
    },
    {
      "name": "[보람B299 3호] LG 스타일러 오브제컬렉션 (2026 NEW)5벌+바지 1벌",
      "modelName": "SC5GMR60S",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC5GMR60S.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038434"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 김치냉장고 4도어 490L (에센셜화이트) RK70F49M2ZD",
      "modelName": "RK70F49M2ZD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RK70F49M2ZD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038626"
    },
    {
      "name": "[보람B299 3호] 소노시즌 어드밴스 미디엄 매트리스 킹(K)",
      "modelName": "ADM_K",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/ADM_M_02.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039245"
    },
    {
      "name": "[보람B299 3호] 삼성 Crystal UHD TV 85인치 벽걸이+5.0ch 사운드바 KU85UH8000FXKR_B",
      "modelName": "KU85UH8000FXKR_B",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU85UH8000FXKR_B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039486"
    },
    {
      "name": "[보람B299 3호] 삼성 Crystal UHD TV 85인치 스탠드+5.0ch 사운드바 KU85UH8000FXKR_S",
      "modelName": "KU85UH8000FXKR_S",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU85UH8000FXKR_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039509"
    },
    {
      "name": "[보람B299 3호] 삼성 Q9000 AI 2in1 에어컨 17평+6평형 (화이트/바람문 화이트) AF60F17D11WRS",
      "modelName": "AF60F17D11WRS",
      "categoryId": "aircon",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/AF60F17D11WRS_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038641"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 김치냉장고 4도어 490L (에센셜베이지) RK70F49M2GD",
      "modelName": "RK70F49M2GD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RK70F49M2GD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038625"
    },
    {
      "name": "[보람B299 3호] LG 트롬 AI 오브제컬렉션 세탁기25kg(네이처 베이지)",
      "modelName": "FX25EFE",
      "categoryId": "washer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/FX25EFE.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038432"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 스팀 울트라 로봇청소기 (새틴 차콜)+블루스카이 5500 공기청정기 (빅토리그레이) VR90F01AAH_S",
      "modelName": "VR90F01AAH_S",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VR90F01AAH_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038640"
    },
    {
      "name": "[보람B299 3호] LG 트롬 AI 오브제컬렉션 세탁기25kg(네이처 그린)",
      "modelName": "FX25GFG",
      "categoryId": "washer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/washing-machines/FX25GFG.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038431"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 스팀 울트라 로봇청소기 (새틴 그레이지)+블루스카이 5500 공기청정기 (빅토리그레이) VR90F01AAG_S",
      "modelName": "VR90F01AAG_S",
      "categoryId": "airpurifier",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/VR90F01AAG_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038639"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 김치냉장고 4도어 490L (에센셜다크메탈) RK70F49M2DD",
      "modelName": "RK70F49M2DD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RK70F49M2DD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038624"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 에어드레서 대용량 5~9벌 (솝스톤차콜) DF90H24R4B",
      "modelName": "DF90H24R4B",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DF90H24R4B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038638"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 냉장고 4도어 884L 빅아이스/큐브 (에센셜화이트/에센셜베이지) RM70F90Q2ZG",
      "modelName": "RM70F90Q2ZG",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RM70F90Q2ZG_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038623"
    },
    {
      "name": "[보람B299 3호] LG 디오스 오브제컬렉션 김치톡톡505L(크림화이트)",
      "modelName": "Z509MHHF23",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/refrigerators/kimchi/Z509MHHF23.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038429"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 냉장고 4도어 884L 빅아이스/큐브 (코타화이트) RM70F90Q2A",
      "modelName": "RM70F90Q2A",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RM70F90Q2A_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038622"
    },
    {
      "name": "[보람B299 3호] 소노시즌 어드밴스 소프트 매트리스 킹(K)",
      "modelName": "ADS_K",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/ADS_M_01.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039247"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 에어드레서 대용량 5~9벌 (클린화이트) DF90H24R4D",
      "modelName": "DF90H24R4D",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DF90H24R4D_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038637"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 냉장고 4도어 902L (에센셜다크메탈) RM70F90M1DD",
      "modelName": "RM70F90M1DD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RM70F90M1DD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038621"
    },
    {
      "name": "[보람B299 3호] LG 트롬 오브제컬렉션 건조기25kg(네이처 베이지)",
      "modelName": "RD25ESE",
      "categoryId": "dryer",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/dryers/RD25ESE.png",
      "href": "https://boram.lifenuri.com/shop/products/1000038428"
    },
    {
      "name": "[보람B299 3호] LG 스타일러 오브제컬렉션 3벌 (2026 NEW)3벌",
      "modelName": "SC3GNE50",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC3GNE50.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039304"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE 그랑데 AI 원바디 Top-Fit 24kg+20kg 패키지 (화이트) WF2420HCWWC",
      "modelName": "WF2420HCWWC",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF2420HCWWC_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038636"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE 그랑데 AI 원바디 Top-Fit 24kg+20kg 패키지 (블랙캐비어) WF2420HCVVC",
      "modelName": "WF2420HCVVC",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF2420HCVVC_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038635"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 냉장고 4도어 902L (에센셜베이지) RM70F90M1GD",
      "modelName": "RM70F90M1GD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RM70F90M1GD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038620"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 세탁기 24kg+건조기 20kg 올인원컨트롤 (그레이지) WF24D20CEEC",
      "modelName": "WF24D20CEEC",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF24D20CEEC_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038634"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE AI 냉장고 4도어 902L (에센셜화이트) RM70F90M1ZD",
      "modelName": "RM70F90M1ZD",
      "categoryId": "fridge",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/RM70F90M1ZD_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038619"
    },
    {
      "name": "[보람B299 3호] 삼성 Crystal UHD TV 75인치 [벽걸이]+사운드바 KU75UF8030FXKR_B",
      "modelName": "KU75UF8030FXKR_B",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UF8030FXKR_B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038618"
    },
    {
      "name": "[보람B299 3호] 삼성 Crystal UHD TV 75인치 [스탠드]+사운드바 KU75UF8030FXKR_S",
      "modelName": "KU75UF8030FXKR_S",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75UF8030FXKR_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038617"
    },
    {
      "name": "[보람B299 3호] 삼성 AI 세탁기 25kg+건조기 21kg 패키지 (화이트) WF25DG8250BW2T",
      "modelName": "WF25DG8250BW2T",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF25DG8250BW2T_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038633"
    },
    {
      "name": "[보람B299 3호] 삼성 AI 세탁기 25kg+건조기 21kg 패키지 (블랙캐비어) WF25DG8250BV2T",
      "modelName": "WF25DG8250BV2T",
      "categoryId": "washer",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/WF25DG8250BV2T_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038632"
    },
    {
      "name": "[보람B299 3호] LG 스타일러 오브제컬렉션 (2026 NEW)5벌+바지 1벌",
      "modelName": "SC5MBR60S",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC5MBR60S.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039306"
    },
    {
      "name": "[보람B299 3호] LG 스타일러 오브제컬렉션 (2026 NEW) 5벌",
      "modelName": "SC5MBR43S",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC5MBR43S.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039305"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE 인피니트라인 AI 식기세척기 빌트인 14인용 (새틴베이지) DW99F79E1USBT",
      "modelName": "DW99F79E1USBT",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW99F79E1USBT_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038631"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE 인피니트라인 AI 식기세척기 빌트인 14인용 (새틴화이트) DW99F79E1USWT",
      "modelName": "DW99F79E1USWT",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/DW99F79E1USWT_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038630"
    },
    {
      "name": "[보람B299 3호] 삼성 BESPOKE 인피니트라인 인덕션(빌트인/그레이지) NZ64B9899RB",
      "modelName": "NZ64B9899RB",
      "categoryId": "general",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NZ64B9899RB_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038629"
    },
    {
      "name": "[보람B299 3호] 삼성 Mini LED MH75 TV 75인치 벽걸이+3.1.2ch 사운드바 KU75MH75AFXKR_B",
      "modelName": "KU75MH75AFXKR_B",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75MH75AFXKR_B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039489"
    },
    {
      "name": "[보람B299 3호] 삼성 Mini LED MH75 TV 75인치 스탠드+3.1.2ch 사운드바 KU75MH75AFXKR_S",
      "modelName": "KU75MH75AFXKR_S",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KU75MH75AFXKR_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039488"
    },
    {
      "name": "[보람B299 3호] 소노시즌 시그니처 매트리스 슈퍼싱글(SS)",
      "modelName": "SI_SS",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/SI_M_01.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039252"
    },
    {
      "name": "[보람B299 3호] 소노시즌 컴포터블 매트리스 라지킹(LK)",
      "modelName": "CP_LK",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/sonoseason/main/CP_M_01.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039248"
    }
  ],
  "150": [
    {
      "name": "[보람B299 4호] 바디프랜드 팔콘 2026",
      "modelName": "BFR-7220",
      "categoryId": "general",
      "thumbnail": "https://dmnk02.hubweb.net/bodyfriend/main/massage-chairs/BFR-7220.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000038199"
    },
    {
      "name": "[보람B299 4호] 레노버 노트북 ThinkPad T14s Gen6 ARL (Ultra7-255U/16GB/512GB/WUXGA) 21R1S02E00",
      "modelName": "21R1S02E00",
      "categoryId": "laptop",
      "thumbnail": "https://image.benenuri.com/goods_thumbnail/2025/08/22/20250822114228K5CBJZ.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039505"
    },
    {
      "name": "[보람B299 4호] 삼성 노트북 갤럭시북5 프로 360 16in (인텔코어 Ultra 5/메모리16GB/SSD 512GB/그레이) NT961QHA-K06C NT961QHA-K06C",
      "modelName": "NT961QHA-K06C",
      "categoryId": "laptop",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NT961QHA-K06C_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039502"
    },
    {
      "name": "[보람B299 4호] 삼성 Micro RGB TV 65인치 벽걸이+뮤직 스튜디오 KMR65RH85AFXKR_B",
      "modelName": "KMR65RH85AFXKR_B",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KMR65RH85AFXKR_B_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039501"
    },
    {
      "name": "[보람B299 4호] LG 퓨리케어 오브제컬렉션 얼음정수기(에센스화이트)",
      "modelName": "WD722RH6V",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/water-purifiers/WD722RH6V.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039217"
    },
    {
      "name": "[보람B299 4호] LG 퓨리케어 오브제컬렉션 얼음정수기(블랙)",
      "modelName": "WD722RK6V",
      "categoryId": "water",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/water-purifiers/WD722RK6V.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039216"
    },
    {
      "name": "[보람B299 4호] LG 코드제로 AI 오브제컬렉션 A9흡입+스팀 물걸레 + LG 퓨리케어 AI 오브제컬렉션 360˚ 공기청정기 M7 34평형",
      "modelName": "AI948WA+AS356NSMA",
      "categoryId": "airpurifier",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/vacuum-cleaners/AI948WA+AS356NSMA.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039215"
    },
    {
      "name": "[보람B299 4호] 삼성 노트북 갤럭시북5 프로 16in (인텔코어 Ultra 5/메모리16GB/SSD 512GB/그레이)  NT961XHA-K06C NT961XHA-K06C",
      "modelName": "NT961XHA-K06C",
      "categoryId": "laptop",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/NT961XHA-K06C_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039503"
    },
    {
      "name": "[보람B299 4호] 삼성 Micro RGB TV 65인치 스탠드+뮤직 스튜디오 KMR65RH85AFXKR_S",
      "modelName": "KMR65RH85AFXKR_S",
      "categoryId": "tv",
      "thumbnail": "https://snpartners.speedgabia.com/SJ/B.P/B299/KMR65RH85AFXKR_S_T.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039500"
    },
    {
      "name": "[보람B299 4호 ] LG 스타일러 오브제컬렉션 (2026 NEW) + 스티머5벌+바지 1벌(샌드베이지)",
      "modelName": "SC5MBR80S",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC5MBR80S.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039308"
    },
    {
      "name": "[보람B299 4호 ] LG 스타일러 오브제컬렉션 (2026 NEW) + 스티머5벌+바지 1벌(블랙틴트미러)",
      "modelName": "SC5GMR80S",
      "categoryId": "styler",
      "thumbnail": "https://dmnk02.hubweb.net/lg_brandswell/main/styler/SC5GMR80S.jpg",
      "href": "https://boram.lifenuri.com/shop/products/1000039307"
    }
  ]
};