import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

document.addEventListener('DOMContentLoaded', async () => {

  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  let convex = null;
  if (convexUrl) {
    try {
      convex = new ConvexClient(convexUrl);
    } catch (e) {
      console.warn("Failed to initialize Convex Client:", e);
    }
  }

  const defaultBrands = [
    { id: 'daemyung', name: '대명아임레디', desc: '레저/리조트 우대 및 소노호텔 멤버십 혜택이 강력한 대표 상조사', logoText: '대명', fee: 150000 },
    { id: 'boram', name: '보람상조', desc: '전통과 신뢰의 1위 브랜드, 크루즈/웨딩/주얼리 자유 전환 서비스', logoText: '보람', fee: 120000 },
    { id: 'preed', name: '프리드라이프', desc: '국내 최대 누적 가입자수 보유, 합리적이고 투명한 납입 플랜 제공', logoText: '프리드', fee: 130000 },
    { id: 'kyowon', name: '교원라이프', desc: '교육/어학 연계 및 생활 가전 결합 등 실용적 라이프 케어 우수 상조사', logoText: '교원', fee: 140000 }
  ];

  const defaultPlans = [
    {
      id: 'plan_daemyung_429',
      brandId: 'daemyung',
      name: '대명 스마트 라이프 429',
      funeralService: '고품격 장례 의전 서비스 (전문 장례지도사 24시간 긴급 출동, 고급 리무진 및 운구차량 지원, 품격 장례용품 일체 제공)',
      refundRate: '100% (만기 완납 후 해약 시 납입원금 전액 환급)',
      depositOrg: '상조보증공제조합 (소비자피해보상 계약 예치 완료)',
      convertService: '웨딩 서비스 / 크루즈 여행 / 골프 멤버십 / 하이브리드 라이프 서비스로 자유 선택 전환 가능',
      membershipService: '대명 소노호텔앤리조트 전국 객실 및 오션월드, 스키장 등 레저 부대시설 주중/주말 회원 우대 혜택 제공',
      maturityRound: 150,
      paymentSections: [
        { start: 1, end: 100, funeralAmount: 20000, applianceAmount: 22900 },
        { start: 101, end: 150, funeralAmount: 25000, applianceAmount: 0 }
      ],
      notices: [
        '만기(150회) 완납 후 익월 해약 신청 시 납입원금이 100% 전액 현금 환급됩니다.',
        '중도 해약 시 가입된 가전제품의 잔여 대금이 일시 청구될 수 있으므로 유의해주시기 바랍니다.',
        '대명 소노호텔앤리조트 제휴처에서 멤버십 카드를 제시하면 다양한 멤버십 우대를 받으실 수 있습니다.'
      ],
      cards: [
        {
          name: '대명아임레디 신한카드',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
          annualFee: 15000,
          benefits: [
            '전월 실적 30만원 이상 결제 시 월 13,000원 청구 할인',
            '전월 실적 70만원 이상 결제 시 월 17,000원 청구 할인'
          ],
          phoneApply: '1661-3322',
          onlineApplyUrl: 'https://www.shinhancard.com'
        }
      ]
    },
    {
      id: 'plan_boram_55',
      brandId: 'boram',
      name: '보람 라이프 55',
      funeralService: '보람상조 전통 장례 의전 (전국 직영 장례지도사 24시간 대기, 링컨 컨티넨탈 리무진 지원, 장례용품 제공)',
      refundRate: '100% (만기 완납 후 해약 시 납입원금 전액 환급)',
      depositOrg: '한국상조공제조합',
      convertService: '보람 웨딩 서비스 / 크루즈 여행 / 보람 쥬얼리 / 크루즈 멤버십 전환 가능',
      membershipService: '보람 직영 장례식장 이용료 할인 및 제휴 리조트 우대 혜택',
      maturityRound: 120,
      paymentSections: [
        { start: 1, end: 60, funeralAmount: 30000, applianceAmount: 25000 },
        { start: 61, end: 120, funeralAmount: 35000, applianceAmount: 0 }
      ],
      notices: [
        '보람상조 공제조합 계약 보증금 예치로 납입원금이 법적으로 안전하게 보호됩니다.',
        '장례 행사 이용 시, 최초 가입한 상품 금액 그대로 물가상승분 부담 없이 보장받습니다.'
      ],
      cards: [
        {
          name: '보람상조 KB국민카드',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
          annualFee: 15000,
          benefits: [
            '전월 실적 30만원 이상 시 월 12,000원 할인',
            '전월 실적 70만원 이상 시 월 17,000원 할인'
          ],
          phoneApply: '1588-1688',
          onlineApplyUrl: 'https://www.kbcard.com'
        }
      ]
    },
    {
      id: 'plan_preed_396',
      brandId: 'preed',
      name: '프리드 396',
      funeralService: '국내 최대 누적 가입자 프리드라이프 프리미엄 장례 서비스 (VIP 의전 리무진 및 품격 의전 용품)',
      refundRate: '100% (만기 완납 후 해약 시 납입금 전액 환급)',
      depositOrg: '신한은행 / 우리은행 / 하나은행 제휴 예치',
      convertService: '웨딩 서비스 / 크루즈 여행 / 장지 서비스 / 어학연수 전환 가능',
      membershipService: '한화콘도, 금호리조트 등 제휴 콘도 할인 및 전문 장례 지도사 무료 상담',
      maturityRound: 180,
      paymentSections: [
        { start: 1, end: 120, funeralAmount: 22000, applianceAmount: 11000 },
        { start: 121, end: 180, funeralAmount: 22000, applianceAmount: 0 }
      ],
      notices: [
        '만기(180회) 완납 후 1년 경과 시 또는 라이프 서비스 미사용 해약 시 100% 전액 환급됩니다.',
        '신한은행, 우리은행, 하나은행 등 제1금융권 예치로 납입안전성이 최고 수준으로 보장됩니다.'
      ],
      cards: [
        {
          name: '프리드라이프 우리카드',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
          annualFee: 15000,
          benefits: [
            '전월 실적 30만원 이상 시 월 13,000원 할인',
            '전월 실적 70만원 이상 시 월 20,000원 할인'
          ],
          phoneApply: '1599-2200',
          onlineApplyUrl: 'https://www.wooricard.com'
        }
      ]
    },
    {
      id: 'plan_kyowon_299',
      brandId: 'kyowon',
      name: '교원 라이프 299',
      funeralService: '교원라이프 고품격 장례 의전 및 교육/생활문화 통합 케어 서비스',
      refundRate: '100% (만기 완납 후 해약 시 전액 환급)',
      depositOrg: '신한은행 / 상조공제조합',
      convertService: '교원 빨간펜 / 구몬학습 교육상품 전환, 교원 웰스 가전 교체, 웨딩/크루즈 전환 가능',
      membershipService: '교원그룹 제휴 스파, 연수원 할인 및 가입 즉시 멤버십 적용',
      maturityRound: 200,
      paymentSections: [
        { start: 1, end: 150, funeralAmount: 14950, applianceAmount: 14950 },
        { start: 151, end: 200, funeralAmount: 14950, applianceAmount: 0 }
      ],
      notices: [
        '교원그룹의 탄탄한 자본력으로 납입 안전성이 철저히 보장됩니다.',
        '자녀 교육 상품(빨간펜 등)이나 가전 전환 등 타 상조사 대비 전환 폭이 매우 넓고 실용적입니다.'
      ],
      cards: [
        {
          name: '교원라이프 하나카드',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
          annualFee: 15000,
          benefits: [
            '전월 실적 30만원 이상 시 월 13,000원 할인',
            '전월 실적 80만원 이상 시 월 20,000원 할인'
          ],
          phoneApply: '1800-1111',
          onlineApplyUrl: 'https://www.hanacard.co.kr'
        }
      ]
    }
  ];

  const defaultProducts = [
    {
      id: 'prod1',
      name: '삼성 갤럭시북4 프리미엄',
      categoryId: 'digital',
      modelName: 'NT750XGK-K51A',
      description: '최신 인텔 코어 프로세서 탑재, 초슬림 초경량의 고성능 비즈니스 노트북',
      thumbnail: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80',
      planId: 'plan_daemyung_429',
      monthly: 42900,
      cardBenefitPrice: 25900
    },
    {
      id: 'prod2',
      name: '바디프랜드 다빈치 안마의자',
      categoryId: 'health',
      modelName: 'BF-DAVINCI',
      description: '체성분 측정 분석 기능 및 맞춤형 마사지 알고리즘 탑재 프리미엄 안마의자',
      thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&w=600&q=80',
      planId: 'plan_boram_55',
      monthly: 59000,
      cardBenefitPrice: 42000
    },
    {
      id: 'prod3',
      name: '쿠쿠 인앤아웃 얼음정수기',
      categoryId: 'living',
      modelName: 'CP-SS100HW',
      description: '직수형 얼음 정수기, 자동 살균 시스템 및 초고속 직수 제빙 기능 제공',
      thumbnail: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=600&q=80',
      planId: 'plan_preed_396',
      monthly: 33000,
      cardBenefitPrice: 13000
    },
    {
      id: 'prod4',
      name: 'LG gram 17인치 프리미엄',
      categoryId: 'digital',
      modelName: '17Z90S-GA56K',
      description: '초대형 17인치 화면에 1.35kg 초경량, 하루 종일 지속되는 대용량 배터리 장착',
      thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      planId: 'plan_kyowon_299',
      monthly: 39000,
      cardBenefitPrice: 19000
    },
    {
      id: 'prod5',
      name: '자코모 베니 4인 가죽소파',
      categoryId: 'furniture',
      modelName: 'JKM-BENI',
      description: '천연 가죽의 명품 자코모 소파, 고밀도 폼 충전재로 최고의 안락함 선사',
      thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      planId: 'plan_daemyung_429',
      monthly: 49000,
      cardBenefitPrice: 32000
    }
  ];

  const mockSellers = [
    { id: 's_1', name: '김철수', phone: '010-1234-5678', address: '(06132) 서울 강남구 테헤란로 152 5층', username: 'chulsoo', password: 'password123', subdomain: 'chulsoo', status: '승인', registerDate: '2026-06-01T10:00:00.000Z' },
    { id: 's_2', name: '이영희', phone: '010-9876-5432', address: '(04123) 서울 마포구 백범로 31 2층', username: 'younghee', password: 'password123', subdomain: 'younghee', status: '보류', registerDate: '2026-06-25T11:00:00.000Z' }
  ];

  const mockConsultations = [
    { id: 'c_1', name: '홍길동', phone: '010-2222-3333', hopeItem: '삼성 갤럭시북4 프리미엄', hopeBrand: '대명아임레디', purpose: '노후가전교체', budget: '3~5만원', consultTime: '오후', userMessage: '빠른 상담 바랍니다.', sellerId: 'chulsoo', registerDate: '2026-06-24T14:30:00.000Z', status: '계약 완료' },
    { id: 'c_2', name: '박영희', phone: '010-4444-5555', hopeItem: 'LG gram 17인치 프리미엄', hopeBrand: '교원라이프', purpose: '신혼가구/신규입주', budget: '5~7만원', consultTime: '오전', userMessage: '주말 연락 희망합니다.', sellerId: '', registerDate: '2026-06-25T09:15:00.000Z', status: '신규 접수' },
    { id: 'c_3', name: '최철수', phone: '010-7777-8888', hopeItem: '바디프랜드 다빈치 안마의자', hopeBrand: '보람상조', purpose: '부모님효도선물', budget: '7만원이상', consultTime: '빠른상담', userMessage: '', sellerId: 'chulsoo', registerDate: '2026-06-25T10:20:00.000Z', status: '상담 진행중' }
  ];

  // LocalStorage initialization is now handled dynamically in the fallback of initData()

  // Dynamic DB Fetch Helper Functions
  const autoDetermineCategory = (name, desc) => {
    const text = (name + ' ' + (desc || '')).toLowerCase();
    
    if (text.includes('안마의자') || text.includes('다빈치') || text.includes('시그니처') || text.includes('아트모션') || text.includes('온열기') || text.includes('마사지') || text.includes('세라젬') || text.includes('바디프랜드')) {
      return 'massage';
    }
    if (text.includes('정수기')) {
      return 'water';
    }
    if (text.includes('노트북') || text.includes('그램') || text.includes('gram') || text.includes('갤럭시북') || text.includes('맥북')) {
      return 'laptop';
    }
    if (text.includes('tv') || text.includes('티비') || text.includes('텔레비전') || text.includes('방송')) {
      return 'tv';
    }
    if (text.includes('김치냉장고') || text.includes('냉장고') || text.includes('쇼케이스') || text.includes('냉동고') || text.includes('4도어')) {
      return 'fridge';
    }
    if (text.includes('세탁기') || text.includes('워시타워') || text.includes('드럼세탁') || text.includes('통돌이')) {
      return 'washer';
    }
    if (text.includes('건조기')) {
      return 'dryer';
    }
    if (text.includes('에어컨') || text.includes('에어콘') || text.includes('벽걸이') || text.includes('스탠드형') || text.includes('무풍')) {
      return 'aircon';
    }
    if (text.includes('공기청정기') || text.includes('에어퓨리파이어') || text.includes('공청기')) {
      return 'airpurifier';
    }
    if (text.includes('청소기') || text.includes('로봇청소기') || text.includes('코드제로') || text.includes('제트')) {
      return 'cleaner';
    }
    if (text.includes('의류관리기') || text.includes('스타일러') || text.includes('에어드레서')) {
      return 'styler';
    }
    if (text.includes('소파') || text.includes('침대') || text.includes('가구') || text.includes('식탁') || text.includes('매트리스') || text.includes('리클라이너')) {
      return 'furniture';
    }
    return 'general';
  };

  let BRAND_DATA = [];
  let PRODUCT_DATA = [];
  let PLAN_DATA = [];

  async function initData() {
    try {
      if (!convex) {
        throw new Error("Convex URL is not defined.");
      }
      const rawBrands = await convex.query(api.brands.get);
      BRAND_DATA = rawBrands.map(b => ({
        ...b,
        logoImage: b.logoUrl || b.logoImage || null
      }));
      PRODUCT_DATA = await convex.query(api.products.get);
      PLAN_DATA = await convex.query(api.plans.get);

      if (BRAND_DATA.length === 0 && PRODUCT_DATA.length === 0 && PLAN_DATA.length === 0) {
        console.log("Convex DB is empty. Seeding local/default data...");
        const localBrands = JSON.parse(localStorage.getItem('lifemoa_brands')) || defaultBrands;
        const localPlans = JSON.parse(localStorage.getItem('lifemoa_plans')) || defaultPlans;
        
        let localProducts = JSON.parse(localStorage.getItem('lifemoa_products')) || defaultProducts;
        // Apply migration if needed
        const oldCategories = ['digital', 'health', 'living'];
        if (localProducts.some(p => oldCategories.includes(p.categoryId))) {
          localProducts = localProducts.map(p => {
            if (oldCategories.includes(p.categoryId)) {
              p.categoryId = autoDetermineCategory(p.name, p.description || p.modelName || '');
            }
            return p;
          });
        }

        // Sanitize for Convex validators
        const seedBrands = localBrands.map(b => ({
          id: b.id,
          name: b.name,
          desc: b.desc,
          logoText: b.logoText || b.name.substring(0, 2),
          fee: Number(b.fee) || 0,
          logoUrl: b.logoUrl || b.logoImage || undefined
        }));

        const seedPlans = localPlans.map(p => ({
          id: p.id,
          brandId: p.brandId,
          name: p.name,
          funeralService: p.funeralService,
          refundRate: p.refundRate,
          depositOrg: p.depositOrg,
          convertService: p.convertService,
          membershipService: p.membershipService,
          maturityRound: Number(p.maturityRound),
          paymentSections: (p.paymentSections || []).map(s => ({
            start: Number(s.start),
            end: Number(s.end),
            funeralAmount: Number(s.funeralAmount),
            applianceAmount: Number(s.applianceAmount)
          })),
          notices: p.notices || [],
          cards: (p.cards || []).map(c => ({
            name: c.name,
            image: c.image || '',
            annualFee: Number(c.annualFee) || 0,
            benefits: c.benefits || [],
            phoneApply: c.phoneApply || '',
            onlineApplyUrl: c.onlineApplyUrl || ''
          }))
        }));

        const seedProducts = localProducts.map(p => ({
          id: p.id,
          name: p.name,
          categoryId: p.categoryId,
          modelName: p.modelName || '',
          description: p.description || '',
          thumbnail: p.thumbnail || '',
          planId: p.planId,
          accounts: p.accounts !== undefined ? Number(p.accounts) : undefined,
          monthly: Number(p.monthly) || 0,
          cardBenefitPrice: Number(p.cardBenefitPrice) || 0
        }));

        await convex.mutation(api.brands.seed, { items: seedBrands });
        await convex.mutation(api.plans.seed, { items: seedPlans });
        await convex.mutation(api.products.seed, { items: seedProducts });

        const localSellers = JSON.parse(localStorage.getItem('lifemoa_sellers')) || mockSellers;
        const seedSellers = localSellers.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          address: s.address,
          username: s.username,
          password: s.password,
          subdomain: s.subdomain,
          status: s.status,
          registerDate: s.registerDate
        }));
        const localConsultations = JSON.parse(localStorage.getItem('lifemoa_consultations')) || mockConsultations;
        const seedConsultations = localConsultations.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          hopeItem: c.hopeItem || '',
          hopeBrand: c.hopeBrand || '',
          purpose: c.purpose || '',
          budget: c.budget || '',
          consultTime: c.consultTime || '',
          userMessage: c.userMessage || '',
          sellerId: c.sellerId || '',
          registerDate: c.registerDate,
          status: c.status
        }));
        await convex.mutation(api.sellers.seed, { items: seedSellers });
        await convex.mutation(api.consultations.seed, { items: seedConsultations });

        const rawBrandsRefetched = await convex.query(api.brands.get);
        BRAND_DATA = rawBrandsRefetched.map(b => ({
          ...b,
          logoImage: b.logoUrl || b.logoImage || null
        }));
        PRODUCT_DATA = await convex.query(api.products.get);
        PLAN_DATA = await convex.query(api.plans.get);
        console.log("Seeding to Convex completed.");
      }
    } catch (err) {
      console.warn("Convex connection failed, falling back to LocalStorage:", err);
      BRAND_DATA = JSON.parse(localStorage.getItem('lifemoa_brands')) || defaultBrands;
      PLAN_DATA = JSON.parse(localStorage.getItem('lifemoa_plans')) || defaultPlans;
      
      let prods = JSON.parse(localStorage.getItem('lifemoa_products') || '[]');
      const oldCategories = ['digital', 'health', 'living'];
      if (prods.some(p => oldCategories.includes(p.categoryId))) {
        prods = prods.map(p => {
          if (oldCategories.includes(p.categoryId)) {
            p.categoryId = autoDetermineCategory(p.name, p.description || p.modelName || '');
          }
          return p;
        });
        localStorage.setItem('lifemoa_products', JSON.stringify(prods));
      }
      PRODUCT_DATA = prods.length > 0 ? prods : defaultProducts;
    }
  }

  const CATEGORY_DATA = [
    { id: 'all', name: '전체' },
    { id: 'tv', name: 'TV' },
    { id: 'fridge', name: '냉장고' },
    { id: 'washer', name: '세탁기' },
    { id: 'dryer', name: '건조기' },
    { id: 'aircon', name: '에어컨' },
    { id: 'airpurifier', name: '공기청정기' },
    { id: 'cleaner', name: '청소기' },
    { id: 'styler', name: '의류관리기' },
    { id: 'furniture', name: '가구' },
    { id: 'laptop', name: '노트북' },
    { id: 'water', name: '정수기' },
    { id: 'massage', name: '안마의자' },
    { id: 'general', name: '일반가전' }
  ];

  /* ==========================================================================
     DOM Elements
     ========================================================================== */
  // Flow Selector Tabs
  const btnFlowAppliance = document.getElementById('flow-tab-appliance');
  const btnFlowBrand = document.getElementById('flow-tab-brand');
  const viewFlowAppliance = document.getElementById('flow-appliance-view');
  const viewFlowBrand = document.getElementById('flow-brand-view');

  // Appliance Flow Elements
  const containerPills = document.getElementById('category-filter-pills');
  const gridApplianceProducts = document.getElementById('appliance-product-grid');

  // Brand Flow Elements
  const gridBrands = document.getElementById('brands-selector-grid');
  const containerBrandProducts = document.getElementById('brand-products-container');
  const displaySelectedBrandName = document.getElementById('selected-brand-name-display');
  const gridBrandProducts = document.getElementById('brand-product-grid');

  // Product Detail Modal Elements
  const modalProductDetail = document.getElementById('product-detail-modal');
  const btnCloseProductModal = document.getElementById('product-modal-close');
  const txtModalCategory = document.getElementById('modal-product-category');
  const txtModalName = document.getElementById('modal-product-name');
  const txtModalDesc = document.getElementById('modal-product-description');
  const listModalSpecs = document.getElementById('modal-product-specs');
  const cardsBodyModalPricing = document.getElementById('modal-pricing-cards-body');

  // Form Auto-fill targets
  const selectItemDropdown = document.getElementById('select-item');
  const selectBrandDropdown = document.getElementById('select-brand');
  const nameInput = document.getElementById('user-name');

  // Consultation Modal Elements
  const consultFormModal = document.getElementById('consult-form-modal');
  const consultModalClose = document.getElementById('consult-modal-close');
  const modalPhoneInput = document.getElementById('modal-user-phone');
  const modalForm = document.getElementById('modal-consult-form');
  const modalPrivacyOpen = document.getElementById('modal-privacy-policy-open');

  // Brand ID to Name Mapper
  function getBrandName(brandId) {
    const brand = BRAND_DATA.find(b => b.id === brandId);
    return brand ? brand.name : brandId;
  }

  /* ==========================================================================
     Dual Choice Flow Switching
     ========================================================================== */
  if (btnFlowAppliance && btnFlowBrand) {
    btnFlowAppliance.addEventListener('click', () => {
      btnFlowAppliance.classList.add('active');
      btnFlowBrand.classList.remove('active');
      viewFlowAppliance.classList.add('active');
      viewFlowBrand.classList.remove('active');
    });

    btnFlowBrand.addEventListener('click', () => {
      btnFlowBrand.classList.add('active');
      btnFlowAppliance.classList.remove('active');
      viewFlowBrand.classList.add('active');
      viewFlowAppliance.classList.remove('active');
      
      // Auto select first brand if none selected yet
      const firstBrandCard = gridBrands.querySelector('.brand-card');
      if (firstBrandCard && !gridBrands.querySelector('.brand-card.active')) {
        firstBrandCard.click();
      }
    });
  }

  /* ==========================================================================
     Modal Operation Functions
     ========================================================================== */
  function formatDescriptionText(text) {
    if (!text) return '미등록';
    
    // 0. If it is an array, format each item into bullet point
    if (Array.isArray(text)) {
      return text.map(item => {
        if (!item || !item.trim()) return '';
        if (item.includes(' (')) {
          const parts = item.split(' (');
          const title = parts[0].trim();
          const details = parts[1].replace(')', '').trim();
          const detailLines = details.split(/,\s*/)
                                     .map(line => `<div class="formatted-bullet-line sub-bullet"><span class="bullet-dot">•</span> ${line.trim()}</div>`)
                                     .join('');
          return `<div class="formatted-title-line">${title}</div>${detailLines}`;
        }
        return `<div class="formatted-bullet-line"><span class="bullet-dot">•</span> ${item.trim()}</div>`;
      }).filter(Boolean).join('');
    }
    
    // First convert any literal newlines to HTML line breaks
    let formatted = text.replace(/\r?\n/g, '<br>');
    
    // 1. If it contains " / ", split by " / " and convert to bullet points
    if (formatted.includes(' / ')) {
      return formatted.split(' / ')
                      .map(item => `<div class="formatted-bullet-line"><span class="bullet-dot">•</span> ${item.trim()}</div>`)
                      .join('');
    }
    
    // 2. If it has parentheses like "서비스 (전문 장례지도사..., 고급 리무진..., ...)", format nicely.
    if (formatted.includes(' (')) {
      const parts = formatted.split(' (');
      const title = parts[0].trim();
      const details = parts[1].replace(')', '').trim();
      
      // Split details by comma
      const detailLines = details.split(/,\s*/)
                                 .map(line => `<div class="formatted-bullet-line sub-bullet"><span class="bullet-dot">•</span> ${line.trim()}</div>`)
                                 .join('');
      return `<div class="formatted-title-line">${title}</div>${detailLines}`;
    }
    
    // 3. Fallback: split long text containing commas into separate lines if it looks like a list
    if (formatted.length > 40 && formatted.includes(', ')) {
      return formatted.split(/,\s*/)
                      .map(item => `<div class="formatted-bullet-line"><span class="bullet-dot">•</span> ${item.trim()}</div>`)
                      .join('');
    }
    
    return formatted;
  }

  function formatCardBenefit(text) {
    if (!text) return '';
    const regex = /전월\s*실적\s*([0-9a-zA-Z가-힣,\s~]+이상)\s*(?:결제\s*시|시)?\s*(월\s*[0-9a-zA-Z가-힣,\s~]+원\s*(?:청구\s*)?할인|월\s*[0-9a-zA-Z가-힣,\s~]+원\s*할인)/;
    const match = text.match(regex);
    if (match) {
      const cond = match[1].trim();
      const price = match[2].trim();
      return `<span class="benefit-tag cond-tag">실적</span><span class="benefit-cond">${cond}</span><span class="benefit-arrow">➔</span><span class="benefit-tag price-tag">할인</span><strong class="benefit-price">${price}</strong>`;
    }
    return text;
  }

  function parseCardBenefit(text) {
    if (!text) return { cond: '', price: '' };
    const regex = /전월\s*실적\s*([0-9a-zA-Z가-힣,\s~]+이상)\s*(?:결제\s*시|시)?\s*(월\s*[0-9a-zA-Z가-힣,\s~]+원\s*(?:청구\s*)?할인|월\s*[0-9a-zA-Z가-힣,\s~]+원\s*할인)/;
    const match = text.match(regex);
    if (match) {
      return {
        cond: match[1].trim(),
        price: match[2].trim()
      };
    }
    return {
      cond: '기타 조건',
      price: text
    };
  }

  function formatCoreValue(val) {
    if (!val) return '';
    if (val.includes(' (')) {
      const parts = val.split(' (');
      const main = parts[0].trim();
      const sub = parts[1].replace(')', '').trim();
      return `<div class="main-val">${main}</div><div class="sub-val">${sub}</div>`;
    }
    return `<div class="main-val">${val}</div>`;
  }

  function openProductModal(productId) {
    const product = PRODUCT_DATA.find(p => p.id === productId);
    if (!product) return;

    // 1. Populate text fields
    const category = CATEGORY_DATA.find(c => c.id === product.categoryId);
    txtModalCategory.textContent = `${category ? category.name : '가전'} | ${product.accounts || 1}구좌`;
    txtModalName.textContent = product.name;
    txtModalDesc.textContent = product.description;

    const txtModalModelName = document.getElementById('modal-product-model-name');
    if (txtModalModelName) txtModalModelName.textContent = product.modelName || '';

    // 1.5 Bind product image
    const imgModalThumb = document.getElementById('modal-product-thumb');
    if (imgModalThumb) imgModalThumb.src = product.thumbnail || '';

    // 1.6 Bind search reference button
    const btnModalReference = document.getElementById('modal-product-reference-btn');
    if (btnModalReference) {
      btnModalReference.onclick = () => {
        const query = `${product.name} ${product.modelName}`;
        window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, '_blank');
      };
    }

    // 2. Populate specs bullets (if element exists)
    if (listModalSpecs) {
      listModalSpecs.innerHTML = '';
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          const li = document.createElement('li');
          li.textContent = spec;
          listModalSpecs.appendChild(li);
        });
      }
    }

    // 3. Populate comparative pricing cards
    cardsBodyModalPricing.innerHTML = '';
    const plan = PLAN_DATA.find(p => p.id === product.planId);
    if (plan) {
      const brandName = getBrandName(plan.brandId);
      const brandId = plan.brandId;
      
      // Build Payment Sections HTML
      let paymentSectionsHtml = '';
      if (plan.paymentSections && plan.paymentSections.length > 0) {
        plan.paymentSections.forEach(s => {
          const total = (Number(s.funeralAmount) || 0) + (Number(s.applianceAmount) || 0);
          paymentSectionsHtml += `
            <div class="payment-section-row-premium">
              <div class="rounds-badge">${s.start}회 ~ ${s.end}회</div>
              <div class="amount-split">
                <div class="amount-part">
                  <span class="part-label">상조부금</span>
                  <span class="part-value">${(Number(s.funeralAmount) || 0).toLocaleString()}원</span>
                </div>
                <div class="amount-operator">+</div>
                <div class="amount-part">
                  <span class="part-label">가전대금</span>
                  <span class="part-value">${(Number(s.applianceAmount) || 0).toLocaleString()}원</span>
                </div>
              </div>
              <div class="total-box">
                <span class="total-label">월 납입금</span>
                <span class="total-value">${total.toLocaleString()}원</span>
              </div>
            </div>
          `;
        });
      } else {
        paymentSectionsHtml = '<div class="payment-section-item" style="text-align: center; padding: 12px; font-size: 0.82rem; color: var(--text-muted);">납입 구간 정보가 등록되지 않았습니다.</div>';
      }
      
      // Build Cards Benefits HTML
      let cardsBenefitsHtml = '';
      if (plan.cards && plan.cards.length > 0) {
        plan.cards.forEach(c => {
          let tableRowsHtml = '';
          if (c.benefits && c.benefits.length > 0) {
            c.benefits.forEach((b, idx) => {
              const parsed = parseCardBenefit(b);
              const isLastRow = idx === c.benefits.length - 1;
              const borderBottomStyle = isLastRow ? '' : 'border-bottom: 1px solid var(--border-color);';
              tableRowsHtml += `
                <tr style="${borderBottomStyle}">
                  <td style="padding: 8px 12px; text-align: center; color: var(--text-dark); font-weight: 700; border-right: 1px solid var(--border-color); background-color: #FFFFFF;">${parsed.cond}</td>
                  <td style="padding: 8px 12px; text-align: center; color: var(--accent-color); font-weight: 850; background-color: #FFFFFF;">${parsed.price}</td>
                </tr>
              `;
            });
          }
          
          let actionButtonsHtml = '';
          if (c.phoneApply) {
            actionButtonsHtml += `<a href="tel:${c.phoneApply}" class="btn-card-apply">전화신청 (${c.phoneApply})</a>`;
          }
          if (c.onlineApplyUrl) {
            actionButtonsHtml += `<a href="${c.onlineApplyUrl}" target="_blank" class="btn-card-apply online">온라인 신청</a>`;
          }
          
          cardsBenefitsHtml += `
            <div class="cards-benefit-card" style="align-items: stretch;">
              <div class="card-main-content" style="align-items: center; gap: 16px;">
                ${c.image ? `<img src="${c.image}" alt="${c.name}" class="benefit-card-img" style="width: 100px; height: 63px; margin-top: 0; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80'">` : ''}
                <div class="benefit-card-info" style="gap: 4px; flex-grow: 1;">
                  <div class="benefit-card-name" style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); line-height: 1.3;">${c.name}</div>
                  <div class="benefit-card-fee" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">연회비: ${c.annualFee ? parseInt(c.annualFee).toLocaleString() + '원' : '없음'}</div>
                </div>
              </div>
              
              <div class="card-benefits-table-wrapper" style="margin-top: 12px;">
                <table class="card-benefits-table" style="width: 100%; border-collapse: collapse; font-size: 0.82rem; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-color);">
                  <thead>
                    <tr style="background-color: var(--bg-light); border-bottom: 1px solid var(--border-color);">
                      <th style="padding: 8px 12px; font-weight: 800; color: var(--text-muted); text-align: center; width: 45%; border-right: 1px solid var(--border-color);">전월 실적</th>
                      <th style="padding: 8px 12px; font-weight: 800; color: var(--text-muted); text-align: center; width: 55%;">청구 할인</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>
              
              <div class="card-action-links">
                ${actionButtonsHtml}
              </div>
            </div>
          `;
        });
      } else {
        cardsBenefitsHtml = '<div class="cards-benefit-card">등록된 제휴카드 정보가 없습니다.</div>';
      }
      
      // Build Notices HTML
      let noticesHtml = '';
      if (plan.notices && plan.notices.length > 0) {
        plan.notices.forEach(n => {
          noticesHtml += `<li>${n}</li>`;
        });
      } else {
        noticesHtml = '<li>별도의 주요 안내사항이 없습니다.</li>';
      }
      
      const card = document.createElement('div');
      card.className = 'brand-price-card premium-detail-card';
      card.innerHTML = `
        <div class="premium-card-header">
          <div class="brand-info-header">
            <span class="brand-badge brand-${brandId}">${brandName}</span>
            <h5 class="plan-name-title">${plan.name}</h5>
          </div>
          <button type="button" class="modal-apply-btn apply-modal-pricing-btn" 
            data-product="${product.name}" 
            data-brand="${brandName}">
            <span>무료상담 신청</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="apply-btn-arrow"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <div class="premium-core-list">
          <div class="core-list-row">
            <span class="row-label">월 기본납입금</span>
            <span class="row-value monthly-price-val">월 ${(Number(product.monthly) || 0).toLocaleString()}원</span>
          </div>
          <div class="core-list-row">
            <span class="row-label">제휴카드 최대 혜택가</span>
            <span class="row-value benefit-price-val">월 ${(Number(product.cardBenefitPrice) || 0).toLocaleString()}원</span>
          </div>
          <div class="core-list-row">
            <span class="row-label">만기 환급율</span>
            <span class="row-value">${formatCoreValue(plan.refundRate || '100%')}</span>
          </div>
          <div class="core-list-row">
            <span class="row-label">선수금 예치 기관</span>
            <span class="row-value">${formatCoreValue(plan.depositOrg || '신한은행 등')}</span>
          </div>
        </div>
        
        <div class="premium-details-content">
          <div class="details-section">
            <div class="section-title-small">구좌별 상세 납입금 구조</div>
            <div class="payment-sections-list">
              ${paymentSectionsHtml}
            </div>
          </div>
          
          <div class="details-section">
            <div class="section-title-small">제휴카드 할인 혜택 안내</div>
            <div class="cards-benefits-list">
              ${cardsBenefitsHtml}
            </div>
          </div>
          
          <div class="details-section-grid">
            <div class="grid-detail-item">
              <div class="section-title-small">장례서비스 구성</div>
              <div class="item-text-desc">${formatDescriptionText(plan.funeralService)}</div>
            </div>
            <div class="grid-detail-item">
              <div class="section-title-small">전환서비스 구성</div>
              <div class="item-text-desc">${formatDescriptionText(plan.convertService)}</div>
            </div>
            <div class="grid-detail-item span-2">
              <div class="section-title-small">멤버십 서비스 구성</div>
              <div class="item-text-desc">${formatDescriptionText(plan.membershipService)}</div>
            </div>
          </div>
          
          <div class="details-section">
            <div class="section-title-small">주요 안내사항</div>
            <ul class="modal-notice-bullets">
              ${noticesHtml}
            </ul>
          </div>
        </div>
      `;
      cardsBodyModalPricing.appendChild(card);
    }

    // 4. Open Modal
    modalProductDetail.classList.add('active');

    // 5. Add Apply Button Listeners inside Modal
    const applyBtns = cardsBodyModalPricing.querySelectorAll('.apply-modal-pricing-btn');
    applyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedProduct = e.currentTarget.getAttribute('data-product');
        const selectedBrand = e.currentTarget.getAttribute('data-brand');
        
        applyMatchingSelection(selectedProduct, selectedBrand);
      });
    });
  }

  function closeProductModal() {
    modalProductDetail.classList.remove('active');
  }

  if (btnCloseProductModal) {
    btnCloseProductModal.addEventListener('click', closeProductModal);
  }

  // Close modal when clicking on backdrop overlay (Disabled per user request: do not close when clicked outside)
  /*
  if (modalProductDetail) {
    modalProductDetail.addEventListener('click', (e) => {
      if (e.target === modalProductDetail) {
        closeProductModal();
      }
    });
  }
  */

  function openConsultFormModal(hopeItem, hopeBrand, purpose, budget) {
    if (!consultFormModal) return;

    const modalSelectItem = document.getElementById('modal-select-item');
    const modalSelectBrand = document.getElementById('modal-select-brand');
    const modalSelectPurpose = document.getElementById('modal-select-purpose');
    const modalSelectBudget = document.getElementById('modal-select-budget');

    if (modalSelectItem && hopeItem) {
      let itemExists = false;
      for (let i = 0; i < modalSelectItem.options.length; i++) {
        if (modalSelectItem.options[i].value === hopeItem) {
          itemExists = true;
          break;
        }
      }
      if (!itemExists) {
        const option = document.createElement('option');
        option.value = hopeItem;
        option.textContent = hopeItem;
        modalSelectItem.appendChild(option);
      }
      modalSelectItem.value = hopeItem;
    }

    if (modalSelectBrand && hopeBrand) {
      modalSelectBrand.value = hopeBrand;
    }

    if (modalSelectPurpose && purpose) {
      modalSelectPurpose.value = purpose;
    }

    if (modalSelectBudget && budget) {
      modalSelectBudget.value = budget;
    }

    consultFormModal.classList.add('active');
  }

  // Auto fill logic from modal selection
  function applyMatchingSelection(productName, brandName) {
    // 1. Close product detail modal
    closeProductModal();

    // 2. Open consultation form modal and prefill it
    openConsultFormModal(productName, brandName);
  }

  /* ==========================================================================
     Flow 1: Appliance First Flow Rendering
     ========================================================================== */
  function getApplianceBrand(productName) {
    if (!productName) return '기타';
    const name = productName.toUpperCase();
    if (name.includes('삼성') || name.includes('SAMSUNG')) return '삼성';
    if (name.includes('LG') || name.includes('엘지')) return 'LG';
    if (name.includes('쿠쿠') || name.includes('CUCKOO')) return '쿠쿠';
    if (name.includes('자코모') || name.includes('JAKOMO')) return '자코모';
    if (name.includes('하이얼') || name.includes('HAIER')) return '하이얼';
    if (name.includes('바디프랜드') || name.includes('BODYFRIEND')) return '바디프랜드';
    if (name.includes('코지마') || name.includes('COZYMA')) return '코지마';
    if (name.includes('휴테크') || name.includes('HUTECH')) return '휴테크';
    if (name.includes('세라젬') || name.includes('CERAGEM')) return '세라젬';
    if (name.includes('다이슨') || name.includes('DYSON')) return '다이슨';
    return '기타';
  }

  function getProductPriceRanges(products) {
    const buckets = new Set();
    products.forEach(p => {
      const price = Number(p.monthly) || 0;
      if (price <= 0) return;
      const unit = Math.floor(price / 10000);
      buckets.add(unit);
    });

    const sortedUnits = Array.from(buckets).sort((a, b) => a - b);
    return sortedUnits.map(unit => {
      if (unit === 0) {
        return { id: '0-9999', name: '1만원 미만' };
      }
      const min = unit * 10000;
      const max = (unit + 1) * 10000 - 1;
      return { id: `${min}-${max}`, name: `${unit}만원대` };
    });
  }

  function getProductBrands(products) {
    const brandsSet = new Set();
    products.forEach(p => {
      brandsSet.add(getApplianceBrand(p.name));
    });
    const brands = Array.from(brandsSet).sort();
    const hasEtc = brands.includes('기타');
    let sortedBrands = brands.filter(b => b !== '기타');
    if (hasEtc) sortedBrands.push('기타');
    return sortedBrands.map(b => ({ id: b, name: b }));
  }

  let applianceFilters = {
    mutual: [],
    category: [],
    brand: [],
    price: [],
    accounts: []
  };

  let brandViewApplianceFilters = {
    category: [],
    brand: [],
    price: [],
    accounts: []
  };

  function renderFilterChips(containerId, options, activeArray, onUpdate) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // '전체' 칩 생성
    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'filter-chip';
    allChip.textContent = '전체';
    const isAllActive = activeArray.length === 0;
    if (isAllActive) {
      allChip.classList.add('active');
    }
    allChip.addEventListener('click', () => {
      activeArray.length = 0;
      renderFilterChips(containerId, options, activeArray, onUpdate);
      onUpdate();
    });
    container.appendChild(allChip);

    // 각 세부 옵션 칩 생성
    options.forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-chip';
      chip.textContent = opt.name;
      if (!isAllActive && activeArray.includes(opt.id)) {
        chip.classList.add('active');
      }

      chip.addEventListener('click', () => {
        const idx = activeArray.indexOf(opt.id);
        if (idx > -1) {
          activeArray.splice(idx, 1);
        } else {
          activeArray.push(opt.id);
        }
        renderFilterChips(containerId, options, activeArray, onUpdate);
        onUpdate();
      });
      container.appendChild(chip);
    });
  }

  function initSmartFilters() {
    const mutualOptions = BRAND_DATA.map(b => ({ id: b.id, name: b.name }));
    const categoryOptions = CATEGORY_DATA.filter(c => c.id !== 'all').map(c => ({ id: c.id, name: c.name }));
    const dynamicBrands = getProductBrands(PRODUCT_DATA);
    const dynamicPrices = getProductPriceRanges(PRODUCT_DATA);
    const accountsOptions = [{ id: '1', name: '1구좌' }, { id: '2', name: '2구좌' }, { id: '3', name: '3구좌' }, { id: '4', name: '4구좌' }];

    const updateApplianceFilters = () => {
      renderApplianceProducts();
    };

    renderFilterChips('filter-chips-mutual', mutualOptions, applianceFilters.mutual, updateApplianceFilters);
    renderFilterChips('filter-chips-category', categoryOptions, applianceFilters.category, updateApplianceFilters);
    renderFilterChips('filter-chips-brand', dynamicBrands, applianceFilters.brand, updateApplianceFilters);
    renderFilterChips('filter-chips-price', dynamicPrices, applianceFilters.price, updateApplianceFilters);
    renderFilterChips('filter-chips-accounts', accountsOptions, applianceFilters.accounts, updateApplianceFilters);

    const btnApplianceReset = document.getElementById('btn-appliance-filter-reset');
    if (btnApplianceReset) {
      btnApplianceReset.onclick = () => {
        applianceFilters.mutual = [];
        applianceFilters.category = [];
        applianceFilters.brand = [];
        applianceFilters.price = [];
        applianceFilters.accounts = [];
        renderFilterChips('filter-chips-mutual', mutualOptions, applianceFilters.mutual, updateApplianceFilters);
        renderFilterChips('filter-chips-category', categoryOptions, applianceFilters.category, updateApplianceFilters);
        renderFilterChips('filter-chips-brand', dynamicBrands, applianceFilters.brand, updateApplianceFilters);
        renderFilterChips('filter-chips-price', dynamicPrices, applianceFilters.price, updateApplianceFilters);
        renderFilterChips('filter-chips-accounts', accountsOptions, applianceFilters.accounts, updateApplianceFilters);
        updateApplianceFilters();
      };
    }

    const btnBrandReset = document.getElementById('btn-brand-filter-reset');
    if (btnBrandReset) {
      btnBrandReset.onclick = () => {
        brandViewApplianceFilters.category = [];
        brandViewApplianceFilters.brand = [];
        brandViewApplianceFilters.price = [];
        brandViewApplianceFilters.accounts = [];
        initBrandFiltersUI();
        renderBrandSpecificProducts();
      };
    }
  }

  function initBrandFiltersUI() {
    const brandSpecificProducts = PRODUCT_DATA.filter(p => {
      const plan = PLAN_DATA.find(planItem => planItem.id === p.planId);
      return plan && plan.brandId === currentActiveBrandId;
    });
    const dynamicBrands = getProductBrands(brandSpecificProducts);
    const dynamicPrices = getProductPriceRanges(brandSpecificProducts);
    const accountsOptions = [{ id: '1', name: '1구좌' }, { id: '2', name: '2구좌' }, { id: '3', name: '3구좌' }, { id: '4', name: '4구좌' }];

    const categoryOptions = CATEGORY_DATA.filter(c => c.id !== 'all').map(c => ({ id: c.id, name: c.name }));
    const updateBrandFilters = () => {
      renderBrandSpecificProducts();
    };
    renderFilterChips('filter-chips-brand-category', categoryOptions, brandViewApplianceFilters.category, updateBrandFilters);
    renderFilterChips('filter-chips-brand-brand', dynamicBrands, brandViewApplianceFilters.brand, updateBrandFilters);
    renderFilterChips('filter-chips-brand-price', dynamicPrices, brandViewApplianceFilters.price, updateBrandFilters);
    renderFilterChips('filter-chips-brand-accounts', accountsOptions, brandViewApplianceFilters.accounts, updateBrandFilters);
  }

  function renderApplianceProducts() {
    gridApplianceProducts.innerHTML = '';
    
    const filteredProducts = PRODUCT_DATA.filter(product => {
      // 1. 상조사 필터
      if (applianceFilters.mutual.length > 0) {
        const plan = PLAN_DATA.find(p => p.id === product.planId);
        if (!plan || !applianceFilters.mutual.includes(plan.brandId)) {
          return false;
        }
      }

      // 2. 카테고리 필터
      if (applianceFilters.category.length > 0) {
        if (!applianceFilters.category.includes(product.categoryId)) {
          return false;
        }
      }

      // 3. 브랜드 필터
      if (applianceFilters.brand.length > 0) {
        const pBrand = getApplianceBrand(product.name);
        if (!applianceFilters.brand.includes(pBrand)) {
          return false;
        }
      }

      // 4. 가격 필터
      if (applianceFilters.price.length > 0) {
        const price = Number(product.monthly) || 0;
        let matched = false;
        for (const range of applianceFilters.price) {
          const [min, max] = range.split('-').map(Number);
          if (price >= min && price <= max) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }

      // 5. 구좌수 필터
      if (applianceFilters.accounts.length > 0) {
        const prodAccounts = String(product.accounts || 1);
        if (!applianceFilters.accounts.includes(prodAccounts)) {
          return false;
        }
      }
      
      return true;
    });
      
    filteredProducts.forEach(product => {
      const plan = PLAN_DATA.find(p => p.id === product.planId);
      const monthlyTxt = product.monthly ? Number(product.monthly).toLocaleString() + '원' : '0원';
      const benefitTxt = product.cardBenefitPrice ? Number(product.cardBenefitPrice).toLocaleString() + '원' : '0원';

      // Build brand badges HTML
      let brandBadgesHtml = '';
      if (plan) {
        const name = getBrandName(plan.brandId);
        brandBadgesHtml = `<span class="brand-badge brand-${plan.brandId}">${name}</span>`;
      }

      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('data-id', product.id);
      
      const categoryName = CATEGORY_DATA.find(c => c.id === product.categoryId)?.name || '가전';

      card.innerHTML = `
        <div class="product-card-thumb-wrapper">
          <span class="account-badge account-badge-${product.accounts || 1}">${product.accounts || 1}구좌</span>
          <img src="${product.thumbnail}" alt="${product.name}" class="product-card-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy">
          <div class="product-placeholder-svg" style="display: none;">
            <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="12" width="48" height="36" rx="4"></rect>
              <line x1="8" y1="36" x2="56" y2="36"></line>
              <circle cx="20" cy="24" r="2"></circle>
              <circle cx="28" cy="24" r="2"></circle>
            </svg>
          </div>
        </div>
        <div class="product-card-info-content">
          <div class="product-card-text-group">
            <span class="product-card-category">${categoryName}</span>
            <h4 class="product-card-title">${product.name}</h4>
            <p class="product-card-model">${product.modelName}</p>
            <div class="product-card-brands-wrapper">
              <span class="brands-label">지원 상조사</span>
              <div class="product-card-brands">
                ${brandBadgesHtml}
              </div>
            </div>
          </div>
          <div class="product-card-price-action-group">
            <div class="product-card-price-container">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="product-card-price-label" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-dark);">월 납입금</span>
                <span class="product-card-price-value" style="font-size: 1.15rem; color: var(--text-main); font-weight: 800;">${monthlyTxt}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed rgba(0, 181, 148, 0.2); padding-top: 6px; margin-top: 2px;">
                <span class="product-card-price-label" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-color);">카드 혜택가</span>
                <span class="product-card-price-value" style="font-size: 1.3rem; color: var(--accent-color); font-weight: 900;">${benefitTxt}</span>
              </div>
              <div class="product-card-guarantee" style="margin-top: 6px; border-top: 1px solid rgba(0, 181, 148, 0.1); padding-top: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="guarantee-check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                상조만기 시 환급율 100% 보장
              </div>
            </div>
            <button type="button" class="product-card-btn">
              <span>상세비교 및 신청</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProductModal(product.id);
      });

      gridApplianceProducts.appendChild(card);
    });
  }

  /* ==========================================================================
     Flow 2: Brand First Flow Rendering
     ========================================================================== */
  let currentActiveBrandId = null;

  function renderBrandsGrid() {
    gridBrands.innerHTML = '';
    
    BRAND_DATA.forEach(brand => {
      const card = document.createElement('div');
      card.className = `brand-card ${brand.id === currentActiveBrandId ? 'active' : ''}`;
      card.setAttribute('data-id', brand.id);
      
      const logoHtml = brand.logoImage 
        ? `<img src="${brand.logoImage}" alt="${brand.name} 로고" style="max-height: 100%; max-width: 100%; object-fit: contain;">`
        : brand.logoText;

      card.innerHTML = `
        <div class="brand-card-logo-placeholder">${logoHtml}</div>
        <h4 class="brand-card-name">${brand.name}</h4>
        <p class="brand-card-desc">${brand.desc}</p>
      `;

      card.addEventListener('click', () => {
        currentActiveBrandId = brand.id;
        document.querySelectorAll('.brand-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        // Reset brand view filters
        brandViewApplianceFilters.category = [];
        brandViewApplianceFilters.brand = [];
        brandViewApplianceFilters.price = [];
        initBrandFiltersUI();
        
        renderBrandSpecificProducts();
      });

      gridBrands.appendChild(card);
    });
  }

  function renderBrandSpecificProducts() {
    gridBrandProducts.innerHTML = '';
    
    if (!currentActiveBrandId) return;

    const brand = BRAND_DATA.find(b => b.id === currentActiveBrandId);
    displaySelectedBrandName.textContent = brand.name;
    
    // Filter products containing this brand and matching smart filter state
    const filteredProducts = PRODUCT_DATA.filter(p => {
      const plan = PLAN_DATA.find(planItem => planItem.id === p.planId);
      if (!plan || plan.brandId !== currentActiveBrandId) {
        return false;
      }

      // 1. Category Filter
      if (brandViewApplianceFilters.category.length > 0) {
        if (!brandViewApplianceFilters.category.includes(p.categoryId)) {
          return false;
        }
      }

      // 2. Brand Filter
      if (brandViewApplianceFilters.brand.length > 0) {
        const pBrand = getApplianceBrand(p.name);
        if (!brandViewApplianceFilters.brand.includes(pBrand)) {
          return false;
        }
      }

      // 3. Price Filter
      if (brandViewApplianceFilters.price.length > 0) {
        const price = Number(p.monthly) || 0;
        let matched = false;
        for (const range of brandViewApplianceFilters.price) {
          const [min, max] = range.split('-').map(Number);
          if (price >= min && price <= max) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }

      // 4. Accounts Filter
      if (brandViewApplianceFilters.accounts.length > 0) {
        const prodAccounts = String(p.accounts || 1);
        if (!brandViewApplianceFilters.accounts.includes(prodAccounts)) {
          return false;
        }
      }

      return true;
    });
    
    filteredProducts.forEach(product => {
      const plan = PLAN_DATA.find(planItem => planItem.id === product.planId);
      const monthlyTxt = product.monthly ? Number(product.monthly).toLocaleString() + '원' : '0원';
      const benefitTxt = product.cardBenefitPrice ? Number(product.cardBenefitPrice).toLocaleString() + '원' : '0원';
      const monthsTxt = plan ? `${plan.maturityRound}회` : '0회';
      
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('data-id', product.id);

      const categoryName = CATEGORY_DATA.find(c => c.id === product.categoryId)?.name || '가전';

      card.innerHTML = `
        <div class="product-card-thumb-wrapper">
          <span class="account-badge account-badge-${product.accounts || 1}">${product.accounts || 1}구좌</span>
          <img src="${product.thumbnail}" alt="${product.name}" class="product-card-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy">
          <div class="product-placeholder-svg" style="display: none;">
            <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="12" width="48" height="36" rx="4"></rect>
              <line x1="8" y1="36" x2="56" y2="36"></line>
              <circle cx="20" cy="24" r="2"></circle>
              <circle cx="28" cy="24" r="2"></circle>
            </svg>
          </div>
        </div>
        <div class="product-card-info-content">
          <div class="product-card-text-group">
            <span class="product-card-category">${categoryName}</span>
            <h4 class="product-card-title">${product.name}</h4>
            <p class="product-card-model">${product.modelName}</p>
            <div class="product-card-brands-wrapper">
              <span class="brands-label">가입 상조사</span>
              <span class="brand-badge brand-${brand.id} accent">${brand.name}</span>
            </div>
          </div>
          <div class="product-card-price-action-group">
            <div class="product-card-price-container">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="product-card-price-label" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-dark);">월 납입금</span>
                <span class="product-card-price-value" style="font-size: 1.15rem; color: var(--text-main); font-weight: 800;">${monthlyTxt}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed rgba(0, 181, 148, 0.2); padding-top: 6px; margin-top: 2px;">
                <span class="product-card-price-label" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-color);">카드 혜택가</span>
                <span class="product-card-price-value" style="font-size: 1.3rem; color: var(--accent-color); font-weight: 900;">${benefitTxt}</span>
              </div>
              <div class="product-card-guarantee" style="margin-top: 6px; border-top: 1px solid rgba(0, 181, 148, 0.1); padding-top: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="guarantee-check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                상조만기 시 환급율 100% 보장 <span>(${monthsTxt})</span>
              </div>
            </div>
            <button type="button" class="product-card-btn">
              <span>상세비교 및 신청</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProductModal(product.id);
      });

      gridBrandProducts.appendChild(card);
    });

    containerBrandProducts.style.display = 'block';
  }

  /* ==========================================================================
     Products Layout Switching (1 Col vs 2/3/4 Cols)
     ========================================================================== */
  let currentProductLayout = 3; // Default is 3 columns

  function initLayoutControls() {
    const layoutButtons = document.querySelectorAll('.layout-btn');
    
    layoutButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLayout = Number(btn.getAttribute('data-layout'));
        currentProductLayout = selectedLayout;
        
        // Sync active class across all buttons
        layoutButtons.forEach(b => {
          if (Number(b.getAttribute('data-layout')) === currentProductLayout) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
        
        // Apply class to grids
        updateGridClasses();
      });
    });
  }

  function updateGridClasses() {
    const grids = [gridApplianceProducts, gridBrandProducts];
    grids.forEach(grid => {
      if (grid) {
        grid.classList.remove('cols-1', 'cols-2', 'cols-3', 'cols-4');
        grid.classList.add(`cols-${currentProductLayout}`);
      }
    });
  }

  // 6. Dynamic Comparison Table on Main Page
  function renderDynamicComparisonTable() {
    const wrapper = document.getElementById('dynamic-comparison-wrapper');
    if (!wrapper) return;

    const plans = PLAN_DATA;
    if (!plans || plans.length === 0) {
      wrapper.innerHTML = '<div class="text-center p-8 text-muted">등록된 상조 상품 플랜이 없습니다.</div>';
      return;
    }

    const formatFieldText = (val, defaultVal = '') => {
      if (!val) return defaultVal;
      if (Array.isArray(val)) {
        return val.map(item => `• ${item.trim()}`).join('\n');
      }
      return val;
    };

    // Build comparison header
    let theadHtml = `
      <thead>
        <tr>
          <th style="min-width: 150px; text-align: center;">비교 항목</th>
          ${plans.map(p => `
            <th class="brand-compare-header-${p.brandId}" style="min-width: 260px; text-align: center; padding: 20px 15px;">
              <span class="brand-badge brand-${p.brandId}" style="margin: 0 auto 8px; display: inline-block;">${getBrandName(p.brandId)}</span>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary-color); margin-top: 6px; line-height: 1.3;">${p.name}</div>
            </th>
          `).join('')}
        </tr>
      </thead>
    `;

    // 1. 월 기본 납입금 구조
    const paymentRowsHtml = plans.map(p => {
      if (p.paymentSections && p.paymentSections.length > 0) {
        return p.paymentSections.map(s => {
          const total = (Number(s.funeralAmount) || 0) + (Number(s.applianceAmount) || 0);
          return `<div style="font-size: 0.85rem; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <span style="font-weight: 700; color: var(--primary-color); white-space: nowrap;">${s.start}~${s.end}회</span>
            <span style="font-weight: 600; color: var(--text-main); text-align: right;">월 ${total.toLocaleString()}원</span>
          </div>`;
        }).join('');
      }
      return '<div class="text-muted" style="font-size: 0.8rem;">등록 정보 없음</div>';
    });

    // 2. 제휴카드 혜택
    const cardRowsHtml = plans.map(p => {
      if (p.cards && p.cards.length > 0) {
        return p.cards.map(c => {
          const firstBenefit = c.benefits && c.benefits.length > 0 ? c.benefits[0] : '할인 혜택 제공';
          return `<div style="text-align: left; padding: 10px; background-color: var(--bg-light); border-radius: 6px; margin-bottom: 6px; border: 1px solid var(--border-color);">
            <div style="font-weight: 800; font-size: 0.82rem; color: var(--text-main); margin-bottom: 2px;">${c.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 6px;">연회비: ${c.annualFee ? parseInt(c.annualFee).toLocaleString() + '원' : '없음'}</div>
            <div style="font-size: 0.78rem; color: var(--accent-dark); font-weight: 600; line-height: 1.3;">${firstBenefit}</div>
          </div>`;
        }).join('');
      }
      return '<div class="text-muted" style="font-size: 0.8rem;">등록 정보 없음</div>';
    });

    let tbodyHtml = `
      <tbody>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">만기 회차</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="text-align: center; font-weight: 800; color: var(--primary-color); font-size: 0.95rem;">${p.maturityRound}회 만기</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">월 납입금 구조</td>
          ${paymentRowsHtml.map((html, idx) => `<td class="compare-td-${plans[idx].brandId}" style="vertical-align: top; padding: 15px;">${html}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">제휴카드 할인 혜택</td>
          ${cardRowsHtml.map((html, idx) => `<td class="compare-td-${plans[idx].brandId}" style="vertical-align: top; padding: 15px;">${html}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">장례 서비스 구성</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="font-size: 0.82rem; text-align: left; line-height: 1.4; vertical-align: top; padding: 15px; max-width: 260px; word-break: keep-all; white-space: pre-line;">${formatFieldText(p.funeralService, '기본 의전 제공')}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">라이프 전환 서비스</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="font-size: 0.82rem; text-align: left; line-height: 1.4; vertical-align: top; padding: 15px; max-width: 260px; word-break: keep-all; white-space: pre-line;">${formatFieldText(p.convertService, '전환 서비스 지원')}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">멤버십 혜택</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="font-size: 0.82rem; text-align: left; line-height: 1.4; vertical-align: top; padding: 15px; max-width: 260px; word-break: keep-all; white-space: pre-line;">${formatFieldText(p.membershipService, '멤버십 특약 혜택')}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">만기 환급율</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="text-align: center; font-weight: 800; color: var(--accent-color); font-size: 1rem; padding: 15px;">${p.refundRate || '100%'}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">선수금 예치 기관</td>
          ${plans.map(p => `<td class="compare-td-${p.brandId}" style="text-align: center; font-size: 0.85rem; font-weight: 600; color: var(--text-main); padding: 15px;">${p.depositOrg || '상조공제조합'}</td>`).join('')}
        </tr>
        <tr>
          <td class="bold" style="text-align: center; font-weight: 800; background-color: var(--bg-light);">무료상담</td>
          ${plans.map(p => `
            <td class="compare-td-${p.brandId}" style="text-align: center; padding: 15px;">
              <button type="button" class="btn btn-accent btn-sm btn-compare-apply-now" 
                data-plan-name="${p.name}" 
                data-brand-name="${getBrandName(p.brandId)}"
                style="padding: 10px 16px; font-size: 0.85rem; width: 100%; border-radius: 6px; font-weight: 800; box-shadow: 0 4px 10px rgba(0, 181, 148, 0.15); transition: var(--transition);">
                상담 신청
              </button>
            </td>
          `).join('')}
        </tr>
      </tbody>
    `;

    wrapper.innerHTML = `<table>${theadHtml}${tbodyHtml}</table>`;

    // Bind event listeners to comparison apply buttons
    wrapper.querySelectorAll('.btn-compare-apply-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planName = e.currentTarget.getAttribute('data-plan-name');
        const brandName = e.currentTarget.getAttribute('data-brand-name');
        
        // Open consult modal and prefill it
        openConsultFormModal('', brandName);
        
        // Append plan info to message textarea
        const messageTextarea = document.getElementById('modal-user-message');
        if (messageTextarea) {
          messageTextarea.value = `[${planName}] 상품 비교 상담 신청입니다.`;
        }
      });
    });
  }

  // Initialize Selection UI rendering after loading Convex data
  async function init() {
    await initData();
    initSmartFilters();
    renderApplianceProducts();
    renderBrandsGrid();
    initLayoutControls();
    updateGridClasses();
    renderDynamicComparisonTable();
  }
  
  init();


  /* ==========================================================================
     GNB Scrolled & Mobile Toggle
     ========================================================================== */
  const header = document.querySelector('.main-header');
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Add scroll class to header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle mobile menu
  mobileNavToggle.addEventListener('click', () => {
    mobileNavToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when nav links are clicked, intercept consultation form links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#consultation-form') {
        e.preventDefault();
        openConsultFormModal();
      }
      mobileNavToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  const btnHeaderConsult = document.getElementById('btn-header-consult');
  if (btnHeaderConsult) {
    btnHeaderConsult.addEventListener('click', (e) => {
      e.preventDefault();
      openConsultFormModal();
    });
  }

  // URL ?seller=XXX 파라미터 감지 및 세션 저장
  const urlParams = new URLSearchParams(window.location.search);
  const sellerId = urlParams.get('seller');
  if (sellerId) {
    sessionStorage.setItem('lifemoa_active_seller', sellerId);
    console.log('Active seller tracked:', sellerId);
  } else {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      const subdomainSellerId = parts[0];
      sessionStorage.setItem('lifemoa_active_seller', subdomainSellerId);
      console.log('Active seller from subdomain:', subdomainSellerId);
    }
  }

  // 고객 상담 저장 헬퍼 함수 (Convex 연동)
  async function saveConsultation(data) {
    const activeSeller = sessionStorage.getItem('lifemoa_active_seller') || '';
    
    data.sellerId = activeSeller;
    data.id = 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    data.registerDate = new Date().toISOString();
    data.status = '신규 접수';
    
    try {
      if (!convex) {
        throw new Error("Convex URL is not defined.");
      }
      await convex.mutation(api.consultations.add, data);
      console.log('Consultation saved to Convex:', data);
    } catch (err) {
      console.warn('Convex save failed, falling back to LocalStorage:', err);
      const consultations = JSON.parse(localStorage.getItem('lifemoa_consultations') || '[]');
      consultations.push(data);
      localStorage.setItem('lifemoa_consultations', JSON.stringify(consultations));
    }
  }



  /* ==========================================================================
     Recommendation Target Tabs Switcher
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Set active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Set active panel
      tabPanels.forEach(panel => {
        if (panel.getAttribute('id') === targetTab) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });


  /* ==========================================================================
     FAQ Accordion Toggle
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isAlreadyActive = item.classList.contains('active');

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-body').style.maxHeight = '0';
      });

      // Toggle clicked item
      if (!isAlreadyActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // Open first item by default
  const firstAccordion = document.querySelector('.accordion-item');
  if (firstAccordion) {
    firstAccordion.classList.add('active');
    const firstBody = firstAccordion.querySelector('.accordion-body');
    firstBody.style.maxHeight = firstBody.scrollHeight + 'px';
  }

  // Load More FAQs Action
  const loadMoreFaqsBtn = document.getElementById('load-more-faqs-btn');
  const accordionContainer = document.querySelector('.accordion');
  let faqCount = 0;

  const extraFaqs = [
    {
      q: "가입 기간 중 이민이나 사망 시에는 어떻게 처리되나요?",
      a: "이민 등으로 장기 유지가 불가능한 경우, 당사 매니저를 통해 중도 해지 정산을 진행하시거나, 제3자 명의 개서 및 상속(양도/양수) 절차가 수월하게 지원됩니다. 주 피보험자 사망 발생 시에는 납부 회차와 관계없이 즉시 약정된 고품격 장례 서비스가 제공되며, 지급 완료되지 않은 잔여 가전 할부금에 대한 변제 조건 등은 각 상조사별 약관에 의거하여 친절하게 정산 처리됩니다."
    },
    {
      q: "가전제품의 배송 및 A/S 책임은 어디에 있나요?",
      a: "상조가전 결합상품에 포함된 모든 가전제품은 삼성전자, LG전자 등 정식 제조사 본사 물류망을 통해 고객님 댁으로 직접 공식 배송 및 무료 설치됩니다. 사후 A/S 서비스 역시 해당 가전 제조사의 공식 전국 서비스 센터를 통해 일반 구매 고객과 완전히 동일한 정품 보증 서비스를 보장받으실 수 있습니다."
    }
  ];

  if (loadMoreFaqsBtn && accordionContainer) {
    loadMoreFaqsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (faqCount >= extraFaqs.length) {
        alert("모든 자주 묻는 질문이 표시되었습니다.");
        loadMoreFaqsBtn.style.display = 'none';
        return;
      }

      // Add extra FAQs
      extraFaqs.forEach(faq => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
          <button class="accordion-header">
            <span>${faq.q}</span>
            <span class="accordion-arrow"></span>
          </button>
          <div class="accordion-body">
            <p>${faq.a}</p>
          </div>
        `;
        
        // Add click listener
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
          const body = item.querySelector('.accordion-body');
          const isAlreadyActive = item.classList.contains('active');

          document.querySelectorAll('.accordion-item').forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.accordion-body').style.maxHeight = '0';
          });

          if (!isAlreadyActive) {
            item.classList.add('active');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });

        accordionContainer.appendChild(item);
      });

      faqCount = extraFaqs.length;
      loadMoreFaqsBtn.style.display = 'none';
    });
  }


  /* ==========================================================================
     Form Validation & Phone Formatting
     ========================================================================== */
  const form = document.getElementById('main-consult-form');
  const phoneInput = document.getElementById('user-phone');
  const successModal = document.getElementById('success-modal');
  const successModalClose = document.getElementById('success-modal-close');
  const privacyModal = document.getElementById('privacy-modal');
  const privacyModalOpen = document.getElementById('privacy-policy-open');
  const privacyModalClose = document.getElementById('privacy-modal-close');

  // Phone number hyphen auto-insertion is handled globally at the bottom of this file

  // Open privacy modal
  if (privacyModalOpen && privacyModal) {
    privacyModalOpen.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
    });
  }

  // Close privacy modal
  if (privacyModalClose && privacyModal) {
    privacyModalClose.addEventListener('click', () => {
      privacyModal.classList.remove('active');
    });
  }

  // Form submit handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Perform validation checks
      const name = document.getElementById('user-name').value.trim();
      const phone = phoneInput.value;
      const agree = document.getElementById('privacy-agree').checked;

      if (!name) {
        alert("이름을 입력해주세요.");
        return;
      }

      if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phone)) {
        alert("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }

      if (!agree) {
        alert("개인정보 수집 및 이용 동의에 체크해주셔야 신청이 가능합니다.");
        return;
      }

      // Save consultation to localStorage
      saveConsultation({
        name: name,
        phone: phone,
        hopeItem: document.getElementById('select-item').value,
        hopeBrand: document.getElementById('select-brand').value,
        purpose: document.getElementById('select-purpose').value,
        budget: document.getElementById('select-budget').value,
        consultTime: document.getElementById('select-time').value,
        userMessage: document.getElementById('user-message').value
      });

      // Show success modal
      if (successModal) {
        successModal.classList.add('active');
      }

      // Reset form
      form.reset();
    });
  }

  // Close success modal
  if (successModalClose && successModal) {
    successModalClose.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  // Phone number auto formatting for modal form is handled globally at the bottom of this file

  // Open privacy modal from modal form link
  if (modalPrivacyOpen && privacyModal) {
    modalPrivacyOpen.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
    });
  }

  // Close consultation form modal
  if (consultModalClose && consultFormModal) {
    consultModalClose.addEventListener('click', () => {
      consultFormModal.classList.remove('active');
    });
  }

  // Submit handler for modal consultation form
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('modal-user-name').value.trim();
      const phone = modalPhoneInput.value;
      const agree = document.getElementById('modal-privacy-agree').checked;

      if (!name) {
        alert("이름을 입력해주세요.");
        return;
      }

      if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phone)) {
        alert("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }

      if (!agree) {
        alert("개인정보 수집 및 이용 동의에 체크해주셔야 신청이 가능합니다.");
        return;
      }

      // Save consultation to localStorage
      saveConsultation({
        name: name,
        phone: phone,
        hopeItem: document.getElementById('modal-select-item').value,
        hopeBrand: document.getElementById('modal-select-brand').value,
        purpose: document.getElementById('modal-select-purpose').value,
        budget: document.getElementById('modal-select-budget').value,
        consultTime: document.getElementById('modal-select-time').value,
        userMessage: document.getElementById('modal-user-message').value
      });

      // Close consultation modal
      if (consultFormModal) {
        consultFormModal.classList.remove('active');
      }

      // Show success modal
      if (successModal) {
        successModal.classList.add('active');
      }

      // Reset form
      modalForm.reset();
    });
  }


  /* ==========================================================================
     Intersection Observer (Scroll Reveal Animations)
     ========================================================================== */
  const reveals = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
      observer.observe(reveal);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    reveals.forEach(reveal => {
      reveal.classList.add('revealed');
    });
  }


  // --- Seller Recruitment & Apply Modal ---
  const sellerApplyTrigger = document.getElementById('seller-apply-trigger');
  const sellerApplyModal = document.getElementById('seller-apply-modal');
  const sellerModalClose = document.getElementById('seller-modal-close');
  const sellerPhoneInput = document.getElementById('seller-phone');
  const sellerAddressBtn = document.getElementById('seller-address-btn');
  const sellerApplyForm = document.getElementById('seller-apply-form');

  if (sellerApplyTrigger && sellerApplyModal) {
    sellerApplyTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      sellerApplyModal.classList.add('active');
    });
  }

  if (sellerModalClose && sellerApplyModal) {
    sellerModalClose.addEventListener('click', () => {
      sellerApplyModal.classList.remove('active');
    });
  }

  // Seller phone format is handled globally at the bottom of this file

  if (sellerAddressBtn) {
    sellerAddressBtn.addEventListener('click', () => {
      if (typeof daum !== 'undefined' && daum.Postcode) {
        new daum.Postcode({
          oncomplete: function(data) {
            document.getElementById('seller-zipcode').value = data.zonecode;
            document.getElementById('seller-address').value = data.roadAddress || data.address;
            document.getElementById('seller-address-detail').focus();
          }
        }).open();
      } else {
        alert('주소 검색 서비스를 불러올 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }
    });
  }

  if (sellerApplyForm) {
    sellerApplyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('seller-name').value.trim();
      const phone = sellerPhoneInput.value;
      const zipcode = document.getElementById('seller-zipcode').value;
      const address = document.getElementById('seller-address').value;
      const addressDetail = document.getElementById('seller-address-detail').value.trim();
      const username = document.getElementById('seller-username').value.trim();
      const password = document.getElementById('seller-password').value;
      const subdomain = document.getElementById('seller-subdomain').value.trim().toLowerCase();
      const agree = document.getElementById('seller-privacy-agree').checked;

      if (!name || !phone || !zipcode || !address || !addressDetail || !username || !password || !subdomain) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
      }

      if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phone)) {
        alert("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }

      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        alert("로그인 ID는 영문 및 숫자 조합이어야 합니다.");
        return;
      }

      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        alert("서브도메인은 영문 소문자, 숫자, 하이픈(-)만 포함할 수 있습니다.");
        return;
      }

      if (!agree) {
        alert("약관 동의에 체크해주셔야 파트너 신청이 가능합니다.");
        return;
      }

      const sellers = JSON.parse(localStorage.getItem('lifemoa_sellers') || '[]');
      
      const isIdDup = sellers.some(s => s.username === username) || username === 'admin';
      if (isIdDup) {
        alert("이미 존재하거나 사용할 수 없는 ID입니다.");
        return;
      }

      const isSubdomainDup = sellers.some(s => s.subdomain === subdomain) || subdomain === 'www';
      if (isSubdomainDup) {
        alert("이미 사용 중인 서브도메인 명칭입니다.");
        return;
      }

      const newSeller = {
        id: 's_' + Date.now(),
        name,
        phone,
        address: `(${zipcode}) ${address} ${addressDetail}`,
        username,
        password,
        subdomain,
        status: '보류',
        registerDate: new Date().toISOString()
      };

      if (!convex) {
        sellers.push(newSeller);
        localStorage.setItem('lifemoa_sellers', JSON.stringify(sellers));
        alert("셀러 파트너 신청서가 정상적으로 접수되었습니다. 본사 관리자의 승인(약 1~2일 소요) 후 가입하신 계정으로 로그인이 가능합니다.");
        sellerApplyModal.classList.remove('active');
        sellerApplyForm.reset();
        return;
      }

      try {
        await convex.mutation(api.sellers.add, newSeller);
        alert("셀러 파트너 신청서가 정상적으로 접수되었습니다. 본사 관리자의 승인(약 1~2일 소요) 후 가입하신 계정으로 로그인이 가능합니다.");
        sellerApplyModal.classList.remove('active');
        sellerApplyForm.reset();
      } catch (err) {
        alert(err.message || "셀러 파트너 신청에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  /* ==========================================================================
     Universal Auto Formatters (Phone & Prices)
     ========================================================================== */
  function formatPhoneNumber(value) {
    const clean = value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (clean.startsWith('02')) {
      if (clean.length <= 2) {
        formatted = clean;
      } else if (clean.length <= 5) {
        formatted = clean.slice(0, 2) + '-' + clean.slice(2);
      } else if (clean.length <= 9) {
        formatted = clean.slice(0, 2) + '-' + clean.slice(2, 5) + '-' + clean.slice(5);
      } else {
        formatted = clean.slice(0, 2) + '-' + clean.slice(2, 6) + '-' + clean.slice(6, 10);
      }
    } else {
      if (clean.length <= 3) {
        formatted = clean;
      } else if (clean.length <= 6) {
        formatted = clean.slice(0, 3) + '-' + clean.slice(3);
      } else if (clean.length <= 10) {
        formatted = clean.slice(0, 3) + '-' + clean.slice(3, 6) + '-' + clean.slice(6);
      } else {
        formatted = clean.slice(0, 3) + '-' + clean.slice(3, 7) + '-' + clean.slice(7, 11);
      }
    }
    return formatted;
  }

  document.addEventListener('input', (e) => {
    const target = e.target;
    
    // Phone Format
    if (target.type === 'tel' || target.id?.includes('phone') || target.className?.includes('phone')) {
      const selectionStart = target.selectionStart;
      const oldLength = target.value.length;
      
      const formatted = formatPhoneNumber(target.value);
      target.value = formatted;
      
      const diff = formatted.length - oldLength;
      target.setSelectionRange(selectionStart + diff, selectionStart + diff);
    }
    
    // Price / Fee Format
    if (target.classList.contains('price-input') || target.id?.includes('price') || target.id?.includes('fee') || target.className?.includes('fee')) {
      const selectionStart = target.selectionStart;
      const oldLength = target.value.length;
      
      let num = target.value.replace(/[^0-9]/g, '');
      if (num === '') {
        target.value = '';
        return;
      }
      const formatted = parseInt(num).toLocaleString('ko-KR');
      target.value = formatted;
      
      const diff = formatted.length - oldLength;
      target.setSelectionRange(selectionStart + diff, selectionStart + diff);
    }
  });

  // --- Sticky Bottom Inquiry Bar Logic (White Background Removal) ---
  const appliancesImg = document.getElementById('appliances-img');
  if (appliancesImg) {
    const processImage = () => {
      if (appliancesImg.src.startsWith('data:')) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = appliancesImg.src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          // Remove white background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r > 240 && g > 240 && b > 240) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          appliancesImg.src = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn("CORS/Security error processing image: ", appliancesImg.src, e);
        }
      };
    };
    
    if (appliancesImg.complete) {
      processImage();
    } else {
      appliancesImg.addEventListener('load', processImage);
    }
  }

  // Handle mobile CTA button click (open consultation modal)
  const mobileQuickCtaBtn = document.getElementById('mobile-quick-cta-btn');
  if (mobileQuickCtaBtn) {
    mobileQuickCtaBtn.addEventListener('click', () => {
      if (typeof openConsultFormModal === 'function') {
        openConsultFormModal('', '전체비교', '결합상품 빠른문의', '상관없음');
      } else {
        const consultSection = document.getElementById('consultation-form');
        if (consultSection) {
          consultSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // Handle quick inquiry form submission
  const quickInquiryForm = document.getElementById('quick-inquiry-form');
  if (quickInquiryForm) {
    quickInquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const hopeItem = document.getElementById('quick-hope-item').value;
      const name = document.getElementById('quick-name').value.trim();
      const phone = document.getElementById('quick-phone').value.trim();
      
      if (!hopeItem) {
        alert("희망 가전을 선택해주세요.");
        return;
      }
      if (!name) {
        alert("이름을 입력해주세요.");
        return;
      }
      if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) {
        alert("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }
      
      try {
        await saveConsultation({
          name: name,
          phone: phone,
          hopeItem: hopeItem,
          hopeBrand: '전체비교',
          purpose: '결합상품 빠른문의',
          budget: '상관없음',
          consultTime: '즉시상담',
          userMessage: '[하단 빠른 상담 신청]'
        });
        
        // Show success modal if it exists, otherwise fallback to alert
        const successModal = document.getElementById('success-modal');
        if (successModal) {
          successModal.classList.add('active');
        } else {
          alert("빠른 상담 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.");
        }
        quickInquiryForm.reset();
      } catch (err) {
        console.error(err);
        alert("신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    });
  }
  // --- Mobile Scroll & Collapse/Expand Logic ---
  const stickyBar = document.querySelector('.sticky-inquiry-bar');
  const toggleBtn = document.getElementById('inquiry-toggle-btn');

  // 1. Collapse/Minimize button event handler
  if (toggleBtn && stickyBar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent trigger stickyBar click event
      const isCollapsed = stickyBar.classList.toggle('is-collapsed');
      
      // Update toggle icon
      const icon = toggleBtn.querySelector('.toggle-icon');
      if (icon) {
        icon.textContent = isCollapsed ? '▲' : '▼';
      }
    });
  }

  // 2. Click anywhere on collapsed bar to expand it
  if (stickyBar) {
    stickyBar.addEventListener('click', () => {
      if (stickyBar.classList.contains('is-collapsed')) {
        stickyBar.classList.remove('is-collapsed');
        if (toggleBtn) {
          const icon = toggleBtn.querySelector('.toggle-icon');
          if (icon) icon.textContent = '▼';
        }
      }
    });
  }

  // --- Hero Slider Logic ---
  const sliderSection = document.querySelector('.slider-section');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-slide');
  const nextBtn = document.querySelector('.next-slide');
  
  if (slides.length > 0 && sliderSection) {
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
      // Handle index wrapping
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;
      
      // Update slides active state
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      
      // Update dots active state
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      
      // Update slider section classes for theme styling of controls
      sliderSection.className = `hero-section slider-section slide-${index + 1}-active`;
      
      currentSlide = index;
    }
    
    function startSlideShow() {
      stopSlideShow();
      slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000); // Change slide every 6 seconds
    }
    
    function stopSlideShow() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    }
    
    // Add event listeners for dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startSlideShow(); // Reset interval on manual click
      });
    });
    
    // Add event listeners for arrows
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startSlideShow();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startSlideShow();
      });
    }
    
    // Pause slide-show on mouse hover over the slider section
    sliderSection.addEventListener('mouseenter', stopSlideShow);
    sliderSection.addEventListener('mouseleave', startSlideShow);
    
    // Initialize first slide and start slideshow
    showSlide(0);
    startSlideShow();
  }

});
