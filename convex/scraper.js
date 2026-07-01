"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

// Convex action to scrape product data from a given URL
export const scrapeProducts = action({
  args: {
    urls: v.array(v.string()),
    accounts: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const allProducts = [];
    const errors = [];

    for (const url of args.urls) {
      try {
        const products = await scrapeOneUrl(url, args.accounts);
        allProducts.push(...products);
      } catch (err) {
        errors.push({ url, error: err.message || String(err) });
      }
    }

    return { products: allProducts, errors };
  },
});

async function scrapeOneUrl(rawUrl, accountsOverride) {
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

    const accounts = accountsOverride !== undefined ? accountsOverride : (accountsVal ? parseInt(accountsVal) : null);
    const page = pageVal ? parseInt(pageVal) : null;

    return fetchBizinnoFromSupabase(accounts, page);
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
  const themeNoMatch = html.match(/var\s+first_theme\s*=\s*(\d+)/i) || html.match(/onclick="listdata\('(\d+)'\)"/i);
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
