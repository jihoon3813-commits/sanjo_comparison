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


  /* ==========================================================================
     1. Database & Initializer Logic (localStorage)
     ========================================================================== */
  const defaultBrands = [
    { id: 'daemyung', name: '대명아임레디', desc: '레저/리조트 우대 및 소노호텔 멤버십 혜택이 강력한 대표 상조사', logoText: '대명', fee: 150000, color: '#0369A1' },
    { id: 'boram', name: '보람상조', desc: '전통과 신뢰의 1위 브랜드, 크루즈/웨딩/주얼리 자유 전환 서비스', logoText: '보람', fee: 120000, color: '#B91C1C' },
    { id: 'preed', name: '프리드라이프', desc: '국내 최대 누적 가입자수 보유, 합리적이고 투명한 납입 플랜 제공', logoText: '프리드', fee: 130000, color: '#6D28D9' },
    { id: 'kyowon', name: '교원라이프', desc: '교육/어학 연계 및 생활 가전 결합 등 실용적 라이프 케어 우수 상조사', logoText: '교원', fee: 140000, color: '#C2410C' }
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
      categoryId: 'laptop',
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
      categoryId: 'massage',
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
      categoryId: 'water',
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
      categoryId: 'laptop',
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

  const mockSettlements = [
    { id: 'set_1', orderId: 'c_1', sellerId: 'chulsoo', customerName: '홍길동', productName: '삼성 갤럭시북4 프리미엄', brandId: 'daemyung', brandName: '대명아임레디', commission: 150000, status: '지급완료', date: '2026-06-25T15:00:00.000Z' }
  ];

  // LocalStorage initialization is now handled dynamically in the fallback of initData()

  // DB Fetch Helper Functions (Convex Integrated)
  let BRAND_DATA = [];
  let PRODUCT_DATA = [];
  let PLAN_DATA = [];
  let SELLER_DATA = [];
  let CONSULTATION_DATA = [];
  let SETTLEMENT_DATA = [];

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
    return 'general'; // 일반가전
  };

  const getSellers = () => [...SELLER_DATA];
  const setSellers = async (newData) => {
    const oldData = SELLER_DATA;
    SELLER_DATA = newData;
    localStorage.setItem('lifemoa_sellers', JSON.stringify(newData));
    if (!convex) return;
    try {
      if (newData.length > oldData.length) {
        const added = newData.filter(n => !oldData.some(o => o.id === n.id));
        for (const item of added) {
          await convex.mutation(api.sellers.add, item);
        }
      } else if (newData.length < oldData.length) {
        const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
        for (const item of deleted) {
          await convex.mutation(api.sellers.remove, { id: item.id });
        }
      } else {
        for (const n of newData) {
          const o = oldData.find(x => x.id === n.id);
          if (o && JSON.stringify(o) !== JSON.stringify(n)) {
            await convex.mutation(api.sellers.update, {
              id: n.id,
              name: n.name,
              phone: n.phone,
              address: n.address,
              password: n.password,
              status: n.status
            });
          }
        }
      }
    } catch (err) {
      console.error("Convex seller sync failed:", err);
    }
  };
  
  const getConsultations = () => [...CONSULTATION_DATA];
  const setConsultations = async (newData) => {
    const oldData = CONSULTATION_DATA;
    CONSULTATION_DATA = newData;
    localStorage.setItem('lifemoa_consultations', JSON.stringify(newData));
    if (!convex) return;
    try {
      if (newData.length > oldData.length) {
        const added = newData.filter(n => !oldData.some(o => o.id === n.id));
        for (const item of added) {
          await convex.mutation(api.consultations.add, item);
        }
      } else if (newData.length < oldData.length) {
        const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
        for (const item of deleted) {
          await convex.mutation(api.consultations.remove, { id: item.id });
        }
      } else {
        for (const n of newData) {
          const o = oldData.find(x => x.id === n.id);
          if (o && JSON.stringify(o) !== JSON.stringify(n)) {
            await convex.mutation(api.consultations.update, {
              id: n.id,
              status: n.status,
              sellerId: n.sellerId
            });
          }
        }
      }
    } catch (err) {
      console.error("Convex consultations sync failed:", err);
    }
  };
  
  const getBrands = () => [...BRAND_DATA];
  const setBrands = async (newData) => {
    const oldData = BRAND_DATA;
    BRAND_DATA = newData;
    localStorage.setItem('lifemoa_brands', JSON.stringify(newData));
    if (!convex) return;
    try {
      // Sync additions
      const added = newData.filter(n => !oldData.some(o => o.id === n.id));
      for (const item of added) {
        await convex.mutation(api.brands.add, {
          id: item.id,
          name: item.name,
          desc: item.desc,
          logoText: item.logoText || item.name.substring(0, 2),
          fee: Number(item.fee) || 0,
          logoUrl: item.logoImage || undefined,
          color: item.color || undefined
        });
      }

      // Sync deletions
      const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
      for (const item of deleted) {
        await convex.mutation(api.brands.remove, { id: item.id });
      }

      // Sync updates
      for (const n of newData) {
        const o = oldData.find(x => x.id === n.id);
        if (o && JSON.stringify(o) !== JSON.stringify(n)) {
          await convex.mutation(api.brands.update, {
            id: n.id,
            name: n.name,
            desc: n.desc,
            fee: Number(n.fee) || 0,
            logoUrl: n.logoImage || undefined,
            color: n.color || undefined
          });
        }
      }
    } catch (err) {
      console.error("Convex brands sync failed:", err);
      alert("Convex 서버와의 상조사 동기화에 실패했습니다: " + err.message);
    }
  };
  const getBrandName = (brandId) => {
    const brands = getBrands() || [];
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : brandId;
  };

  const getPlans = () => [...PLAN_DATA];
  const setPlans = async (newData) => {
    const oldData = PLAN_DATA;
    PLAN_DATA = newData;
    localStorage.setItem('lifemoa_plans', JSON.stringify(newData));
    if (!convex) return;
    try {
      if (newData.length > oldData.length) {
        const added = newData.filter(n => !oldData.some(o => o.id === n.id));
        for (const item of added) {
          await convex.mutation(api.plans.add, item);
        }
      } else if (newData.length < oldData.length) {
        const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
        for (const item of deleted) {
          await convex.mutation(api.plans.remove, { id: item.id });
        }
      } else {
        for (const n of newData) {
          const o = oldData.find(x => x.id === n.id);
          if (o && JSON.stringify(o) !== JSON.stringify(n)) {
            await convex.mutation(api.plans.add, n);
          }
        }
      }
    } catch (err) {
      console.error("Convex plans sync failed:", err);
      alert("Convex 서버와의 상품 플랜 동기화에 실패했습니다: " + err.message);
    }
  };

  const getProducts = () => [...PRODUCT_DATA];
  const setProducts = async (newData) => {
    const oldData = PRODUCT_DATA;
    PRODUCT_DATA = newData;
    localStorage.setItem('lifemoa_products', JSON.stringify(newData));
    if (!convex) return;
    try {
      if (newData.length > oldData.length) {
        const added = newData.filter(n => !oldData.some(o => o.id === n.id));
        if (added.length > 1) {
          await convex.mutation(api.products.addBulk, { items: added });
        } else {
          for (const item of added) {
            await convex.mutation(api.products.add, item);
          }
        }
      } else if (newData.length < oldData.length) {
        const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
        for (const item of deleted) {
          await convex.mutation(api.products.remove, { id: item.id });
        }
      } else {
        for (const n of newData) {
          const o = oldData.find(x => x.id === n.id);
          if (o && JSON.stringify(o) !== JSON.stringify(n)) {
            await convex.mutation(api.products.add, n);
          }
        }
      }
    } catch (err) {
      console.error("Convex products sync failed:", err);
    }
  };
  
  const getSettlements = () => [...SETTLEMENT_DATA];
  const setSettlements = async (newData) => {
    const oldData = SETTLEMENT_DATA;
    SETTLEMENT_DATA = newData;
    localStorage.setItem('lifemoa_settlements', JSON.stringify(newData));
    if (!convex) return;
    try {
      if (newData.length > oldData.length) {
        const added = newData.filter(n => !oldData.some(o => o.id === n.id));
        for (const item of added) {
          await convex.mutation(api.settlements.add, item);
        }
      } else if (newData.length < oldData.length) {
        const deleted = oldData.filter(o => !newData.some(n => o.id === n.id));
        for (const item of deleted) {
          await convex.mutation(api.settlements.remove, { id: item.id });
        }
      } else {
        for (const n of newData) {
          const o = oldData.find(x => x.id === n.id);
          if (o && JSON.stringify(o) !== JSON.stringify(n)) {
            await convex.mutation(api.settlements.add, n);
          }
        }
      }
    } catch (err) {
      console.error("Convex settlements sync failed:", err);
    }
  };

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
      SELLER_DATA = await convex.query(api.sellers.get);
      CONSULTATION_DATA = await convex.query(api.consultations.get);
      SETTLEMENT_DATA = await convex.query(api.settlements.get);

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
          logoUrl: b.logoUrl || b.logoImage || undefined,
          color: b.color || undefined
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

        const localSettlements = JSON.parse(localStorage.getItem('lifemoa_settlements')) || mockSettlements;
        const seedSettlements = localSettlements.map(s => ({
          id: s.id,
          orderId: s.orderId,
          sellerId: s.sellerId,
          customerName: s.customerName,
          productName: s.productName,
          brandId: s.brandId,
          brandName: s.brandName,
          commission: Number(s.commission) || 0,
          status: s.status,
          date: s.date
        }));
        await convex.mutation(api.settlements.seed, { items: seedSettlements });

        const rawBrandsRefetched = await convex.query(api.brands.get);
        BRAND_DATA = rawBrandsRefetched.map(b => ({
          ...b,
          logoImage: b.logoUrl || b.logoImage || null
        }));
        PRODUCT_DATA = await convex.query(api.products.get);
        PLAN_DATA = await convex.query(api.plans.get);
        SELLER_DATA = await convex.query(api.sellers.get);
        CONSULTATION_DATA = await convex.query(api.consultations.get);
        SETTLEMENT_DATA = await convex.query(api.settlements.get);
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

      SELLER_DATA = JSON.parse(localStorage.getItem('lifemoa_sellers')) || mockSellers;
      CONSULTATION_DATA = JSON.parse(localStorage.getItem('lifemoa_consultations')) || mockConsultations;
      SETTLEMENT_DATA = JSON.parse(localStorage.getItem('lifemoa_settlements')) || mockSettlements;
    }
  }


  /* ==========================================================================
     2. Authentication / Login Control
     ========================================================================== */
  const loginWrapper = document.getElementById('login-wrapper');
  const adminWorkspace = document.getElementById('admin-workspace');
  const loginForm = document.getElementById('admin-login-form');
  const btnLogout = document.getElementById('btn-logout');

  // Check existing login session on load (declared here, checked at the bottom of DOMContentLoaded)
  let userSession = null;

  // Handle Login form submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('login-username').value.trim();
      const passwordInput = document.getElementById('login-password').value;

      if (usernameInput === 'admin' && passwordInput === 'admin123') {
        // HQ Login Success
        userSession = { role: 'HQ', name: '본사 최고관리자', username: 'admin' };
        sessionStorage.setItem('lifemoa_logged_in', JSON.stringify(userSession));
        loginForm.reset();
        showDashboard(userSession);
        return;
      }

      // Check Sellers
      const sellers = getSellers();
      const seller = sellers.find(s => s.username === usernameInput && s.password === passwordInput);
      
      if (seller) {
        if (seller.status === '승인') {
          // Seller Login Success
          userSession = { 
            role: 'Seller', 
            name: seller.name, 
            username: seller.username, 
            sellerId: seller.username, // Consistent with consultations/settlements sellerId
            subdomain: seller.subdomain,
            phone: seller.phone,
            address: seller.address
          };
          sessionStorage.setItem('lifemoa_logged_in', JSON.stringify(userSession));
          loginForm.reset();
          showDashboard(userSession);
        } else if (seller.status === '보류') {
          alert("아직 본사의 가입 승인 대기 중인 셀러 계정입니다. 승인 완료 후 로그인하실 수 있습니다.");
        } else {
          alert("승인이 취소되었거나 비활성화된 계정입니다. 본사에 문의해주세요.");
        }
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    });
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('lifemoa_logged_in');
      userSession = null;
      adminWorkspace.style.display = 'none';
      loginWrapper.style.display = 'flex';
      destroyCharts();
    });
  }


  /* ==========================================================================
     3. Dashboard Core Routing & Workspace Populate
     ========================================================================== */
  const roleBadge = document.getElementById('role-badge');
  const displayUserName = document.getElementById('display-user-name');
  const displayUserSub = document.getElementById('display-user-sub');
  const sidebarNavMenu = document.getElementById('sidebar-nav-menu');
  const panelTitleText = document.getElementById('panel-title-text');
  const currentDateText = document.getElementById('current-date-text');

  // Set today date
  if (currentDateText) {
    const today = new Date();
    currentDateText.textContent = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  }

  function showDashboard(session) {
    loginWrapper.style.display = 'none';
    adminWorkspace.style.display = 'flex';
    
    // Set user profile sidebar
    displayUserName.textContent = session.name;
    
    if (session.role === 'HQ') {
      roleBadge.textContent = '본사 최고관리자';
      roleBadge.className = 'sidebar-role-badge role-hq';
      displayUserSub.textContent = `@${session.username}`;
      document.querySelector('.user-avatar').textContent = 'HQ';
      document.querySelector('.user-avatar').style.backgroundColor = 'var(--accent-color)';
      document.querySelector('.user-avatar').style.color = 'var(--primary-color)';
      buildHQMenu();
    } else {
      roleBadge.textContent = '셀러 파트너';
      roleBadge.className = 'sidebar-role-badge role-seller';
      displayUserSub.textContent = `${session.subdomain}.lifemoa.co.kr`;
      document.querySelector('.user-avatar').textContent = session.name.substr(0, 2);
      document.querySelector('.user-avatar').style.backgroundColor = 'var(--primary-light)';
      document.querySelector('.user-avatar').style.color = 'var(--primary-color)';
      buildSellerMenu();
    }

    // Load initial tab (Stats)
    switchTab('stats');
  }

  // GNB Lists definitions
  function buildHQMenu() {
    sidebarNavMenu.innerHTML = `
      <a href="#" class="nav-item active" data-tab="stats">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>
        대시보드 통계
      </a>
      <a href="#" class="nav-item" data-tab="sellers">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        셀러 파트너 관리
      </a>
      <a href="#" class="nav-item" data-tab="customers">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        고객 상담 관리
      </a>
      <a href="#" class="nav-item" data-tab="settlements">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        정산/수수료 관리
      </a>
      <a href="#" class="nav-item" data-tab="products">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><line x1="12" y1="17" x2="12" y2="20"></line></svg>
        가전 제품 관리
      </a>
      <a href="#" class="nav-item" data-tab="brands">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        제휴 상조사 관리
      </a>
      <a href="#" class="nav-item" data-tab="settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        시스템 설정
      </a>
    `;
    bindMenuClicks();
  }

  function buildSellerMenu() {
    sidebarNavMenu.innerHTML = `
      <a href="#" class="nav-item active" data-tab="stats">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>
        실적 대시보드
      </a>
      <a href="#" class="nav-item" data-tab="customers">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        내 유치고객 현황
      </a>
      <a href="#" class="nav-item" data-tab="settlements">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        수수료 정산 내역
      </a>
      <a href="#" class="nav-item" data-tab="settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        파트너 설정
      </a>
    `;
    bindMenuClicks();
  }

  function bindMenuClicks() {
    const navItems = sidebarNavMenu.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const tabId = item.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
  }

  function switchTab(tabId) {
    // Hide all panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => p.classList.remove('active'));
    
    // Show chosen panel
    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Set header title
    let title = '관리자';
    if (tabId === 'stats') title = userSession.role === 'HQ' ? '대시보드 통계' : '실적 대시보드';
    else if (tabId === 'sellers') title = '셀러 파트너 관리';
    else if (tabId === 'customers') title = userSession.role === 'HQ' ? '고객 상담 관리' : '내 유치고객 현황';
    else if (tabId === 'settlements') title = userSession.role === 'HQ' ? '정산/수수료 관리' : '수수료 정산 내역';
    else if (tabId === 'products') title = '가전 제품 관리';
    else if (tabId === 'brands') title = '제휴 상조사 관리';
    else if (tabId === 'settings') title = userSession.role === 'HQ' ? '시스템 설정' : '파트너 설정';
    
    panelTitleText.textContent = title;

    // Load data for the tab
    loadTabData(tabId);
  }


  /* ==========================================================================
     4. Tab Data Loading & UI Rendering
     ========================================================================== */
  function loadTabData(tabId) {
    if (tabId === 'stats') {
      renderStats();
    } else if (tabId === 'sellers') {
      renderSellersTable();
    } else if (tabId === 'customers') {
      renderCustomersTable();
    } else if (tabId === 'settlements') {
      renderSettlementsTable();
    } else if (tabId === 'products') {
      renderProductsManagement();
    } else if (tabId === 'brands') {
      renderBrandsManagement();
    } else if (tabId === 'settings') {
      renderSettingsTab();
    }
  }

  // --- Chart objects references to destroy before recreate ---
  let chartLeads = null;
  let chartPie = null;

  function destroyCharts() {
    if (chartLeads) { chartLeads.destroy(); chartLeads = null; }
    if (chartPie) { chartPie.destroy(); chartPie = null; }
  }

  // --- TAB: STATISTICS ---
  function renderStats() {
    destroyCharts();
    
    const cons = getConsultations();
    const sellers = getSellers();
    const sets = getSettlements();

    const summaryGrid = document.getElementById('stats-summary-grid');
    
    if (userSession.role === 'HQ') {
      // HQ Statistics summary
      const totalLeads = cons.length;
      const closedCount = cons.filter(c => c.status === '계약 완료').length;
      const pendingSellers = sellers.filter(s => s.status === '보류').length;
      const totalPayout = sets.filter(s => s.status === '지급완료').reduce((acc, curr) => acc + curr.commission, 0);

      summaryGrid.innerHTML = `
        <div class="stats-card">
          <div class="stats-card-val">${totalLeads}건</div>
          <div class="stats-card-label">누적 고객 상담 건수</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-green">${closedCount}건</div>
          <div class="stats-card-label">계약 완료 건수</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-orange">${pendingSellers}명</div>
          <div class="stats-card-label">가입 대기 셀러</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-navy">₩${totalPayout.toLocaleString()}</div>
          <div class="stats-card-label">누적 수수료 지급 총액</div>
        </div>
      `;
    } else {
      // Seller Statistics summary
      const myLeads = cons.filter(c => c.sellerId === userSession.sellerId);
      const myClosed = myLeads.filter(c => c.status === '계약 완료').length;
      
      const mySets = sets.filter(s => s.sellerId === userSession.sellerId);
      const totalEarned = mySets.reduce((acc, curr) => acc + curr.commission, 0);
      const paidEarned = mySets.filter(s => s.status === '지급완료').reduce((acc, curr) => acc + curr.commission, 0);
      const unpaidEarned = mySets.filter(s => s.status === '미정산').reduce((acc, curr) => acc + curr.commission, 0);

      summaryGrid.innerHTML = `
        <div class="stats-card">
          <div class="stats-card-val">${myLeads.length}건</div>
          <div class="stats-card-label">내 유치 상담 수</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-green">${myClosed}건</div>
          <div class="stats-card-label">내 계약 완료 건수</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-orange">₩${unpaidEarned.toLocaleString()}</div>
          <div class="stats-card-label">정산 대기 수수료</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-val font-navy">₩${paidEarned.toLocaleString()} / ₩${totalEarned.toLocaleString()}</div>
          <div class="stats-card-label">수수료 정산 (지급완료 / 누적액)</div>
        </div>
      `;
    }

    // Chart 1: Line chart (Daily Leads)
    const ctxLeads = document.getElementById('chart-daily-leads').getContext('2d');
    const last7Days = [];
    const leadsCounts = [];
    const sellerLeadsCounts = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = (d.getMonth() + 1) + '/' + d.getDate();
      last7Days.push(displayStr);

      const dayLeads = cons.filter(c => c.registerDate.startsWith(dateStr));
      leadsCounts.push(dayLeads.length);

      if (userSession.role === 'Seller') {
        const myDayLeads = dayLeads.filter(c => c.sellerId === userSession.sellerId);
        sellerLeadsCounts.push(myDayLeads.length);
      }
    }

    chartLeads = new Chart(ctxLeads, {
      type: 'line',
      data: {
        labels: last7Days,
        datasets: [{
          label: userSession.role === 'HQ' ? '전체 상담접수' : '내 유치상담',
          data: userSession.role === 'HQ' ? leadsCounts : sellerLeadsCounts,
          borderColor: '#00b594',
          backgroundColor: 'rgba(0, 181, 148, 0.05)',
          borderWidth: 3,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });

    // Chart 2: Pie chart (Appliance shares)
    const ctxPie = document.getElementById('chart-appliance-pie').getContext('2d');
    const myFilteredLeads = userSession.role === 'HQ' ? cons : cons.filter(c => c.sellerId === userSession.sellerId);
    
    // Group by hopeItem
    const itemGroups = {};
    myFilteredLeads.forEach(c => {
      const item = c.hopeItem || '미선택';
      itemGroups[item] = (itemGroups[item] || 0) + 1;
    });

    const pieLabels = Object.keys(itemGroups);
    const pieData = Object.values(itemGroups);

    chartPie = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: pieLabels.length > 0 ? pieLabels : ['데이터 없음'],
        datasets: [{
          data: pieData.length > 0 ? pieData : [1],
          backgroundColor: ['#001A3D', '#00b594', '#60A5FA', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
      }
    });
  }

  // --- TAB: SELLER PARTNER MANAGEMENT (HQ ONLY) ---
  const sellerSearch = document.getElementById('seller-search');
  const sellerStatusFilter = document.getElementById('seller-status-filter');

  function renderSellersTable() {
    const tableBody = document.getElementById('sellers-table-body');
    if (!tableBody) return;

    const sellers = getSellers();
    const query = sellerSearch.value.trim().toLowerCase();
    const status = sellerStatusFilter.value;

    const filtered = sellers.filter(s => {
      const matchQuery = s.name.toLowerCase().includes(query) || s.username.toLowerCase().includes(query);
      const matchStatus = status ? s.status === status : true;
      return matchQuery && matchStatus;
    });

    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">신청된 셀러 내역이 없습니다.</td></tr>`;
      return;
    }

    filtered.forEach(s => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-pending';
      if (s.status === '승인') badgeClass = 'badge-approved';
      if (s.status === '취소') badgeClass = 'badge-cancelled';

      const regDate = new Date(s.registerDate).toLocaleDateString('ko-KR');

      tr.innerHTML = `
        <td class="bold">${s.username}</td>
        <td>${s.name}</td>
        <td>${s.phone}</td>
        <td class="bold font-navy">${s.subdomain}</td>
        <td class="small-text text-muted">${s.address}</td>
        <td>${regDate}</td>
        <td><span class="badge ${badgeClass}">${s.status}</span></td>
        <td>
          <div class="btn-group">
            <button class="btn btn-outline btn-xs btn-seller-detail" data-id="${s.id}">상세/수정</button>
            <button class="btn btn-approved btn-xs" data-id="${s.id}" data-action="승인" ${s.status === '승인' ? 'disabled' : ''}>승인</button>
            <button class="btn btn-pending btn-xs" data-id="${s.id}" data-action="보류" ${s.status === '보류' ? 'disabled' : ''}>보류</button>
            <button class="btn btn-cancelled btn-xs" data-id="${s.id}" data-action="취소" ${s.status === '취소' ? 'disabled' : ''}>취소</button>
          </div>
        </td>
      `;

      // Bind button events inside table row
      tr.querySelector('.btn-seller-detail').addEventListener('click', () => {
        openSellerModal(s.id);
      });

      tr.querySelectorAll('.btn-group button:not(.btn-seller-detail)').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const sellerId = btn.getAttribute('data-id');
          const newStatus = btn.getAttribute('data-action');
          changeSellerStatus(sellerId, newStatus);
        });
      });

      tableBody.appendChild(tr);
    });
  }

  if (sellerSearch) sellerSearch.addEventListener('input', renderSellersTable);
  if (sellerStatusFilter) sellerStatusFilter.addEventListener('change', renderSellersTable);

  function changeSellerStatus(id, newStatus) {
    const sellers = getSellers();
    const index = sellers.findIndex(s => s.id === id);
    if (index !== -1) {
      sellers[index].status = newStatus;
      setSellers(sellers);
      renderSellersTable();
      console.log(`Seller ${sellers[index].name} status changed to ${newStatus}`);
    }
  }

  // --- Seller Modal Control (Detail/Edit & Registration) ---
  const sellerModal = document.getElementById('seller-modal');
  const btnCloseSellerModal = document.getElementById('seller-modal-close');
  const btnCancelSellerModal = document.getElementById('modal-seller-cancel');
  const btnAddSellerToggle = document.getElementById('btn-add-seller-toggle');
  const sellerModalForm = document.getElementById('seller-modal-form');
  const btnModalAddressSearch = document.getElementById('modal-seller-address-btn');

  function openSellerModal(id = null) {
    if (!sellerModal) return;

    const actionInput = document.getElementById('modal-seller-action');
    const idInput = document.getElementById('modal-seller-id');
    const usernameInput = document.getElementById('modal-seller-username');
    const passwordInput = document.getElementById('modal-seller-password');
    const nameInput = document.getElementById('modal-seller-name');
    const phoneInput = document.getElementById('modal-seller-phone');
    const subdomainInput = document.getElementById('modal-seller-subdomain');
    const zipcodeInput = document.getElementById('modal-seller-zipcode');
    const addressInput = document.getElementById('modal-seller-address');
    const addressDetailInput = document.getElementById('modal-seller-address-detail');
    const statusInput = document.getElementById('modal-seller-status');
    const titleText = document.getElementById('seller-modal-title');

    sellerModalForm.reset();

    if (id) {
      // Edit Mode
      const sellers = getSellers();
      const s = sellers.find(seller => seller.id === id);
      if (!s) return;

      titleText.textContent = "셀러 상세 및 정보 수정";
      actionInput.value = "edit";
      idInput.value = s.id;
      usernameInput.value = s.username;
      passwordInput.value = s.password;
      nameInput.value = s.name;
      phoneInput.value = s.phone;
      subdomainInput.value = s.subdomain;
      statusInput.value = s.status;

      // Parse address
      let zipcode = '';
      let baseAddress = '';
      let detailAddress = '';
      
      const match = s.address.match(/^\((\d{5})\)\s*(.+)$/);
      if (match) {
        zipcode = match[1];
        baseAddress = match[2];
      } else {
        baseAddress = s.address;
      }
      
      zipcodeInput.value = zipcode;
      addressInput.value = baseAddress;
      addressDetailInput.value = detailAddress;

      usernameInput.disabled = false; 
    } else {
      // Add Mode
      titleText.textContent = "신규 셀러 직접 등록";
      actionInput.value = "add";
      idInput.value = "";
      statusInput.value = "승인"; // Default to approved for admin registration
      usernameInput.disabled = false;
    }

    sellerModal.classList.add('active');
  }

  function closeSellerModal() {
    if (sellerModal) sellerModal.classList.remove('active');
  }

  if (btnCloseSellerModal) btnCloseSellerModal.addEventListener('click', closeSellerModal);
  if (btnCancelSellerModal) btnCancelSellerModal.addEventListener('click', closeSellerModal);
  if (sellerModal) {
    sellerModal.addEventListener('click', (e) => {
      if (e.target === sellerModal) closeSellerModal();
    });
  }

  if (btnAddSellerToggle) {
    btnAddSellerToggle.addEventListener('click', () => openSellerModal());
  }

  if (btnModalAddressSearch) {
    btnModalAddressSearch.addEventListener('click', () => {
      if (typeof daum !== 'undefined' && daum.Postcode) {
        new daum.Postcode({
          oncomplete: function(data) {
            document.getElementById('modal-seller-zipcode').value = data.zonecode;
            document.getElementById('modal-seller-address').value = data.roadAddress || data.address;
            document.getElementById('modal-seller-address-detail').focus();
          }
        }).open();
      } else {
        alert('주소 검색 서비스를 불러올 수 없습니다.');
      }
    });
  }

  if (sellerModalForm) {
    sellerModalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const action = document.getElementById('modal-seller-action').value;
      const id = document.getElementById('modal-seller-id').value;
      const username = document.getElementById('modal-seller-username').value.trim();
      const password = document.getElementById('modal-seller-password').value;
      const name = document.getElementById('modal-seller-name').value.trim();
      const phone = document.getElementById('modal-seller-phone').value;
      const subdomain = document.getElementById('modal-seller-subdomain').value.trim().toLowerCase();
      const zipcode = document.getElementById('modal-seller-zipcode').value;
      const address = document.getElementById('modal-seller-address').value;
      const addressDetail = document.getElementById('modal-seller-address-detail').value.trim();
      const status = document.getElementById('modal-seller-status').value;

      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        alert("로그인 ID는 영문 및 숫자 조합이어야 합니다.");
        return;
      }

      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        alert("서브도메인은 영문 소문자, 숫자, 하이픈(-)만 포함할 수 있습니다.");
        return;
      }

      const sellers = getSellers();

      // Check duplicates
      const isIdDup = sellers.some(s => s.id !== id && s.username === username) || username === 'admin';
      if (isIdDup) {
        alert("이미 존재하거나 사용할 수 없는 ID입니다.");
        return;
      }

      const isSubdomainDup = sellers.some(s => s.id !== id && s.subdomain === subdomain) || subdomain === 'www';
      if (isSubdomainDup) {
        alert("이미 사용 중인 서브도메인 명칭입니다.");
        return;
      }

      const fullAddress = `(${zipcode}) ${address} ${addressDetail}`.trim();

      if (action === 'edit') {
        const idx = sellers.findIndex(s => s.id === id);
        if (idx !== -1) {
          sellers[idx] = {
            ...sellers[idx],
            username,
            password,
            name,
            phone,
            address: fullAddress,
            subdomain,
            status
          };
          setSellers(sellers);
          alert("셀러 정보가 안전하게 수정되었습니다.");
        }
      } else {
        // Add Mode
        const newSeller = {
          id: 's_' + Date.now(),
          name,
          phone,
          address: fullAddress,
          username,
          password,
          subdomain,
          status,
          registerDate: new Date().toISOString()
        };
        sellers.push(newSeller);
        setSellers(sellers);
        alert("새로운 셀러가 성공적으로 등록되었습니다.");
      }

      closeSellerModal();
      renderSellersTable();
    });
  }

  // --- TAB: CUSTOMER CONSULTATION MANAGEMENT (HQ & Seller) ---
  const customerSearch = document.getElementById('customer-search');
  const customerStatusFilter = document.getElementById('customer-status-filter');
  const customerSellerFilter = document.getElementById('customer-seller-filter');

  function renderCustomersTable() {
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;

    const checkAll = document.getElementById('check-all-customers');
    if (checkAll) checkAll.checked = false;
    updateDeleteSelectedBtnVisibility();

    const cons = getConsultations();
    const query = customerSearch.value.trim().toLowerCase();
    const status = customerStatusFilter.value;
    const sellerFilter = customerSellerFilter ? customerSellerFilter.value : '';

    const filtered = cons.filter(c => {
      // Filter by role: Sellers only see their own customer leads
      if (userSession.role === 'Seller' && c.sellerId !== userSession.sellerId) {
        return false;
      }
      
      const matchQuery = c.name.toLowerCase().includes(query) || c.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''));
      const matchStatus = status ? c.status === status : true;
      
      let matchSeller = true;
      if (userSession.role === 'HQ' && sellerFilter) {
        if (sellerFilter === '본사') matchSeller = !c.sellerId;
        else if (sellerFilter === '셀러') matchSeller = !!c.sellerId;
      }

      return matchQuery && matchStatus && matchSeller;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center">상담 신청 내역이 존재하지 않습니다.</td></tr>`;
      return;
    }

    filtered.forEach(c => {
      const tr = document.createElement('tr');
      const regDate = new Date(c.registerDate).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      const sellerDisplay = c.sellerId ? `<span class="bold text-muted">${c.sellerId}</span>` : '<span class="text-light">본사 직유치</span>';

      // Status dropdown builder
      const statusOptions = ['신규 접수', '상담 진행중', '계약 완료', '부재/취소'];
      const dropdown = document.createElement('select');
      dropdown.className = 'table-select-status';
      dropdown.setAttribute('data-id', c.id);
      
      // If Seller role, restrict status alteration to visual only, or allow them to alter
      // Let's allow both roles to adjust consultation progress
      statusOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (c.status === opt) option.selected = true;
        dropdown.appendChild(option);
      });

      dropdown.addEventListener('change', (e) => {
        changeCustomerStatus(c.id, e.target.value);
      });

      // Layout columns
      tr.innerHTML = `
        <td style="text-align: center;" class="td-checkbox">
          <input type="checkbox" class="customer-checkbox" data-id="${c.id}">
        </td>
        <td class="bold">${c.name}</td>
        <td>${c.phone}</td>
        <td><span class="small-text font-navy">${c.hopeItem}</span></td>
        <td><span class="badge badge-brand-label">${c.hopeBrand}</span></td>
        <td>${sellerDisplay}</td>
        <td><span class="small-text text-muted">${regDate}</span></td>
        <td class="td-status-dropdown-container"></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-xs btn-view-detail">상세</button>
            <button class="btn btn-outline-danger btn-xs btn-delete-customer" data-id="${c.id}">삭제</button>
          </div>
        </td>
      `;

      tr.querySelector('.td-status-dropdown-container').appendChild(dropdown);
      
      // Make row clickable
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.table-select-status') || e.target.closest('.btn') || e.target.closest('.td-checkbox') || e.target.closest('.customer-checkbox')) {
          return;
        }
        openCustomerModal(c.id);
      });

      tr.querySelector('.btn-view-detail').addEventListener('click', () => {
        openCustomerModal(c.id);
      });

      tr.querySelector('.btn-delete-customer').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomerSingle(c.id);
      });

      tr.querySelector('.customer-checkbox').addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.customer-checkbox');
        const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
        if (checkAll) {
          checkAll.checked = checkboxes.length === checkedBoxes.length;
        }
        updateDeleteSelectedBtnVisibility();
      });

      tableBody.appendChild(tr);
    });
  }

  function updateDeleteSelectedBtnVisibility() {
    const deleteBtn = document.getElementById('btn-delete-selected-customers');
    if (!deleteBtn) return;
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    if (checkedBoxes.length > 0) {
      deleteBtn.style.display = 'inline-flex';
      deleteBtn.textContent = `선택 삭제 (${checkedBoxes.length})`;
    } else {
      deleteBtn.style.display = 'none';
    }
  }

  function deleteCustomerSingle(id) {
    const cons = getConsultations();
    const customer = cons.find(c => c.id === id);
    if (!customer) return;
    
    if (confirm(`고객 '${customer.name}'님의 상담 내역을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const updated = cons.filter(c => c.id !== id);
      setConsultations(updated);
      renderCustomersTable();
    }
  }

  function deleteCustomersSelected() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const checkedIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
    if (checkedIds.length === 0) {
      alert('삭제할 고객을 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${checkedIds.length}명의 고객 상담 내역을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const cons = getConsultations();
      const updated = cons.filter(c => !checkedIds.includes(c.id));
      setConsultations(updated);
      renderCustomersTable();
    }
  }

  if (customerSearch) customerSearch.addEventListener('input', renderCustomersTable);
  if (customerStatusFilter) customerStatusFilter.addEventListener('change', renderCustomersTable);
  if (customerSellerFilter) customerSellerFilter.addEventListener('change', renderCustomersTable);

  const checkAll = document.getElementById('check-all-customers');
  if (checkAll) {
    checkAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.customer-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
      });
      updateDeleteSelectedBtnVisibility();
    });
  }

  const btnDeleteSelectedCustomers = document.getElementById('btn-delete-selected-customers');
  if (btnDeleteSelectedCustomers) {
    btnDeleteSelectedCustomers.addEventListener('click', deleteCustomersSelected);
  }

  function changeCustomerStatus(id, newStatus) {
    const cons = getConsultations();
    const index = cons.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldStatus = cons[index].status;
      cons[index].status = newStatus;
      setConsultations(cons);

      // Connect Settlement trigger: If status changes to '계약 완료' and it has a sellerId, generate a settlement log
      if (newStatus === '계약 완료' && oldStatus !== '계약 완료' && cons[index].sellerId) {
        generateCommissionSettlement(cons[index]);
      }

      renderCustomersTable();
      console.log(`Customer ${cons[index].name} status updated to ${newStatus}`);
    }
  }

  // --- Customer Detail Modal Control ---
  const customerModal = document.getElementById('customer-modal');
  const btnCloseCustomerModal = document.getElementById('customer-modal-close');
  const btnCancelCustomerModal = document.getElementById('modal-customer-cancel');
  const customerModalForm = document.getElementById('customer-modal-form');

  function openCustomerModal(id) {
    if (!customerModal) return;

    const cons = getConsultations();
    const c = cons.find(item => item.id === id);
    if (!c) return;

    // Dynamically load sellers list in the selector
    const sellerSelect = document.getElementById('modal-customer-seller');
    if (sellerSelect) {
      sellerSelect.innerHTML = '<option value="">본사 직유치 (없음)</option>';
      const sellers = getSellers();
      sellers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.username;
        opt.textContent = `${s.name} (${s.username})`;
        sellerSelect.appendChild(opt);
      });
    }

    document.getElementById('modal-customer-id').value = c.id;
    document.getElementById('modal-customer-name').value = c.name;
    document.getElementById('modal-customer-phone').value = c.phone;
    document.getElementById('modal-customer-item').value = c.hopeItem;
    document.getElementById('modal-customer-brand').value = c.hopeBrand;
    document.getElementById('modal-customer-purpose').value = c.purpose || '';
    document.getElementById('modal-customer-budget').value = c.budget || '';
    document.getElementById('modal-customer-time').value = c.consultTime || '';
    document.getElementById('modal-customer-seller').value = c.sellerId || '';
    document.getElementById('modal-customer-status').value = c.status;
    document.getElementById('modal-customer-message').value = c.userMessage || '';

    // Convert ISO string date to YYYY-MM-DDTHH:MM for datetime-local
    if (c.registerDate) {
      const d = new Date(c.registerDate);
      const offset = d.getTimezoneOffset() * 60000;
      const localISODate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      document.getElementById('modal-customer-date').value = localISODate;
    } else {
      document.getElementById('modal-customer-date').value = '';
    }

    customerModal.classList.add('active');
  }

  function closeCustomerModal() {
    if (customerModal) customerModal.classList.remove('active');
  }

  if (btnCloseCustomerModal) btnCloseCustomerModal.addEventListener('click', closeCustomerModal);
  if (btnCancelCustomerModal) btnCancelCustomerModal.addEventListener('click', closeCustomerModal);
  if (customerModal) {
    customerModal.addEventListener('click', (e) => {
      if (e.target === customerModal) closeCustomerModal();
    });
  }

  if (customerModalForm) {
    customerModalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('modal-customer-id').value;
      const name = document.getElementById('modal-customer-name').value.trim();
      const phone = document.getElementById('modal-customer-phone').value;
      const hopeItem = document.getElementById('modal-customer-item').value.trim();
      const hopeBrand = document.getElementById('modal-customer-brand').value;
      const purpose = document.getElementById('modal-customer-purpose').value;
      const budget = document.getElementById('modal-customer-budget').value;
      const consultTime = document.getElementById('modal-customer-time').value;
      const sellerId = document.getElementById('modal-customer-seller').value;
      const registerDate = new Date(document.getElementById('modal-customer-date').value).toISOString();
      const status = document.getElementById('modal-customer-status').value;
      const message = document.getElementById('modal-customer-message').value.trim();

      const cons = getConsultations();
      const index = cons.findIndex(c => c.id === id);
      if (index !== -1) {
        const oldStatus = cons[index].status;
        
        // Update all values
        cons[index].name = name;
        cons[index].phone = phone;
        cons[index].hopeItem = hopeItem;
        cons[index].hopeBrand = hopeBrand;
        cons[index].purpose = purpose;
        cons[index].budget = budget;
        cons[index].consultTime = consultTime;
        cons[index].sellerId = sellerId;
        cons[index].registerDate = registerDate;
        cons[index].status = status;
        cons[index].userMessage = message;
        
        setConsultations(cons);

        // Commission settlement trigger if status changed to '계약 완료'
        if (status === '계약 완료' && oldStatus !== '계약 완료' && sellerId) {
          generateCommissionSettlement(cons[index]);
        }

        alert("고객의 모든 상담 정보가 안전하게 저장되었습니다.");
        closeCustomerModal();
        renderCustomersTable();
      }
    });
  }

  function generateCommissionSettlement(consult) {
    const sets = getSettlements();
    
    // Check if duplicate settlement log already exists
    const exists = sets.some(s => s.orderId === consult.id);
    if (exists) return;

    const brands = getBrands();
    
    // Find commission fee for the brand
    // Find brand by name match
    const brand = brands.find(b => b.name === consult.hopeBrand || consult.hopeBrand.includes(b.name));
    const commissionVal = brand ? brand.fee : 100000; // Default 100,000 won if match not found

    const newSettlement = {
      id: 'set_' + Date.now(),
      orderId: consult.id,
      sellerId: consult.sellerId,
      customerName: consult.name,
      productName: consult.hopeItem,
      brandId: brand ? brand.id : 'unknown',
      brandName: consult.hopeBrand,
      commission: commissionVal,
      status: '미정산', // Default status: Unpaid (미정산)
      date: new Date().toISOString()
    };

    sets.push(newSettlement);
    setSettlements(sets);
    console.log('Commission settlement log automatically generated:', newSettlement);
  }


  /* ==========================================================================
     5. TAB: SETTLEMENT MANAGEMENT (HQ & Seller)
     ========================================================================== */
  const settlementStatusFilter = document.getElementById('settlement-status-filter');

  function renderSettlementsTable() {
    const tableBody = document.getElementById('settlements-table-body');
    if (!tableBody) return;

    const sets = getSettlements();
    const status = settlementStatusFilter.value;

    const filtered = sets.filter(s => {
      if (userSession.role === 'Seller' && s.sellerId !== userSession.sellerId) {
        return false;
      }
      return status ? s.status === status : true;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">정산 내역이 없습니다.</td></tr>`;
      return;
    }

    filtered.forEach(s => {
      const tr = document.createElement('tr');
      const dateStr = s.date ? new Date(s.date).toLocaleDateString('ko-KR') : '-';
      
      const badgeClass = s.status === '지급완료' ? 'badge-approved' : 'badge-pending';
      
      let actionBtnHtml = '';
      if (userSession.role === 'HQ' && s.status === '미정산') {
        actionBtnHtml = `<button class="btn btn-primary btn-xs btn-payout" data-id="${s.id}">지급 완료 처리</button>`;
      } else {
        actionBtnHtml = `<span class="small-text text-muted">${dateStr}</span>`;
      }

      tr.innerHTML = `
        <td class="small-text">${s.id}</td>
        <td class="bold">${s.sellerId}</td>
        <td>${s.customerName}</td>
        <td><span class="small-text">${s.productName}</span></td>
        <td><span class="badge badge-brand-label">${s.brandName}</span></td>
        <td class="bold font-green">₩${s.commission.toLocaleString()}</td>
        <td><span class="badge ${badgeClass}">${s.status}</span></td>
        <td>${actionBtnHtml}</td>
      `;

      const payBtn = tr.querySelector('.btn-payout');
      if (payBtn) {
        payBtn.addEventListener('click', () => {
          triggerPayout(s.id);
        });
      }

      tableBody.appendChild(tr);
    });
  }

  if (settlementStatusFilter) settlementStatusFilter.addEventListener('change', renderSettlementsTable);

  function triggerPayout(id) {
    if (!confirm("해당 수수료를 셀러에게 지급 완료 처리하시겠습니까?")) return;
    
    const sets = getSettlements();
    const idx = sets.findIndex(s => s.id === id);
    if (idx !== -1) {
      sets[idx].status = '지급완료';
      sets[idx].date = new Date().toISOString(); // Paid date
      setSettlements(sets);
      renderSettlementsTable();
      alert("지급 처리가 성공적으로 완료되었습니다.");
    }
  }


  /* ==========================================================================
     6. TAB: PRODUCT MANAGEMENT & PLAN TABS & URL SYNC (HQ ONLY)
     ========================================================================== */
  const btnAddProductToggle = document.getElementById('btn-add-product-toggle');
  const productFormContainer = document.getElementById('product-form-container');
  const productEditForm = document.getElementById('product-edit-form');
  const btnProductFormCancel = document.getElementById('btn-product-form-cancel');

  const btnProdSync = document.getElementById('btn-prod-sync');
  const prodSyncUrlList = document.getElementById('prod-sync-url-list');
  const btnAddSyncUrl = document.getElementById('btn-add-sync-url');

  // Multi-URL add/remove management
  function addSyncUrlRow() {
    if (!prodSyncUrlList) return;
    const row = document.createElement('div');
    row.className = 'sync-url-row';
    row.style.cssText = 'display: flex; gap: 6px; align-items: center;';
    row.innerHTML = `
      <input type="text" class="prod-sync-url-input" placeholder="네이버쇼핑, 비즈인노 상품 URL 입력" style="margin-bottom: 0; flex-grow: 1; height: 38px; padding: 8px 12px; font-size: 0.85rem;">
      <button type="button" class="btn-sync-url-remove" title="삭제" style="width: 34px; height: 34px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onmouseenter="this.style.color='var(--danger-color)'; this.style.background='rgba(220,53,69,0.08)'" onmouseleave="this.style.color='var(--text-muted)'; this.style.background='transparent'">✕</button>
    `;
    prodSyncUrlList.appendChild(row);
    updateSyncUrlRemoveButtons();
    row.querySelector('.prod-sync-url-input').focus();
  }

  function updateSyncUrlRemoveButtons() {
    if (!prodSyncUrlList) return;
    const rows = prodSyncUrlList.querySelectorAll('.sync-url-row');
    rows.forEach(row => {
      const removeBtn = row.querySelector('.btn-sync-url-remove');
      if (removeBtn) {
        removeBtn.style.visibility = rows.length <= 1 ? 'hidden' : 'visible';
      }
    });
  }

  function clearSyncUrlInputs() {
    if (!prodSyncUrlList) return;
    // Remove all rows except the first one, and clear the first one
    const rows = prodSyncUrlList.querySelectorAll('.sync-url-row');
    rows.forEach((row, i) => {
      if (i === 0) {
        row.querySelector('.prod-sync-url-input').value = '';
      } else {
        row.remove();
      }
    });
    updateSyncUrlRemoveButtons();
  }

  function getSyncUrls() {
    if (!prodSyncUrlList) return [];
    const inputs = prodSyncUrlList.querySelectorAll('.prod-sync-url-input');
    return Array.from(inputs).map(inp => inp.value.trim()).filter(v => v.length > 0);
  }

  if (btnAddSyncUrl) {
    btnAddSyncUrl.addEventListener('click', () => addSyncUrlRow());
  }

  if (prodSyncUrlList) {
    prodSyncUrlList.addEventListener('click', (e) => {
      if (e.target.closest('.btn-sync-url-remove')) {
        const row = e.target.closest('.sync-url-row');
        if (row) {
          row.remove();
          updateSyncUrlRemoveButtons();
        }
      }
    });
  }

  let currentActiveProductPlanTab = 'all'; // Default tab
  let productSearchQuery = '';

  const productSearchInput = document.getElementById('product-search-input');
  const productSelectAll = document.getElementById('product-select-all');
  const btnDeleteSelected = document.getElementById('btn-delete-selected');

  // Bind Search events
  if (productSearchInput) {
    productSearchInput.addEventListener('input', (e) => {
      productSearchQuery = e.target.value.trim().toLowerCase();
      renderProductsManagementList();
    });
  }

  // Bind Batch actions (Select All / Delete Selected)
  if (productSelectAll) {
    productSelectAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const checkboxes = document.querySelectorAll('.product-item-check');
      checkboxes.forEach(cb => {
        cb.checked = isChecked;
      });
      updateDeleteSelectedButtonState();
    });
  }

  if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener('click', () => {
      const checkedBoxes = document.querySelectorAll('.product-item-check:checked');
      if (checkedBoxes.length === 0) return;

      if (!confirm(`선택한 ${checkedBoxes.length}개의 가전제품을 정말 삭제하시겠습니까?`)) {
        return;
      }

      const idsToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
      const products = getProducts();
      const filtered = products.filter(p => !idsToDelete.includes(p.id));

      setProducts(filtered);
      alert('선택한 제품이 성공적으로 삭제되었습니다.');

      // Reset Select All
      if (productSelectAll) productSelectAll.checked = false;
      btnDeleteSelected.disabled = true;

      // Re-render
      renderProductsManagement();

      // If the currently edited product was deleted, close form
      const editId = document.getElementById('edit-prod-id').value;
      if (idsToDelete.includes(editId)) {
        productFormContainer.style.display = 'none';
        productEditForm.reset();
        clearSyncUrlInputs();
      }
    });
  }

  function updateDeleteSelectedButtonState() {
    if (!btnDeleteSelected) return;
    const checkedBoxes = document.querySelectorAll('.product-item-check:checked');
    btnDeleteSelected.disabled = checkedBoxes.length === 0;
  }

  // Drag and Drop Helper Functions
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.product-mini-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function saveProductReordering(container) {
    const currentProducts = getProducts();
    const visibleItems = [...container.querySelectorAll('.product-mini-item')];
    const visibleIds = visibleItems.map(item => item.getAttribute('data-id'));
    
    if (visibleIds.length <= 1) return; // Nothing to sort
    
    // Find indices of the visible items in the global products array
    const visibleIndicesInGlobal = visibleIds.map(id => currentProducts.findIndex(p => p.id === id))
                                              .filter(idx => idx !== -1);
    
    // Sort indices in ascending order to preserve the slots
    const sortedGlobalSlots = [...visibleIndicesInGlobal].sort((a, b) => a - b);
    
    // Create a new products array
    const newProducts = [...currentProducts];
    
    // Assign the visible products to the sorted slots in their new order
    visibleIds.forEach((productId, i) => {
      const targetSlotIndex = sortedGlobalSlots[i];
      newProducts[targetSlotIndex] = currentProducts.find(p => p.id === productId);
    });
    
    // Save to localStorage
    setProducts(newProducts);
    console.log("Appliance reordered globally. New order saved.");
  }

  // Render Horizontal Plan Tab bar
  function renderProductPlanTabs() {
    const tabsBar = document.getElementById('product-plan-tabs-bar');
    if (!tabsBar) return;

    const plans = getPlans();
    tabsBar.innerHTML = '';

    // 'All' tab
    const allTab = document.createElement('button');
    allTab.type = 'button';
    allTab.className = `btn-plan-tab ${currentActiveProductPlanTab === 'all' ? 'active' : ''}`;
    allTab.textContent = '전체 보기';
    allTab.addEventListener('click', () => {
      currentActiveProductPlanTab = 'all';
      renderProductPlanTabs();
      renderProductsManagementList();
    });
    tabsBar.appendChild(allTab);

    // Dynamic Plan tabs
    plans.forEach(p => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `btn-plan-tab ${currentActiveProductPlanTab === p.id ? 'active' : ''}`;
      tab.textContent = p.name;
      tab.addEventListener('click', () => {
        currentActiveProductPlanTab = p.id;
        renderProductPlanTabs();
        renderProductsManagementList();
      });
      tabsBar.appendChild(tab);
    });
  }

  function renderProductsManagement() {
    renderProductPlanTabs();
    renderProductsManagementList();
  }

  function renderProductsManagementList() {
    const miniList = document.getElementById('products-mini-list');
    if (!miniList) return;

    const products = getProducts();
    const plans = getPlans();

    // Filter products by current active plan tab
    let filtered = currentActiveProductPlanTab === 'all'
      ? products
      : products.filter(p => p.planId === currentActiveProductPlanTab);

    // Search filter
    const categoryMap = {
      'tv': 'TV',
      'fridge': '냉장고',
      'washer': '세탁기',
      'dryer': '건조기',
      'aircon': '에어컨',
      'airpurifier': '공기청정기',
      'cleaner': '청소기',
      'styler': '의류관리기',
      'furniture': '가구',
      'laptop': '노트북',
      'water': '정수기',
      'massage': '안마의자',
      'general': '일반가전'
    };
    if (productSearchQuery) {
      filtered = filtered.filter(p => {
        const categoryText = categoryMap[p.categoryId] || '가전';
        return p.name.toLowerCase().includes(productSearchQuery) ||
               p.modelName.toLowerCase().includes(productSearchQuery) ||
               categoryText.toLowerCase().includes(productSearchQuery);
      });
    }

    // Reset toolbar selections
    if (productSelectAll) productSelectAll.checked = false;
    if (btnDeleteSelected) btnDeleteSelected.disabled = true;

    // Update list title with count
    const listTitle = document.getElementById('current-plan-list-title');
    if (listTitle) {
      if (currentActiveProductPlanTab === 'all') {
        listTitle.textContent = `등록 가전 제품 목록 (${filtered.length}개)`;
      } else {
        const activePlan = plans.find(pl => pl.id === currentActiveProductPlanTab);
        listTitle.textContent = `${activePlan ? activePlan.name : '플랜'} 연동 가전 (${filtered.length}개)`;
      }
    }

    miniList.innerHTML = '';
    
    if (filtered.length === 0) {
      miniList.innerHTML = `<div class="text-center text-muted" style="grid-column: span 2; padding: 40px 0;">해당하는 가전 제품이 없습니다.</div>`;
      return;
    }

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = 'product-mini-item';
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-id', p.id);
      
      const categoryText = categoryMap[p.categoryId] || '가전';

      item.innerHTML = `
        <div class="drag-handle" title="드래그하여 순서 변경">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
          </svg>
        </div>
        <div class="product-item-checkbox-wrap">
          <input type="checkbox" class="product-item-check" data-id="${p.id}">
        </div>
        <img src="${p.thumbnail}" alt="" class="p-thumb">
        <div class="p-info">
          <span class="p-category">[${categoryText}] [${p.accounts || 1}구좌]</span>
          <h4 class="p-title">${p.name}</h4>
          <span class="p-model">${p.modelName}</span>
        </div>
        <div class="p-actions">
          <button class="btn btn-outline btn-xs btn-edit" data-id="${p.id}">수정</button>
          <button class="btn btn-cancelled btn-xs btn-delete" data-id="${p.id}">삭제</button>
        </div>
      `;

      item.querySelector('.btn-edit').addEventListener('click', () => {
        openEditProductForm(p.id);
      });

      item.querySelector('.btn-delete').addEventListener('click', () => {
        deleteProduct(p.id);
      });

      // Item Checkbox Change
      const checkbox = item.querySelector('.product-item-check');
      checkbox.addEventListener('change', () => {
        updateDeleteSelectedButtonState();
        
        // Update Select All Checkbox State
        const checkboxes = document.querySelectorAll('.product-item-check');
        const checkedCount = document.querySelectorAll('.product-item-check:checked').length;
        if (productSelectAll) {
          productSelectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
        }
      });

      // Drag and Drop Event Listeners on Item
      item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', p.id);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        miniList.classList.remove('drag-over');
        saveProductReordering(miniList);
      });

      miniList.appendChild(item);
    });

    // Add Drag Over visual support to miniList container once
    if (!miniList.dataset.dragBound) {
      miniList.dataset.dragBound = 'true';
      miniList.addEventListener('dragover', (e) => {
        e.preventDefault();
        miniList.classList.add('drag-over');
        const afterElement = getDragAfterElement(miniList, e.clientY);
        const draggingItem = document.querySelector('.product-mini-item.dragging');
        if (draggingItem) {
          if (afterElement == null) {
            miniList.appendChild(draggingItem);
          } else {
            miniList.insertBefore(draggingItem, afterElement);
          }
        }
      });

      miniList.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null || !miniList.contains(e.relatedTarget)) {
          miniList.classList.remove('drag-over');
        }
      });
    }
  }

  // Populate plans options in the single product form plan select dropdown
  function populateProductFormPlans() {
    const select = document.getElementById('prod-plan-id');
    if (!select) return;
    const plans = getPlans();
    select.innerHTML = '<option value="">-- 상조 상품 플랜 선택 --</option>';
    plans.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `[${getBrandName(p.brandId)}] ${p.name}`;
      select.appendChild(option);
    });
  }

  // Populate plans options in the bulk product modal plan select dropdown
  function populateBulkFormPlans() {
    const select = document.getElementById('bulk-target-plan-id');
    if (!select) return;
    const plans = getPlans();
    select.innerHTML = '';
    plans.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `[${getBrandName(p.brandId)}] ${p.name}`;
      select.appendChild(option);
    });
  }

  // Mock Scraped Database representing list pages
  const MOCK_SCRAPED_DATA = {
    laptops: [
      {
        name: 'LG gram 17인치 프리미엄 울트라',
        modelName: '17Z90S-GA50K',
        categoryId: 'digital',
        description: '초경량 1.35kg에 인텔 코어 Ultra 5 프로세서를 탑재한 대화면 고화질 노트북',
        thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '삼성 갤럭시북4 프로 에디션',
        modelName: 'NT960XGK-K71A',
        categoryId: 'digital',
        description: 'Intel Core Ultra 7 고성능 프로세서와 Dynamic AMOLED 2X 터치 스크린 비즈니스 노트북',
        thumbnail: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'LG gram Pro 16인치 터치',
        modelName: '16Z90SP-GA76K',
        categoryId: 'digital',
        description: '초슬림 디자인, 144Hz 고주사율 와이드 디스플레이와 강력한 쿨링 시스템 탑재',
        thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '삼성 갤럭시북4 울트라 고사양',
        modelName: 'NT960XGL-X92A',
        categoryId: 'digital',
        description: 'RTX 4070 외장 그래픽 칩셋 탑재로 그래픽 작업 및 하이엔드 게이밍 완벽 지원 노트북',
        thumbnail: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'
      }
    ],
    massage: [
      {
        name: '바디프랜드 다빈치 헬스케어 안마의자',
        modelName: 'BF-DAVINCI-X',
        categoryId: 'health',
        description: '자가 체성분 분석 측정 기능 및 사용자 맞춤 마사지 모드를 제공하는 메디컬 안마의자',
        thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '코지마 마일드 시그니처 안마의자',
        modelName: 'CMC-A380-S',
        categoryId: 'health',
        description: '인체공학적 LS 프레임과 4D 전신 에어백 입체 안마 시스템 탑재 안마의자',
        thumbnail: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '휴테크 카이 GTS7 아트모션',
        modelName: 'HT-KAI-GTS7',
        categoryId: 'health',
        description: '음파진동 마사지 기술과 전신 부위별 에어 마사지 제어를 지원하는 플래그십 체어',
        thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '세라젬 Master V7 메디컬 척추 온열기',
        modelName: 'CGM-V7-MEDICAL',
        categoryId: 'health',
        description: '식약처 인증 근육통 완화 및 척추 온열 마사지 의료 기기',
        thumbnail: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27--?auto=format&fit=crop&w=600&q=80'
      }
    ],
    bizinno: [
      {
        name: "LG 뚜껑형 김치냉장고",
        modelName: "K220LW111",
        categoryId: "living",
        description: "LG 뚜껑형 김치냉장고 (K220LW111) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/jiuvi5v5fj_1781828366187.jpg"
      },
      {
        name: "하이얼 하이얼 슬림 김치냉장고+쇼케이스",
        modelName: "ARK80MNW+HUF65PDW",
        categoryId: "living",
        description: "하이얼 하이얼 슬림 김치냉장고+쇼케이스 (ARK80MNW+HUF65PDW) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/2cynq4p9q1w_1781830622599.jpg"
      },
      {
        name: "하이얼 4도어 냉장고(433L)",
        modelName: "HRS445MN",
        categoryId: "living",
        description: "하이얼 4도어 냉장고(433L) (HRS445MN) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/2ecz80xhi8n_1781830489244.jpg"
      },
      {
        name: "삼성 일반형 냉장고(525L)",
        modelName: "RT53DG7A1CWW",
        categoryId: "living",
        description: "삼성 일반형 냉장고(525L) (RT53DG7A1CWW) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/yrilg8enmp9_1781829776388.jpg"
      },
      {
        name: "삼성 뚜껑형 김치냉장고(221L)",
        modelName: "RP22C3111Z3",
        categoryId: "living",
        description: "삼성 뚜껑형 김치냉장고(221L) (RP22C3111Z3) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/812xtcwsz2h_1781829931160.jpg"
      },
      {
        name: "삼성 55인치 UHD TV",
        modelName: "KU55UH8000FXKR 벽걸이/스탠드",
        categoryId: "digital",
        description: "삼성 55인치 UHD TV (KU55UH8000FXKR 벽걸이/스탠드) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/3xt7cyjsium_1782362912326.jpg"
      },
      {
        name: "SK매직 초소형 라이트 직수 정수기",
        modelName: "WPUJAC125S",
        categoryId: "living",
        description: "SK매직 초소형 라이트 직수 정수기 (WPUJAC125S) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/vrsajrtf73b_1781830114502.jpg"
      },
      {
        name: "LG 휘센 벽걸이 에어컨(7평)",
        modelName: "SQ07GA3WBS",
        categoryId: "living",
        description: "LG 휘센 벽걸이 에어컨(7평) (SQ07GA3WBS) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/s2ov2m4wnrs_1781828394639.jpg"
      },
      {
        name: "LG 트롬 건조기(10kg)",
        modelName: "RH10WTW",
        categoryId: "living",
        description: "LG 트롬 건조기(10kg) (RH10WTW) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/vkq7wcmfef_1781828485528.jpg"
      },
      {
        name: "LG 디오스 오브제컬렉션 식기세척기(12인용)",
        modelName: "DUE1BGLE",
        categoryId: "living",
        description: "LG 디오스 오브제컬렉션 식기세척기(12인용) (DUE1BGLE) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/vtl5j57yc5i_1781828428268.jpg"
      },
      {
        name: "LG 공기청정기(30평)",
        modelName: "AS305DWWA",
        categoryId: "living",
        description: "LG 공기청정기(30평) (AS305DWWA) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/batch_20260503_v8/X2/3138b8e6/21f6dd63/thumb_a8dda981.jpg"
      },
      {
        name: "JBL 사운드바",
        modelName: "JBLBAR800PROBLKAS1",
        categoryId: "digital",
        description: "JBL 사운드바 (JBLBAR800PROBLKAS1) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/2l16mvtu1go_1781830022219.jpg"
      },
      {
        name: "쿠쿠 끓인물 정수기(36개월)",
        modelName: "CP-TS100",
        categoryId: "living",
        description: "쿠쿠 끓인물 정수기(36개월) (CP-TS100) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/oprpxre1r7_1782278627953.jpg"
      },
      {
        name: "우즈 제습기+아르케 탄산수 제조기",
        modelName: "SW-30FW_PRO+Carbonator 3",
        categoryId: "living",
        description: "우즈 제습기+아르케 탄산수 제조기 (SW-30FW_PRO+Carbonator 3) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/78g24i7xye_1781830769776.jpg"
      },
      {
        name: "우즈 제습기",
        modelName: "SW-22FW",
        categoryId: "living",
        description: "우즈 제습기 (SW-22FW) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/plhuxvkb52a_1781830800091.jpg"
      },
      {
        name: "샤크 무선청소기 FIT+닌자 블렌더",
        modelName: "LC150KRBL+TB201KR",
        categoryId: "living",
        description: "샤크 무선청소기 FIT+닌자 블렌더 (LC150KRBL+TB201KR) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/l7hr81xzbd_1781830165772.jpg"
      },
      {
        name: "삼성 AI슬림 건조기(10kg)",
        modelName: "DV10BB8440GH",
        categoryId: "living",
        description: "삼성 AI슬림 건조기(10kg) (DV10BB8440GH) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/eyj4k08ujt8_1781828973769.jpg"
      },
      {
        name: "삼성 일반 벽걸이 에어컨(10형)",
        modelName: "AR50F10D13HS",
        categoryId: "living",
        description: "삼성 일반 벽걸이 에어컨(10형) (AR50F10D13HS) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/q1u74ygxai8_1781829894893.jpg"
      },
      {
        name: "삼성 무풍 벽걸이 에어컨(7평)",
        modelName: "AR60F07D12WS",
        categoryId: "living",
        description: "삼성 무풍 벽걸이 에어컨(7평) (AR60F07D12WS) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/j20puw00l8_1781829858928.jpg"
      },
      {
        name: "삼성 갤럭시 탭 S10 FE(Wi-Fi)",
        modelName: "SM-X520NZAAKOO",
        categoryId: "digital",
        description: "삼성 갤럭시 탭 S10 FE(Wi-Fi) (SM-X520NZAAKOO) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/ull881ykri_1781829972760.jpg"
      },
      {
        name: "로보락 S8 pro plus+샤오미 선풍기 2 Pro",
        modelName: "S8 pro plus+선풍기",
        categoryId: "living",
        description: "로보락 S8 pro plus+샤오미 선풍기 2 Pro (S8 pro plus+선풍기) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/c5mza3d22la_1782362662561.jpg"
      },
      {
        name: "로보락 S8 pro plus 로봇청소기+H60 Pro 무선청소기",
        modelName: "S8 pro plus+H60 Pro",
        categoryId: "living",
        description: "로보락 S8 pro plus 로봇청소기+H60 Pro 무선청소기 (S8 pro plus+H60 Pro) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/gm1npy5aoxs_1782262473847.jpg"
      },
      {
        name: "로라스타 스팀다리미",
        modelName: "LIFT 화이트",
        categoryId: "living",
        description: "로라스타 스팀다리미 (LIFT 화이트) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/vqladdes7fn_1781830838445.jpg"
      },
      {
        name: "드리미 물걸레 로봇청소기+습식 및 건식 진공청소기",
        modelName: "L10s Plus+G10",
        categoryId: "living",
        description: "드리미 물걸레 로봇청소기+습식 및 건식 진공청소기 (L10s Plus+G10) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/6ojhhbuoy69_1782279454628.jpg"
      },
      {
        name: "다이슨 헤어드라이어+로라스타 스티머",
        modelName: "슈퍼소닉 r+IGGI 스티머",
        categoryId: "living",
        description: "다이슨 헤어드라이어+로라스타 스티머 (슈퍼소닉 r+IGGI 스티머) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/t2z5tras7l_1781830734621.jpg"
      },
      {
        name: "다이슨 타워형 선풍기+우즈 제습기",
        modelName: "AM-07+SW-30FW",
        categoryId: "living",
        description: "다이슨 타워형 선풍기+우즈 제습기 (AM-07+SW-30FW) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/g88vr66yi8_1781830692706.jpg"
      },
      {
        name: "다이슨 청소기 V12S",
        modelName: "디텍트 슬림 서브마린 옐로니켈",
        categoryId: "living",
        description: "다이슨 청소기 V12S (디텍트 슬림 서브마린 옐로니켈) - 결합 상조상품: 스마트케어5싱글",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/pwvu7urobnh_1781830664646.jpg"
      }
    ],
    bizinno_2: [
      {
        name: "LG 트롬 오브제컬렉션 세탁기(21kg)",
        modelName: "FG21WNR",
        categoryId: "washer",
        description: "LG 트롬 오브제컬렉션 세탁기(21kg) (FG21WNR) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/batch_20260503_v8/X2/3138b8e6/2f9f9018/thumb_ea9dc261.png"
      },
      {
        name: "LG 통돌이 컴포트 세탁기(21kg)",
        modelName: "T21GZ9",
        categoryId: "washer",
        description: "LG 통돌이 컴포트 세탁기(21kg) (T21GZ9) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/bwejs0ngmh_1782361830419.jpg"
      },
      {
        name: "하이얼 식기세척기+세탁기",
        modelName: "HDW06MFW+HW12-BP4959LK-B",
        categoryId: "washer",
        description: "하이얼 식기세척기+세탁기 (HDW06MFW+HW12-BP4959LK-B) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/kza9o41y1xq_1781746704158.jpg"
      },
      {
        name: "삼성 그랑데 세탁기(21kg)",
        modelName: "WF21DG6650BW",
        categoryId: "washer",
        description: "삼성 그랑데 세탁기(21kg) (WF21DG6650BW) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/wf21dg6650bw_thumb_final_v1.jpg"
      },
      {
        name: "삼성 양문형 냉장고(852L)",
        modelName: "RS84DB5002CW",
        categoryId: "fridge",
        description: "삼성 양문형 냉장고(852L) (RS84DB5002CW) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/rs84db5002cw_thumb.jpg"
      },
      {
        name: "삼성 1도어 냉장고(380L)",
        modelName: "RR70H39E10",
        categoryId: "fridge",
        description: "삼성 1도어 냉장고(380L) (RR70H39E10) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/5jvyfnh8sxt_1781738769077.jpg"
      },
      {
        name: "삼성 1도어 김치냉장고",
        modelName: "RQ70H32S10 코타화이트",
        categoryId: "fridge",
        description: "삼성 1도어 김치냉장고 (RQ70H32S10 코타화이트) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/6niodu9zqvw_1781739607032.jpg"
      },
      {
        name: "1도어 냉동고(318L)",
        modelName: "RZ70H32JN0",
        categoryId: "fridge",
        description: "1도어 냉동고(318L) (RZ70H32JN0) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/xldfsfe6akc_1781738855302.jpg"
      },
      {
        name: "LG 50인치 나노셀 AI TV",
        modelName: "50NA1C90AK 벽걸이/스탠드",
        categoryId: "tv",
        description: "LG 50인치 나노셀 AI TV (50NA1C90AK 벽걸이/스탠드) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/mlpfex6ov5i_1779085528295.png"
      },
      {
        name: "삼성 55인치 miniLED TV",
        modelName: "KU55MH75AFXKR 벽걸이",
        categoryId: "tv",
        description: "삼성 55인치 miniLED TV (KU55MH75AFXKR 벽걸이) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/gxwnyuib3xm_1780034278750.jpg"
      },
      {
        name: "삼성 43인치 Serif TV",
        modelName: "KQ43LSD01AFXKR",
        categoryId: "tv",
        description: "삼성 43인치 Serif TV (KQ43LSD01AFXKR) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/kq43lsd01afxkr_thumb.jpg"
      },
      {
        name: "SK매직 원코크 얼음물 정수기(36개월)",
        modelName: "WPUIAC414S",
        categoryId: "water",
        description: "SK매직 원코크 얼음물 정수기(36개월) (WPUIAC414S) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/wpu_iac414_sk_______________wpu_iac414__png.png"
      },
      {
        name: "LG 트롬 건조기 듀얼 인버터 히트펌프",
        modelName: "RH10VTA 모던 스테인리스",
        categoryId: "dryer",
        description: "LG 트롬 건조기 듀얼 인버터 히트펌프 (RH10VTA 모던 스테인리스) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/batch_20260503_v8/X2/3138b8e6/5b1cde5f/thumb_202e7500.jpg"
      },
      {
        name: "LG 바스에어시스템 프리미엄 듀얼",
        modelName: "MX0120BASR",
        categoryId: "general",
        description: "LG 바스에어시스템 프리미엄 듀얼 (MX0120BASR) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/batch_20260503_v8/X2/3138b8e6/2b615446/thumb_0d550947.png"
      },
      {
        name: "DJI 로봇청소기",
        modelName: "ROMO 로모 S",
        categoryId: "cleaner",
        description: "DJI 로봇청소기 (ROMO 로모 S) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/ec7dzohmty7_1781746877808.jpg"
      },
      {
        name: "쿠쿠 초소형 정수기(48개월)",
        modelName: "CP-AMS100E",
        categoryId: "water",
        description: "쿠쿠 초소형 정수기(48개월) (CP-AMS100E) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/cp_ams100e___________cp_ams100ewh________png.png"
      },
      {
        name: "쿠쿠 무선청소기+음식물처리기",
        modelName: "CVC-DEM2540UG+CFD-EFF201DCNW 노블화이트",
        categoryId: "cleaner",
        description: "쿠쿠 무선청소기+음식물처리기 (CVC-DEM2540UG+CFD-EFF201DCNW 노블화이트) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/cvc_dem2540ug_cfd_eff201dcn_________________cvc_dem2540ug_cfd_eff201dcnw_g__jpg.jpg"
      },
      {
        name: "쿠쿠 냉온정 얼음정수기(48개월)",
        modelName: "CP-SS100WSV",
        categoryId: "water",
        description: "쿠쿠 냉온정 얼음정수기(48개월) (CP-SS100WSV) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/cp_ss100wsv______________48____cp_ss100wsv_jpg.jpg"
      },
      {
        name: "쿠쿠 공기청정기(20평)(48개월)+음식물처리기",
        modelName: "AC-20T10FWH+CFD-EFF201DCNW 노블화이트",
        categoryId: "airpurifier",
        description: "쿠쿠 공기청정기(20평)(48개월)+음식물처리기 (AC-20T10FWH+CFD-EFF201DCNW 노블화이트) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/980pe6gtlok_1781740332374.jpg"
      },
      {
        name: "전동 매트화이트 스크린 120인치 노출형",
        modelName: "BBMW-120",
        categoryId: "general",
        description: "전동 매트화이트 스크린 120인치 노출형 (BBMW-120) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/43g9e0ov8j3_1782712200486.jpg"
      },
      {
        name: "우즈 제습기",
        modelName: "SW-42FX",
        categoryId: "general",
        description: "우즈 제습기 (SW-42FX) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/b3boetq69zp_1781746913163.jpg"
      },
      {
        name: "에스테오 EP7 뷰티 디바이스",
        modelName: "SE-5100",
        categoryId: "general",
        description: "에스테오 EP7 뷰티 디바이스 (SE-5100) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/se_5100______ep7_________se_5100__jpg.jpg"
      },
      {
        name: "애플 아이패드 11세대 패키지",
        modelName: "MD3Y4KH/Asilver+JCP5428+JCP2723+JCP2602+ID716",
        categoryId: "general",
        description: "애플 아이패드 11세대 패키지 (MD3Y4KH/Asilver+JCP5428+JCP2723+JCP2602+ID716) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/fl8b8gtlwk_1782106159235.jpg"
      },
      {
        name: "샤크 무선청소기 FIT+에어스타일러+선풍기",
        modelName: "LC150KRBL+HD434KR+FA221KR",
        categoryId: "cleaner",
        description: "샤크 무선청소기 FIT+에어스타일러+선풍기 (LC150KRBL+HD434KR+FA221KR) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/zf86r1ef2i_1781741133284.jpg"
      },
      {
        name: "샤크 무선청소기 FIT+닌자블렌더+선풍기",
        modelName: "LC150KRBL+TB201KR+FA221KR",
        categoryId: "cleaner",
        description: "샤크 무선청소기 FIT+닌자블렌더+선풍기 (LC150KRBL+TB201KR+FA221KR) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/72u1kbqf7bd_1781746580182.jpg"
      },
      {
        name: "삼성 제트청소기",
        modelName: "VS28D950ACB",
        categoryId: "cleaner",
        description: "삼성 제트청소기 (VS28D950ACB) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/clean_assets_20260509/vs28d950acb_thumb.jpg"
      },
      {
        name: "삼성 인덕션",
        modelName: "NZ63DB657CFH",
        categoryId: "general",
        description: "삼성 인덕션 (NZ63DB657CFH) - 결합 상조상품: 스마트케어4더블",
        thumbnail: "https://tvtpvecnjyjnvjhbozks.supabase.co/storage/v1/object/public/products/uploads/981ardunso8_1781739295778.jpg"
      }
    ],
    mixed: [
      {
        name: 'LG 오브제컬렉션 원바디 워시타워',
        modelName: 'W20GE-T',
        categoryId: 'living',
        description: '세탁기 25kg과 건조기 21kg이 완벽하게 일체화된 인공지능 공간 맞춤 워시타워',
        thumbnail: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '삼성 비스포크 4도어 패밀리허브 냉장고',
        modelName: 'RF85C9001AP-B',
        categoryId: 'living',
        description: '원하는 인테리어 패널 매칭과 트리플 메탈 쿨링 초신선 밀폐 보관 대용량 냉장고',
        thumbnail: 'https://images.unsplash.com/photo-1571175432247-5c20050868f0?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '삼성 비스포크 제트 청소기',
        modelName: 'VS20B956AXE',
        categoryId: 'living',
        description: '일체형 청정스테이션과 강력한 흡입력으로 먼지날림 없이 비워주는 무선 먼지 흡입 청소기',
        thumbnail: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'LG 디오스 식기세척기 오브제컬렉션',
        modelName: 'DUBJ2EAL',
        categoryId: 'living',
        description: '100도 트루스팀 기술로 유해 세균을 99.999% 살균 소독 세척하는 스마트 식기세척기',
        thumbnail: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: '쿠쿠 인앤아웃 얼음정수기',
        modelName: 'CP-SS100HW',
        categoryId: 'living',
        description: '직수형 얼음 정수기, 자동 살균 시스템 및 초고속 직수 제빙 기능 제공',
        thumbnail: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=600&q=80'
      }
    ]
  };

  const bulkProductModal = document.getElementById('bulk-product-modal');
  const btnBulkProductModalClose = document.getElementById('bulk-product-modal-close');
  const btnBulkProductModalCancel = document.getElementById('bulk-product-modal-cancel');
  const btnBulkImportSave = document.getElementById('btn-bulk-import-save');
  const bulkProductsListBody = document.getElementById('bulk-products-list-body');
  const bulkScrapedCount = document.getElementById('bulk-scraped-count');
  const bulkSelectAll = document.getElementById('bulk-select-all');

  let currentScrapedProducts = [];

  function renderScrapedItemsList(items) {
    if (!bulkProductsListBody) return;
    bulkProductsListBody.innerHTML = '';
    bulkScrapedCount.textContent = items.length;
    bulkSelectAll.checked = true;

    const categoryMap = {
      'tv': 'TV',
      'fridge': '냉장고',
      'washer': '세탁기',
      'dryer': '건조기',
      'aircon': '에어컨',
      'airpurifier': '공기청정기',
      'cleaner': '청소기',
      'styler': '의류관리기',
      'furniture': '가구',
      'laptop': '노트북',
      'water': '정수기',
      'massage': '안마의자',
      'general': '일반가전'
    };

    items.forEach((p, index) => {
      const autoCatId = autoDetermineCategory(p.name, p.description);
      const categoryName = categoryMap[autoCatId] || '일반가전';

      const div = document.createElement('div');
      div.className = 'scraped-product-item';
      div.style.cssText = 'display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); background: #ffffff;';
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; flex-grow: 1;">
          <input type="checkbox" class="bulk-item-check" data-index="${index}" checked style="width: auto; margin-bottom: 0; transform: scale(1.1); cursor: pointer;">
          <img src="${p.thumbnail}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" onerror="this.src='https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=150&q=80'">
          <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
            <span class="small-text text-muted" style="font-size: 0.72rem; font-weight: 700;">[${categoryName}]</span>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin: 0;">${p.name}</h4>
            <span class="small-text" style="font-size: 0.78rem; color: var(--primary-color); font-weight: 600;">모델명: ${p.modelName}</span>
            <p class="text-muted" style="font-size: 0.75rem; margin: 0; line-height: 1.3; max-width: 500px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">${p.description}</p>
          </div>
        </div>
      `;
      bulkProductsListBody.appendChild(div);
    });
  }

  function closeBulkProductModal() {
    if (bulkProductModal) {
      bulkProductModal.classList.remove('active');
      clearSyncUrlInputs();
    }
  }

  if (btnBulkProductModalClose) btnBulkProductModalClose.addEventListener('click', closeBulkProductModal);
  if (btnBulkProductModalCancel) btnBulkProductModalCancel.addEventListener('click', closeBulkProductModal);
  if (bulkProductModal) {
    bulkProductModal.addEventListener('click', (e) => {
      if (e.target === bulkProductModal) closeBulkProductModal();
    });
  }

  if (bulkSelectAll) {
    bulkSelectAll.addEventListener('change', (e) => {
      const checks = bulkProductsListBody.querySelectorAll('.bulk-item-check');
      checks.forEach(c => c.checked = e.target.checked);
    });
  }

  if (btnBulkImportSave) {
    btnBulkImportSave.addEventListener('click', () => {
      const checks = bulkProductsListBody.querySelectorAll('.bulk-item-check:checked');
      if (checks.length === 0) {
        alert("등록할 상품을 적어도 하나 이상 선택해주세요.");
        return;
      }

      const products = getProducts();
      let importedCount = 0;

      // Determine which plan and accounts to link the imported products to
      const targetPlanSelect = document.getElementById('bulk-target-plan-id');
      const targetPlanId = targetPlanSelect ? targetPlanSelect.value : currentActiveProductPlanTab;
      
      const targetAccountsSelect = document.getElementById('bulk-target-accounts');
      const targetAccounts = targetAccountsSelect ? parseInt(targetAccountsSelect.value) || 1 : 1;

      if (!targetPlanId) {
        alert("등록할 상조 플랜이 존재하지 않습니다. 상조사 관리에서 플랜을 먼저 등록해주세요.");
        return;
      }

      checks.forEach(chk => {
        const index = parseInt(chk.getAttribute('data-index'));
        const item = currentScrapedProducts[index];
        if (!item) return;

        const autoCatId = autoDetermineCategory(item.name, item.description);
        let monthlyPrice = 39000;
        let benefitPrice = 19000;
        
        if (['fridge', 'washer', 'dryer', 'aircon', 'furniture'].includes(autoCatId)) {
          monthlyPrice = 49000;
          benefitPrice = 29000;
        } else if (['massage', 'tv'].includes(autoCatId)) {
          monthlyPrice = 59000;
          benefitPrice = 39000;
        } else if (['water', 'cleaner', 'airpurifier', 'styler'].includes(autoCatId)) {
          monthlyPrice = 29900;
          benefitPrice = 12900;
        } else if (['laptop'].includes(autoCatId)) {
          monthlyPrice = 42900;
          benefitPrice = 22900;
        }

        const newProduct = {
          id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: item.name,
          categoryId: autoCatId,
          modelName: item.modelName,
          description: item.description,
          thumbnail: item.thumbnail,
          planId: targetPlanId,
          accounts: targetAccounts,
          monthly: monthlyPrice,
          cardBenefitPrice: benefitPrice
        };

        products.push(newProduct);
        importedCount++;
      });

      setProducts(products);
      alert(`선택하신 ${importedCount}개의 가전제품이 상조 상품 플랜과 함께 성공적으로 일괄 등록되었습니다!`);
      
      closeBulkProductModal();
      
      // Close single product form if open
      productFormContainer.style.display = 'none';
      productEditForm.reset();
      
      renderProductsManagement();
    });
  }

  // Handle URL Sync Crawler Simulator (Multi-URL support)
  async function resolveUrlToMockData(rawUrl, accountsOverride) {
    let urlClean = rawUrl.toLowerCase().trim();
    urlClean = urlClean.replace(/^(https?:\/\/)?(www\.)?/i, '');
    urlClean = urlClean.replace(/\/$/, '');

    // Parse accounts and page query parameters from URL
    let accountsVal = null;
    let pageVal = null;
    try {
      const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
      accountsVal = urlObj.searchParams.get('accounts');
      pageVal = urlObj.searchParams.get('page');
    } catch (e) {
      const matchAcc = rawUrl.match(/accounts=(\d+)/i);
      if (matchAcc) accountsVal = matchAcc[1];
      const matchPage = rawUrl.match(/page=(\d+)/i);
      if (matchPage) pageVal = matchPage[1];
    }

    // 1. If it's a Lifenuri URL, dynamically fetch products via AJAX POST
    if (urlClean.includes('lifenuri.com')) {
      console.log("[Lifenuri Scanner] Detected Lifenuri URL:", rawUrl);
      const accounts = accountsOverride !== undefined ? accountsOverride : 1;
      
      // Convert rawUrl to local proxy URL
      let proxiedUrl = rawUrl;
      try {
        const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
        proxiedUrl = '/lifenuri-proxy' + urlObj.pathname + urlObj.search;
        console.log("[Lifenuri Scanner] Proxied URL:", proxiedUrl);
      } catch (e) {
        console.warn("Failed to construct proxied Lifenuri URL:", e);
      }

      try {
        console.log("[Lifenuri Scanner] Fetching HTML from proxy...");
        const resHtml = await fetch(proxiedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        console.log("[Lifenuri Scanner] HTML Response Status:", resHtml.status);
        if (resHtml.ok) {
          const html = await resHtml.text();
          const themeNoMatch = html.match(/var\s+first_theme\s*=\s*(\d+)/i) || html.match(/onclick="listdata\('(\d+)'\)"/i);
          const themeNo = themeNoMatch ? themeNoMatch[1] : null;
          console.log("[Lifenuri Scanner] Extracted themeNo:", themeNo);

          if (themeNo) {
            console.log("[Lifenuri Scanner] Fetching product list via POST...");
            const listRes = await fetch(`/lifenuri-proxy/shop/themes/${themeNo}/list`, {
              method: "POST",
              headers: {
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": rawUrl,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              },
              body: `actions=goods&themes_no=${themeNo}`
            });
            console.log("[Lifenuri Scanner] POST Response Status:", listRes.status);

            if (listRes.ok) {
              const listData = await listRes.json();
              console.log("[Lifenuri Scanner] API Return Code:", listData.return_code, "Message:", listData.return_msg);
              if (listData.return_code === 1000) {
                const rawProducts = listData.themeslistrow || [];
                const liveProducts = rawProducts.map(p => {
                  const name = p.goods_title || "";
                  const modelName = p.goods_info_model || "";
                  const thumbnail = p.goods_image_main2 || "";
                  const goodsCode = p.goods_code || "";
                  
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

                  const acc = accounts;
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
                console.log("[Lifenuri Scanner] Successfully parsed products count:", liveProducts.length);
                return { data: liveProducts, url: rawUrl };
              } else {
                console.warn("[Lifenuri Scanner] API returned error return_code:", listData.return_code, listData.return_msg);
              }
            } else {
              console.warn("[Lifenuri Scanner] POST request failed with status:", listRes.status);
            }
          } else {
            console.warn("[Lifenuri Scanner] Could not extract themeNo from HTML content");
          }
        } else {
          console.warn("[Lifenuri Scanner] HTML request failed with status:", resHtml.status);
        }
      } catch (err) {
        console.warn("Failed to fetch live Lifenuri products in simulator:", err);
      }
    }

    // 2. If it's a Bizinno URL, dynamically generate/filter products based on the accounts count
    if (urlClean.includes('bizinno.kr')) {
      const accounts = accountsOverride !== undefined ? accountsOverride : (accountsVal ? parseInt(accountsVal) : null);
      const page = pageVal ? parseInt(pageVal) : null;

      try {
        // Try fetching live products from Bizinno's database (Supabase)
        const supabaseUrl = 'https://tvtpvecnjyjnvjhbozks.supabase.co/rest/v1/products?select=*';
        const response = await fetch(supabaseUrl, {
          headers: {
            'apikey': 'sb_publishable_bgd5nh-qDblE3CfK6SbJXw_brkDvmXC',
            'authorization': 'Bearer sb_publishable_bgd5nh-qDblE3CfK6SbJXw_brkDvmXC',
            'accept-profile': 'public'
          }
        });

        if (response.ok) {
          const data = await response.json();
          let filtered = data;
          if (accounts !== null) {
            filtered = data.filter(item => item['구좌수'] === accounts);
          }
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

          const liveProducts = filtered.map(item => {
            const name = item['제품명'] || '';
            const modelName = item['모델명'] || '';
            
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

          return { data: liveProducts, url: rawUrl };
        }
      } catch (err) {
        console.warn("Failed to fetch live Bizinno products, falling back to local mock:", err);
      }

      // Local mock fallback if Supabase fails
      const allBizinno = MOCK_SCRAPED_DATA.bizinno;
      
      if (accounts === 1) {
        const targetIds = [
          "SQ07GA3WBS", // LG 휘센 벽걸이 에어컨(7평)
          "WPUJAC125S", // SK매직 초소형 라이트 직수 정수기
          "AS305DWWA",  // LG 공기청정기(30평)
          "JBLBAR800PROBLKAS1", // JBL 사운드바
          "CP-TS100",   // 쿠쿠 끓인물 정수기(36개월)
          "SW-22FW"     // 우즈 제습기
        ];
        const filtered = allBizinno.filter(p => targetIds.includes(p.modelName)).map(p => ({
          ...p,
          description: `${p.name} (${p.modelName}) - 결합 상조상품: 스마트케어5싱글`,
          href: p.href ? p.href.replace(/accounts=\d+/, 'accounts=1') : `/product/${p.modelName}?accounts=1`
        }));
        return { data: filtered, url: rawUrl };
      } else if (accounts === 2) {
        const pageNum = parseInt(pageVal) || 1;
        if (pageNum === 2) {
          // Return page 2 products (last 14 items)
          return { data: MOCK_SCRAPED_DATA.bizinno_2.slice(13), url: rawUrl };
        } else {
          // Return page 1 products (first 13 items)
          return { data: MOCK_SCRAPED_DATA.bizinno_2.slice(0, 13), url: rawUrl };
        }
      } else if (accounts === 3) {
        const targetIds = [
          "SW-30FW_PRO+Carbonator 3", // 우즈 제습기+아르케 탄산수 제조기
          "LC150KRBL+TB201KR", // 샤크 무선청소기 FIT+닌자 블렌더
          "SM-X520NZAAKOO",  // 삼성 갤럭시 탭 S10 FE
          "S8 pro plus+선풍기" // 로보락 S8 pro plus+선풍기
        ];
        const filtered = allBizinno.filter(p => targetIds.includes(p.modelName)).map(p => ({
          ...p,
          description: `${p.name} (${p.modelName}) - 결합 상조상품: 스마트케어5트리플`,
          href: p.href ? p.href.replace(/accounts=\d+/, 'accounts=3') : `/product/${p.modelName}?accounts=3`
        }));
        return { data: filtered, url: rawUrl };
      } else if (accounts === 4) {
        const targetIds = [
          "S8 pro plus+H60 Pro", // 로보락 S8 pro plus 로봇청소기+H60 Pro 무선청소기
          "LIFT 화이트", // 로라스타 스팀다리미
          "L10s Plus+G10", // 드리미 물걸레 로봇청소기+습식 및 건식 진공청소기
          "슈퍼소닉 r+IGGI 스티머", // 다이슨 헤어드라이어+로라스타 스티머
          "AM-07+SW-30FW", // 다이슨 타워형 선풍기+우즈 제습기
          "디텍트 슬림 서브마린 옐로니켈" // 다이슨 청소기 V12S
        ];
        const filtered = allBizinno.filter(p => targetIds.includes(p.modelName)).map(p => ({
          ...p,
          description: `${p.name} (${p.modelName}) - 결합 상조상품: 스마트케어5쿼드`,
          href: p.href ? p.href.replace(/accounts=\d+/, 'accounts=4') : `/product/${p.modelName}?accounts=4`
        }));
        return { data: filtered, url: rawUrl };
      }
      
      // Default return all bizinno products
      return { data: allBizinno, url: rawUrl };
    }

    // 2. Fallbacks based on keywords
    if (urlClean.includes('laptops') || urlClean.includes('notebooks') || urlClean.includes('laptop') || urlClean.includes('notebook')) {
      return { data: MOCK_SCRAPED_DATA.laptops, url: rawUrl };
    } else if (urlClean.includes('massage') || urlClean.includes('chairs') || urlClean.includes('chair') || urlClean.includes('안마')) {
      return { data: MOCK_SCRAPED_DATA.massage, url: rawUrl };
    } else if (urlClean.includes('mixed') || urlClean.includes('혼합')) {
      return { data: MOCK_SCRAPED_DATA.mixed, url: rawUrl };
    }
    
    // Default fallback to support any URL input
    return { data: MOCK_SCRAPED_DATA.mixed, url: rawUrl };
  }

  if (btnProdSync) {
    btnProdSync.addEventListener('click', async () => {
      const urls = getSyncUrls();
      if (urls.length === 0) {
        alert("동기화할 상품 리스트 페이지 URL을 1개 이상 입력해주세요.");
        return;
      }

      const syncAccountsSelect = document.getElementById('prod-sync-accounts');
      const selectedAccounts = syncAccountsSelect ? parseInt(syncAccountsSelect.value) : 1;

      const originalBtnText = btnProdSync.innerHTML;
      btnProdSync.disabled = true;
      btnProdSync.innerHTML = `<span class="sync-spinner"></span>${urls.length}개 URL 수집 중`;

      let mergedList = [];
      const failedUrls = [];

      try {
        if (convex) {
          const result = await convex.action(api.scraper.scrapeProducts, { urls, accounts: selectedAccounts });
          
          if (result && result.products && result.products.length > 0) {
            mergedList = result.products;
          }
          
          // Fall back to simulator if the real scraper returned no products or had errors
          if (mergedList.length === 0 || (result && result.errors && result.errors.length > 0)) {
            const urlsToMock = (result && result.errors && result.errors.length > 0)
              ? result.errors.map(e => e.url)
              : urls;

            for (const rawUrl of urlsToMock) {
              const mockResult = await resolveUrlToMockData(rawUrl, selectedAccounts);
              if (mockResult) {
                mockResult.data.forEach(item => {
                  if (!mergedList.some(existing => existing.modelName === item.modelName && existing.name === item.name)) {
                    mergedList.push(item);
                  }
                });
              } else {
                failedUrls.push(rawUrl);
              }
            }
          }
        } else {
          throw new Error("Convex client is not initialized.");
        }
      } catch (err) {
        console.warn("Convex scraper failed or is unavailable, falling back to simulator:", err);
        // Fallback simulator logic
        for (const rawUrl of urls) {
          const result = await resolveUrlToMockData(rawUrl, selectedAccounts);
          if (result) {
            mergedList = mergedList.concat(result.data);
          } else {
            failedUrls.push(rawUrl);
          }
        }
      }

      btnProdSync.disabled = false;
      btnProdSync.innerHTML = originalBtnText;

      // If ALL URLs failed
      if (mergedList.length === 0) {
        alert(`수집할 수 없는 URL입니다.\n입력하신 URL:\n${failedUrls.map(u => '  - ' + u).join('\n')}\n\nURL이 정확하고 접속 가능한지 확인해주세요.`);
        return;
      }

      // If some URLs failed, warn but continue
      if (failedUrls.length > 0) {
        alert(`일부 URL에서 수집하지 못했습니다:\n${failedUrls.map(u => '  - ' + u).join('\n')}\n\n나머지 ${urls.length - failedUrls.length}개 URL에서 수집된 ${mergedList.length}개 상품을 표시합니다.`);
      }

      currentScrapedProducts = mergedList;
      renderScrapedItemsList(mergedList);

      // Pre-fill target plan and accounts dropdowns in the bulk import modal
      populateBulkFormPlans();
      const bulkPlanIdSelect = document.getElementById('bulk-target-plan-id');
      const plans = getPlans();
      if (bulkPlanIdSelect) {
        bulkPlanIdSelect.value = currentActiveProductPlanTab === 'all' ? (plans.length > 0 ? plans[0].id : '') : currentActiveProductPlanTab;
      }

      const bulkAccountsSelect = document.getElementById('bulk-target-accounts');
      if (bulkAccountsSelect && syncAccountsSelect) {
        bulkAccountsSelect.value = syncAccountsSelect.value;
      }

      if (bulkProductModal) {
        bulkProductModal.classList.add('active');
      }
    });
  }

  // Open Product form to edit
  function openEditProductForm(id) {
    const products = getProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('product-form-title').textContent = "제품 정보 수정";
    document.getElementById('edit-prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.categoryId;
    document.getElementById('prod-model').value = p.modelName;
    document.getElementById('prod-desc').value = p.description;
    document.getElementById('prod-thumb').value = p.thumbnail;
    clearSyncUrlInputs();

    populateProductFormPlans();
    document.getElementById('prod-plan-id').value = p.planId || '';
    
    // Format monthly and card benefit price inputs
    const monthlyInput = document.getElementById('prod-price-monthly');
    const cardInput = document.getElementById('prod-price-card');
    
    monthlyInput.value = p.monthly ? parseInt(p.monthly).toLocaleString('ko-KR') : '';
    cardInput.value = p.cardBenefitPrice ? parseInt(p.cardBenefitPrice).toLocaleString('ko-KR') : '';

    const accountsSelect = document.getElementById('prod-accounts');
    if (accountsSelect) {
      accountsSelect.value = p.accounts || 1;
    }

    productFormContainer.style.display = 'block';
    document.getElementById('prod-name').focus();
  }

  // Toggle Form
  if (btnAddProductToggle) {
    btnAddProductToggle.addEventListener('click', () => {
      if (currentActiveProductPlanTab === 'all') {
        alert("연동할 상조 상품을 먼저 선택해 주세요.");
        return;
      }
      document.getElementById('product-form-title').textContent = "새 가전제품 등록";
      productEditForm.reset();
      document.getElementById('edit-prod-id').value = '';
      clearSyncUrlInputs();
      
      populateProductFormPlans();
      
      // Auto-preselect current plan in the dropdown
      const planSelect = document.getElementById('prod-plan-id');
      if (planSelect) {
        planSelect.value = currentActiveProductPlanTab;
      }

      const accountsSelect = document.getElementById('prod-accounts');
      if (accountsSelect) {
        accountsSelect.value = "1";
      }
      
      productFormContainer.style.display = 'block';
    });
  }

  if (btnProductFormCancel) {
    btnProductFormCancel.addEventListener('click', () => {
      productFormContainer.style.display = 'none';
      productEditForm.reset();
      clearSyncUrlInputs();
    });
  }

  // Submit Product Add/Edit Form
  if (productEditForm) {
    productEditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = document.getElementById('edit-prod-id').value;
      const name = document.getElementById('prod-name').value.trim();
      const categoryId = document.getElementById('prod-category').value;
      const modelName = document.getElementById('prod-model').value.trim();
      const description = document.getElementById('prod-desc').value.trim();
      const thumbnail = document.getElementById('prod-thumb').value.trim();
      
      const planId = document.getElementById('prod-plan-id').value;
      const monthlyVal = parseInt(document.getElementById('prod-price-monthly').value.replace(/[^0-9]/g, ''));
      const benefitVal = parseInt(document.getElementById('prod-price-card').value.replace(/[^0-9]/g, ''));
      const accountsSelect = document.getElementById('prod-accounts');
      const accounts = accountsSelect ? parseInt(accountsSelect.value) || 1 : 1;

      if (!planId) {
        alert("연동할 상조 상품 플랜을 선택해주세요.");
        return;
      }
      if (isNaN(monthlyVal) || isNaN(benefitVal)) {
        alert("월 납입금과 제휴카드 최대 혜택가를 숫자로 올바르게 기입해주세요.");
        return;
      }

      const products = getProducts();

      if (editId) {
        // Edit Mode
        const idx = products.findIndex(prod => prod.id === editId);
        if (idx !== -1) {
          products[idx] = { 
            id: editId, 
            name, 
            categoryId, 
            modelName, 
            description, 
            thumbnail, 
            planId, 
            monthly: monthlyVal, 
            cardBenefitPrice: benefitVal,
            accounts
          };
          setProducts(products);
          alert("가전제품 수정이 성공적으로 저장되었습니다.");
        }
      } else {
        // Add Mode
        const newProduct = {
          id: 'prod_' + Date.now(),
          name, 
          categoryId, 
          modelName, 
          description, 
          thumbnail, 
          planId, 
          monthly: monthlyVal, 
          cardBenefitPrice: benefitVal,
          accounts
        };
        products.push(newProduct);
        setProducts(products);
        alert("새 가전제품이 성공적으로 등록되었습니다.");
      }

      productFormContainer.style.display = 'none';
      productEditForm.reset();
      clearSyncUrlInputs();
      renderProductsManagement();
    });
  }

  function deleteProduct(id) {
    if (!confirm("정말 이 제품을 삭제하시겠습니까?")) return;
    
    const products = getProducts();
    const filtered = products.filter(prod => prod.id !== id);
    setProducts(filtered);
    renderProductsManagement();
    
    // Hide form if we deleted the editing product
    const editId = document.getElementById('edit-prod-id').value;
    if (editId === id) {
      productFormContainer.style.display = 'none';
      productEditForm.reset();
      clearSyncUrlInputs();
    }
  }


  /* ==========================================================================
     7. TAB: MUTUAL AID BRAND MANAGEMENT & PLANS CRUD (HQ ONLY)
     ========================================================================== */
  // --- Mutual Aid Brands (Integrated with Plans) ---
  function renderBrandsManagement() {
    renderPlansTable();
  }

  function updateModalBrandInfo() {
    const brandSelect = document.getElementById('modal-plan-brand');
    const newBrandInput = document.getElementById('modal-plan-brand-new');
    const descInput = document.getElementById('modal-plan-brand-desc');
    const feeInput = document.getElementById('modal-plan-brand-fee');
    const logoUrlInput = document.getElementById('modal-plan-brand-logo-url');
    const logoPreview = document.getElementById('modal-plan-brand-logo-preview');
    const colorInput = document.getElementById('modal-plan-brand-color');
    
    if (!brandSelect) return;
    
    const selectedId = brandSelect.value;
    
    if (selectedId === '__new__') {
      if (newBrandInput) {
        newBrandInput.style.display = 'block';
        newBrandInput.required = true;
        newBrandInput.value = '';
      }
      if (descInput) descInput.value = '';
      if (feeInput) feeInput.value = '120,000';
      if (logoUrlInput) logoUrlInput.value = '';
      if (logoPreview) logoPreview.src = 'https://placehold.co/200x80?text=No+Logo';
      if (colorInput) colorInput.value = '#0369A1';
    } else {
      if (newBrandInput) {
        newBrandInput.style.display = 'none';
        newBrandInput.required = false;
        newBrandInput.value = '';
      }
      
      const brands = getBrands() || [];
      const brand = brands.find(b => b.id === selectedId);
      if (brand) {
        if (descInput) descInput.value = brand.desc || '';
        if (feeInput) feeInput.value = brand.fee ? parseInt(brand.fee).toLocaleString() : '0';
        if (logoUrlInput) logoUrlInput.value = brand.logoImage || '';
        if (logoPreview) {
          logoPreview.src = brand.logoImage || 'https://placehold.co/200x80?text=No+Logo';
        }
        if (colorInput) colorInput.value = brand.color || '#0369A1';
      }
    }
  }

  // --- Mutual Aid Product Plans CRUD ---
  const btnAddPlanToggle = document.getElementById('btn-add-plan-toggle');
  const planModal = document.getElementById('plan-modal');
  const btnClosePlanModal = document.getElementById('plan-modal-close');
  const btnCancelPlanModal = document.getElementById('modal-plan-cancel');
  const planModalForm = document.getElementById('plan-modal-form');

  const btnAddPaymentSec = document.getElementById('btn-add-payment-section');
  const btnAddPlanCard = document.getElementById('btn-add-plan-card');
  const btnAddPlanNotice = document.getElementById('btn-add-plan-notice');
  const btnAddPlanFuneral = document.getElementById('btn-add-plan-funeral');
  const btnAddPlanConvert = document.getElementById('btn-add-plan-convert');
  const btnAddPlanMembership = document.getElementById('btn-add-plan-membership');

  function renderPlansTable() {
    const tableBody = document.getElementById('plans-table-body');
    if (!tableBody) return;

    const plans = getPlans();
    tableBody.innerHTML = '';

    if (plans.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center">등록된 상조 상품 플랜이 없습니다.</td></tr>`;
      return;
    }

    plans.forEach(p => {
      const tr = document.createElement('tr');
      
      let summary = '';
      if (p.paymentSections && p.paymentSections.length > 0) {
        summary = p.paymentSections.map(s => `${s.start}~${s.end}회: ${((s.funeralAmount || 0) + (s.applianceAmount || 0)).toLocaleString()}원`).join(' | ');
      } else {
        summary = '구간 없음';
      }

      const brandName = getBrandName(p.brandId);

      tr.innerHTML = `
        <td class="bold">${brandName}</td>
        <td>${p.name}</td>
        <td>${p.maturityRound}회</td>
        <td class="small-text text-muted">${summary}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-outline btn-xs btn-plan-edit" data-id="${p.id}">상세/수정</button>
            <button class="btn btn-cancelled btn-xs btn-plan-delete" data-id="${p.id}">삭제</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-plan-edit').addEventListener('click', () => {
        openPlanModal(p.id);
      });

      tr.querySelector('.btn-plan-delete').addEventListener('click', () => {
        deletePlan(p.id);
      });

      tableBody.appendChild(tr);
    });
  }

  // Handle plan delete
  async function deletePlan(id) {
    if (!confirm("정말 이 상품 플랜을 삭제하시겠습니까? 관련 가전제품 연동 가격도 영향이 있을 수 있습니다.")) return;
    const plans = getPlans();
    const filtered = plans.filter(p => p.id !== id);
    await setPlans(filtered);
    renderPlansTable();
    alert("성공적으로 삭제되었습니다.");
  }

  // Dynamic row builder for payment sections
  function addPaymentSectionRow(start = '', end = '', funeralAmount = '', applianceAmount = '') {
    const tbody = document.getElementById('modal-plan-payment-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'payment-section-row';

    tr.innerHTML = `
      <td><input type="number" class="sec-start" value="${start}" required min="1" style="width: 80px;"></td>
      <td><input type="number" class="sec-end" value="${end}" required min="1" style="width: 80px;"></td>
      <td><input type="text" class="sec-funeral price-input" value="${funeralAmount ? parseInt(funeralAmount).toLocaleString() : ''}" required style="width: 120px;"></td>
      <td><input type="text" class="sec-appliance price-input" value="${applianceAmount ? parseInt(applianceAmount).toLocaleString() : ''}" required style="width: 120px;"></td>
      <td>
        <button type="button" class="btn-remove-payment-section" style="position: static; margin: 0 auto; padding: 6px 12px;">삭제</button>
      </td>
    `;

    tr.querySelector('.btn-remove-payment-section').addEventListener('click', () => tr.remove());
    tbody.appendChild(tr);

    // Apply auto formatters on newly created inputs
    tr.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('input', (e) => {
        let num = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = num === '' ? '' : parseInt(num).toLocaleString('ko-KR');
      });
    });
  }

  // Dynamic row builder for card configurations
  function addPlanCardForm(card = null) {
    const container = document.getElementById('modal-plan-cards-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'plan-card-item';

    const name = card ? card.name : '';
    const image = card ? card.image : '';
    const annualFee = card ? card.annualFee : '';
    const phoneApply = card ? card.phoneApply : '';
    const onlineApplyUrl = card ? card.onlineApplyUrl : '';

    div.innerHTML = `
      <button type="button" class="btn-remove-plan-card">삭제</button>
      <div class="dynamic-card-grid" style="grid-template-columns: 1fr; margin-bottom: 8px;">
        <div class="form-group" style="margin-bottom: 8px;">
          <label>제휴 카드사/카드명 *</label>
          <input type="text" class="card-name" value="${name}" required placeholder="예) 대명아임레디 KB국민카드">
        </div>
      </div>
      <div class="dynamic-card-grid">
        <div class="form-group" style="margin-bottom: 0;">
          <label>카드 이미지 URL 또는 업로드 *</label>
          <input type="text" class="card-image-url" value="${image}" placeholder="https://... 또는 파일 업로드" required>
          <input type="file" class="card-image-file" accept="image/*" style="margin-top: 4px; font-size: 0.75rem;">
        </div>
        <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; justify-content: center;">
          <img class="card-img-preview" src="${image || 'https://placehold.co/120x80?text=Card'}" style="max-height: 60px; max-width: 100px; border-radius: 4px; border: 1px solid var(--border-color);">
        </div>
      </div>
      <div class="dynamic-card-grid">
        <div class="form-group" style="margin-bottom: 0;">
          <label>연회비 (원) *</label>
          <input type="text" class="card-fee price-input" value="${annualFee ? parseInt(annualFee).toLocaleString() : ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>전화 신청번호 *</label>
          <input type="tel" class="card-phone" value="${phoneApply}" required placeholder="0000-0000">
        </div>
      </div>
      <div class="form-group" style="margin-top: 8px; margin-bottom: 8px;">
        <label>온라인 신청 URL</label>
        <input type="url" class="card-url" value="${onlineApplyUrl}" placeholder="https://...">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label style="margin-bottom: 0; font-weight: 700;">할인 혜택 목록 (추가 추가 추가 가능)</label>
          <button type="button" class="btn btn-outline btn-xs btn-add-benefit">+ 혜택 추가</button>
        </div>
        <div class="card-benefits-editor-list">
          <!-- Dynamic benefits rows -->
        </div>
      </div>
    `;

    const fileInput = div.querySelector('.card-image-file');
    const urlInput = div.querySelector('.card-image-url');
    const previewImg = div.querySelector('.card-img-preview');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          urlInput.value = event.target.result;
          previewImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    const benefitsContainer = div.querySelector('.card-benefits-editor-list');
    const addBenefitBtn = div.querySelector('.btn-add-benefit');

    function addBenefitRow(val = '') {
      const row = document.createElement('div');
      row.className = 'benefit-editor-row';
      row.innerHTML = `
        <input type="text" class="benefit-desc" value="${val}" required placeholder="예) 전월 실적 30만원 이상 시 월 13,000원 할인" style="flex-grow: 1;">
        <button type="button" class="btn-remove-notice-line" style="position: static; padding: 4px 8px;">X</button>
      `;
      row.querySelector('.btn-remove-notice-line').addEventListener('click', () => row.remove());
      benefitsContainer.appendChild(row);
    }

    addBenefitBtn.addEventListener('click', () => addBenefitRow());

    if (card && card.benefits && card.benefits.length > 0) {
      card.benefits.forEach(b => addBenefitRow(b));
    } else {
      addBenefitRow(); // Default row
    }

    div.querySelector('.btn-remove-plan-card').addEventListener('click', () => div.remove());
    container.appendChild(div);

    // Apply auto formatter
    div.querySelector('.card-fee').addEventListener('input', (e) => {
      let num = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = num === '' ? '' : parseInt(num).toLocaleString('ko-KR');
    });
  }

  // Dynamic row builder for notices
  function addPlanNoticeRow(val = '') {
    const container = document.getElementById('modal-plan-notices-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'benefit-editor-row';
    div.innerHTML = `
      <input type="text" class="plan-notice-line" value="${val}" required placeholder="예) 만기(150회) 완납 후 100% 원금 환급 보장" style="flex-grow: 1;">
      <button type="button" class="btn-remove-notice-line" style="position: static; padding: 4px 8px;">삭제</button>
    `;

    div.querySelector('.btn-remove-notice-line').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  // Dynamic row builders for services with bullet dots
  function addPlanFuneralRow(val = '') {
    const container = document.getElementById('modal-plan-funeral-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'benefit-editor-row';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '8px';
    div.innerHTML = `
      <span style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem;">•</span>
      <input type="text" class="plan-funeral-line" value="${val}" required placeholder="예) 전문 장례지도사 24시간 긴급 출동" style="flex-grow: 1; margin-bottom: 0;">
      <button type="button" class="btn-remove-funeral-line" style="position: static; padding: 4px 8px; margin-bottom: 0; white-space: nowrap;">삭제</button>
    `;
    div.querySelector('.btn-remove-funeral-line').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  function addPlanConvertRow(val = '') {
    const container = document.getElementById('modal-plan-convert-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'benefit-editor-row';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '8px';
    div.innerHTML = `
      <span style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem;">•</span>
      <input type="text" class="plan-convert-line" value="${val}" required placeholder="예) 웨딩 서비스 / 크루즈 여행" style="flex-grow: 1; margin-bottom: 0;">
      <button type="button" class="btn-remove-convert-line" style="position: static; padding: 4px 8px; margin-bottom: 0; white-space: nowrap;">삭제</button>
    `;
    div.querySelector('.btn-remove-convert-line').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  function addPlanMembershipRow(val = '') {
    const container = document.getElementById('modal-plan-membership-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'benefit-editor-row';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '8px';
    div.innerHTML = `
      <span style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem;">•</span>
      <input type="text" class="plan-membership-line" value="${val}" required placeholder="예) 전국 리조트 및 호텔 할인 혜택" style="flex-grow: 1; margin-bottom: 0;">
      <button type="button" class="btn-remove-membership-line" style="position: static; padding: 4px 8px; margin-bottom: 0; white-space: nowrap;">삭제</button>
    `;
    div.querySelector('.btn-remove-membership-line').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  function populatePlanBrandDropdown() {
    const brandSelect = document.getElementById('modal-plan-brand');
    if (!brandSelect) return;
    brandSelect.innerHTML = '';
    const brands = getBrands() || [];
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      brandSelect.appendChild(opt);
    });
    const newOpt = document.createElement('option');
    newOpt.value = '__new__';
    newOpt.textContent = '➕ 직접 입력 (신규 등록)';
    brandSelect.appendChild(newOpt);
  }

  // Open Plan Modal
  function openPlanModal(id = null) {
    if (!planModal) return;

    const actionInput = document.getElementById('modal-plan-action');
    const idInput = document.getElementById('modal-plan-id');
    const brandInput = document.getElementById('modal-plan-brand');
    const nameInput = document.getElementById('modal-plan-name');
    const maturityInput = document.getElementById('modal-plan-maturity');
    const refundInput = document.getElementById('modal-plan-refund');
    const depositInput = document.getElementById('modal-plan-deposit');
    const newBrandInput = document.getElementById('modal-plan-brand-new');

    populatePlanBrandDropdown();
    if (newBrandInput) {
      newBrandInput.style.display = 'none';
      newBrandInput.value = '';
      newBrandInput.required = false;
    }

    const paymentBody = document.getElementById('modal-plan-payment-body');
    const cardsContainer = document.getElementById('modal-plan-cards-container');
    const noticesContainer = document.getElementById('modal-plan-notices-container');
    const titleText = document.getElementById('plan-modal-title');

    const funeralContainer = document.getElementById('modal-plan-funeral-container');
    const convertContainer = document.getElementById('modal-plan-convert-container');
    const membershipContainer = document.getElementById('modal-plan-membership-container');

    paymentBody.innerHTML = '';
    cardsContainer.innerHTML = '';
    noticesContainer.innerHTML = '';
    funeralContainer.innerHTML = '';
    convertContainer.innerHTML = '';
    membershipContainer.innerHTML = '';
    planModalForm.reset();

    // Reset brand logo inputs
    const logoUrlInput = document.getElementById('modal-plan-brand-logo-url');
    const logoFileInput = document.getElementById('modal-plan-brand-logo-file');
    const logoPreview = document.getElementById('modal-plan-brand-logo-preview');
    const colorInput = document.getElementById('modal-plan-brand-color');
    if (logoUrlInput) logoUrlInput.value = '';
    if (logoFileInput) logoFileInput.value = '';
    if (logoPreview) logoPreview.src = 'https://placehold.co/200x80?text=No+Logo';
    if (colorInput) colorInput.value = '#0369A1';

    if (id) {
      // Edit
      const plans = getPlans();
      const p = plans.find(plan => plan.id === id);
      if (!p) return;

      titleText.textContent = "상조 상품 플랜 상세 및 수정";
      actionInput.value = "edit";
      idInput.value = p.id;
      brandInput.value = p.brandId;
      nameInput.value = p.name;
      maturityInput.value = p.maturityRound;
      refundInput.value = p.refundRate;
      depositInput.value = p.depositOrg;

      updateModalBrandInfo();

      // Bind Funeral Services
      if (p.funeralService) {
        if (Array.isArray(p.funeralService)) {
          p.funeralService.forEach(val => addPlanFuneralRow(val));
        } else {
          const items = p.funeralService.split(/\r?\n|\s*\/\s*/);
          items.forEach(val => { if (val.trim()) addPlanFuneralRow(val.trim()); });
        }
      } else {
        addPlanFuneralRow('');
      }

      // Bind Convert Services
      if (p.convertService) {
        if (Array.isArray(p.convertService)) {
          p.convertService.forEach(val => addPlanConvertRow(val));
        } else {
          const items = p.convertService.split(/\r?\n|\s*\/\s*/);
          items.forEach(val => { if (val.trim()) addPlanConvertRow(val.trim()); });
        }
      } else {
        addPlanConvertRow('');
      }

      // Bind Membership Services
      if (p.membershipService) {
        if (Array.isArray(p.membershipService)) {
          p.membershipService.forEach(val => addPlanMembershipRow(val));
        } else {
          const items = p.membershipService.split(/\r?\n|\s*\/\s*/);
          items.forEach(val => { if (val.trim()) addPlanMembershipRow(val.trim()); });
        }
      } else {
        addPlanMembershipRow('');
      }

      if (p.paymentSections) {
        p.paymentSections.forEach(s => addPaymentSectionRow(s.start, s.end, s.funeralAmount, s.applianceAmount));
      }
      if (p.cards) {
        p.cards.forEach(c => addPlanCardForm(c));
      }
      if (p.notices) {
        p.notices.forEach(n => addPlanNoticeRow(n));
      }
    } else {
      // Add
      titleText.textContent = "신규 상조 상품 플랜 등록";
      actionInput.value = "add";
      idInput.value = "";
      if (brandInput.options.length > 0) {
        brandInput.selectedIndex = 0;
      }
      updateModalBrandInfo();
      
      addPlanFuneralRow('');
      addPlanConvertRow('');
      addPlanMembershipRow('');
      addPaymentSectionRow(1, 100, 20000, 22900); // Add default row
      addPlanCardForm();
      addPlanNoticeRow();
    }

    planModal.classList.add('active');
  }

  function closePlanModal() {
    if (planModal) planModal.classList.remove('active');
  }

  if (btnClosePlanModal) btnClosePlanModal.addEventListener('click', closePlanModal);
  if (btnCancelPlanModal) btnCancelPlanModal.addEventListener('click', closePlanModal);

  const planBrandSelect = document.getElementById('modal-plan-brand');
  const planBrandNewInput = document.getElementById('modal-plan-brand-new');
  if (planBrandSelect) {
    planBrandSelect.addEventListener('change', () => {
      updateModalBrandInfo();
    });
  }

  // Live previews for Logo URL and local logo file inside plan modal
  const modalPlanBrandLogoUrl = document.getElementById('modal-plan-brand-logo-url');
  const modalPlanBrandLogoPreview = document.getElementById('modal-plan-brand-logo-preview');
  if (modalPlanBrandLogoUrl && modalPlanBrandLogoPreview) {
    modalPlanBrandLogoUrl.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      modalPlanBrandLogoPreview.src = val || 'https://placehold.co/200x80?text=No+Logo';
    });
  }

  const modalPlanBrandLogoFile = document.getElementById('modal-plan-brand-logo-file');
  if (modalPlanBrandLogoFile && modalPlanBrandLogoUrl && modalPlanBrandLogoPreview) {
    modalPlanBrandLogoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          modalPlanBrandLogoUrl.value = event.target.result;
          modalPlanBrandLogoPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Preset brand color buttons interaction
  document.querySelectorAll('.btn-color-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const color = btn.getAttribute('data-color');
      const colorInput = document.getElementById('modal-plan-brand-color');
      if (colorInput) {
        colorInput.value = color;
      }
    });
  });

  const btnDeletePlanBrand = document.getElementById('btn-delete-plan-brand');
  if (btnDeletePlanBrand && planBrandSelect) {
    btnDeletePlanBrand.addEventListener('click', async () => {
      const selectedId = planBrandSelect.value;
      if (selectedId === '__new__') {
        alert('직접 입력 모드에서는 상조회사를 삭제할 수 없습니다.');
        return;
      }
      
      const brands = getBrands() || [];
      const brandToDelete = brands.find(b => b.id === selectedId);
      if (!brandToDelete) return;
      
      if (confirm(`제휴 상조회사 '${brandToDelete.name}'를 정말로 삭제하시겠습니까?\n이 상조회사와 연관된 모든 상품 플랜에 영향이 있을 수 있습니다.`)) {
        const updated = brands.filter(b => b.id !== selectedId);
        await setBrands(updated);
        populatePlanBrandDropdown();
        renderBrandsManagement();
        updateModalBrandInfo();
        alert('상조회사가 삭제되었습니다.');
      }
    });
  }

  // Close modal when clicking on backdrop overlay (Disabled per user request to prevent accidental data loss)
  /*
  if (planModal) {
    planModal.addEventListener('click', (e) => {
      if (e.target === planModal) closePlanModal();
    });
  }
  */

  if (btnAddPlanToggle) btnAddPlanToggle.addEventListener('click', () => openPlanModal());
  if (btnAddPaymentSec) btnAddPaymentSec.addEventListener('click', () => {
    // Auto-calculate start round based on last section's end round
    const sections = document.querySelectorAll('.payment-section-row');
    let startVal = 1;
    if (sections.length > 0) {
      const lastEnd = parseInt(sections[sections.length - 1].querySelector('.sec-end').value);
      if (!isNaN(lastEnd)) {
        startVal = lastEnd + 1;
      }
    }
    addPaymentSectionRow(startVal, '', '', '');
  });
  if (btnAddPlanCard) btnAddPlanCard.addEventListener('click', () => addPlanCardForm());
  if (btnAddPlanNotice) btnAddPlanNotice.addEventListener('click', () => addPlanNoticeRow());
  if (btnAddPlanFuneral) btnAddPlanFuneral.addEventListener('click', () => addPlanFuneralRow());
  if (btnAddPlanConvert) btnAddPlanConvert.addEventListener('click', () => addPlanConvertRow());
  if (btnAddPlanMembership) btnAddPlanMembership.addEventListener('click', () => addPlanMembershipRow());

  // Plan Form submit
  if (planModalForm) {
    planModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const action = document.getElementById('modal-plan-action').value;
      const id = document.getElementById('modal-plan-id').value;
      let brandId = document.getElementById('modal-plan-brand').value;
      const name = document.getElementById('modal-plan-name').value.trim();
      const maturityRound = parseInt(document.getElementById('modal-plan-maturity').value) || 0;
      const refundRate = document.getElementById('modal-plan-refund').value.trim();
      const depositOrg = document.getElementById('modal-plan-deposit').value.trim();

      // Extract brand info inputs
      const brandDescInput = document.getElementById('modal-plan-brand-desc');
      const brandFeeInput = document.getElementById('modal-plan-brand-fee');
      const brandLogoUrlInput = document.getElementById('modal-plan-brand-logo-url');
      const brandColorInput = document.getElementById('modal-plan-brand-color');

      const brandDesc = brandDescInput ? brandDescInput.value.trim() : '';
      const brandFee = brandFeeInput ? parseInt(brandFeeInput.value.replace(/[^0-9]/g, '')) || 0 : 0;
      const brandLogo = brandLogoUrlInput ? brandLogoUrlInput.value.trim() : '';
      const brandColor = brandColorInput ? brandColorInput.value.trim() : '#0369A1';

      if (!brandDesc) {
        alert('상조회사 설명을 입력해 주세요.');
        return;
      }

      const brands = getBrands() || [];

      if (brandId === '__new__') {
        const newBrandInput = document.getElementById('modal-plan-brand-new');
        const newBrandName = newBrandInput ? newBrandInput.value.trim() : '';
        if (!newBrandName) {
          alert('신규 상조회사 이름을 입력해 주세요.');
          return;
        }

        const existing = brands.find(b => b.name === newBrandName);
        if (existing) {
          brandId = existing.id;
          // Update existing brand with the new description, fee, logo, color
          const updatedBrands = brands.map(b => {
            if (b.id === brandId) {
              return {
                ...b,
                desc: brandDesc,
                fee: brandFee,
                logoImage: brandLogo || undefined,
                color: brandColor
              };
            }
            return b;
          });
          await setBrands(updatedBrands);
        } else {
          const newBrandId = 'brand_' + Date.now();
          const newBrand = {
            id: newBrandId,
            name: newBrandName,
            desc: brandDesc,
            logoText: newBrandName.substring(0, 2),
            fee: brandFee,
            logoImage: brandLogo || undefined,
            color: brandColor
          };
          brands.push(newBrand);
          await setBrands(brands);
          brandId = newBrandId;
        }
      } else {
        // Update existing brand with the new description, fee, logo, color
        const updatedBrands = brands.map(b => {
          if (b.id === brandId) {
            return {
              ...b,
              desc: brandDesc,
              fee: brandFee,
              logoImage: brandLogo || undefined,
              color: brandColor
            };
          }
          return b;
        });
        await setBrands(updatedBrands);
      }

      const funeralService = [];
      document.querySelectorAll('.plan-funeral-line').forEach(input => {
        if (input.value.trim()) funeralService.push(input.value.trim());
      });

      const convertService = [];
      document.querySelectorAll('.plan-convert-line').forEach(input => {
        if (input.value.trim()) convertService.push(input.value.trim());
      });

      const membershipService = [];
      document.querySelectorAll('.plan-membership-line').forEach(input => {
        if (input.value.trim()) membershipService.push(input.value.trim());
      });

      // Collect Payment sections
      const paymentSections = [];
      const secRows = document.querySelectorAll('.payment-section-row');
      let lastEndRound = 0;

      for (let i = 0; i < secRows.length; i++) {
        const row = secRows[i];
        const start = parseInt(row.querySelector('.sec-start').value) || 0;
        const end = parseInt(row.querySelector('.sec-end').value) || 0;
        const funeralAmount = parseInt(row.querySelector('.sec-funeral').value.replace(/[^0-9]/g, '')) || 0;
        const applianceAmount = parseInt(row.querySelector('.sec-appliance').value.replace(/[^0-9]/g, '')) || 0;

        if (end < start) {
          alert(`구간 ${i+1}의 종료회차가 시작회차보다 작습니다.`);
          return;
        }
        if (i > 0 && start !== lastEndRound + 1) {
          alert(`구간 ${i+1}의 시작회차가 이전 구간 종료회차(${lastEndRound})의 다음 회차와 연결되지 않습니다.`);
          return;
        }
        lastEndRound = end;

        paymentSections.push({ start, end, funeralAmount, applianceAmount });
      }

      if (paymentSections.length > 0 && lastEndRound !== maturityRound) {
        if (!confirm(`납입 구간의 최종 회차(${lastEndRound}회)가 상품 만기회차(${maturityRound}회)와 일치하지 않습니다. 그래도 저장하시겠습니까?`)) {
          return;
        }
      }

      // Collect Card configurations
      const cards = [];
      const cardDivs = document.querySelectorAll('.plan-card-item');
      cardDivs.forEach(div => {
        const cName = div.querySelector('.card-name').value.trim();
        const cImage = div.querySelector('.card-image-url').value.trim();
        const cFee = parseInt(div.querySelector('.card-fee').value.replace(/[^0-9]/g, '')) || 0;
        const cPhone = div.querySelector('.card-phone').value.trim();
        const cUrl = div.querySelector('.card-url').value.trim();

        const benefits = [];
        div.querySelectorAll('.benefit-desc').forEach(input => {
          if (input.value.trim()) benefits.push(input.value.trim());
        });

        cards.push({
          name: cName,
          image: cImage,
          annualFee: cFee,
          phoneApply: cPhone,
          onlineApplyUrl: cUrl,
          benefits: benefits
        });
      });

      // Collect Notices
      const notices = [];
      document.querySelectorAll('.plan-notice-line').forEach(input => {
        if (input.value.trim()) notices.push(input.value.trim());
      });

      const plans = getPlans();

      if (action === 'edit') {
        const idx = plans.findIndex(p => p.id === id);
        if (idx !== -1) {
          plans[idx] = {
            id, brandId, name, maturityRound, refundRate, depositOrg, funeralService, convertService, membershipService,
            paymentSections, cards, notices
          };
          await setPlans(plans);
          alert("상품 플랜이 성공적으로 수정되었습니다.");
        }
      } else {
        // Add
        const newPlan = {
          id: 'plan_' + Date.now(),
          brandId, name, maturityRound, refundRate, depositOrg, funeralService, convertService, membershipService,
          paymentSections, cards, notices
        };
        plans.push(newPlan);
        await setPlans(plans);
        alert("새 상품 플랜이 성공적으로 등록되었습니다.");
      }

      closePlanModal();
      renderPlansTable();
      
      // Sync plan tab navigation if products tab is active
      const activeTab = document.querySelector('.nav-item.active');
      if (activeTab && activeTab.getAttribute('data-tab') === 'products') {
        renderProductsManagement();
      }
    });
  }


  /* ==========================================================================
     8. TAB: SETTINGS & PASSWORD MODIFICATIONS (HQ & Seller)
     ========================================================================== */
  const settingsPasswordForm = document.getElementById('settings-password-form');
  const sellerInfoSettingsCard = document.getElementById('seller-info-settings-card');

  function renderSettingsTab() {
    if (userSession.role === 'Seller') {
      sellerInfoSettingsCard.style.display = 'block';
      
      document.getElementById('profile-name').textContent = userSession.name;
      document.getElementById('profile-phone').textContent = userSession.phone;
      document.getElementById('profile-subdomain').textContent = `${userSession.subdomain}.lifemoa.co.kr`;
      document.getElementById('profile-address').textContent = userSession.address;
    } else {
      sellerInfoSettingsCard.style.display = 'none';
    }
  }

  if (settingsPasswordForm) {
    settingsPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const currentPw = document.getElementById('settings-current-pw').value;
      const newPw = document.getElementById('settings-new-pw').value;
      const confirmPw = document.getElementById('settings-confirm-pw').value;

      if (newPw !== confirmPw) {
        alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      if (userSession.role === 'HQ') {
        // Change HQ PW (saved in sessionStorage/hardcoded for dashboard demo purposes)
        // Since HQ is admin/admin123, we mock change check:
        if (currentPw !== 'admin123') {
          alert("현재 비밀번호가 맞지 않습니다.");
          return;
        }
        alert("본사 관리자 비밀번호가 성공적으로 변경되었습니다. (로컬 데모 세션)");
      } else {
        // Change Seller PW in localStorage
        const sellers = getSellers();
        const idx = sellers.findIndex(s => s.username === userSession.username);
        if (idx !== -1) {
          if (sellers[idx].password !== currentPw) {
            alert("현재 비밀번호가 맞지 않습니다.");
            return;
          }
          sellers[idx].password = newPw;
          setSellers(sellers);
          alert("비밀번호가 안전하게 변경되었습니다.");
        }
      }
      settingsPasswordForm.reset();
    });
  }

  // Run auto-login check after Convex data initialized
  async function init() {
    await initData();
    userSession = JSON.parse(sessionStorage.getItem('lifemoa_logged_in'));
    if (userSession) {
      showDashboard(userSession);
    }
  }

  init();

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
    
    // Phone Format (Exclude card-phone per user request)
    if ((target.type === 'tel' || target.id?.includes('phone') || target.className?.includes('phone')) && !target.classList.contains('card-phone')) {
      const selectionStart = target.selectionStart;
      const oldLength = target.value.length;
      
      const formatted = formatPhoneNumber(target.value);
      target.value = formatted;
      
      const diff = formatted.length - oldLength;
      target.setSelectionRange(selectionStart + diff, selectionStart + diff);
    }
    
    // Price / Fee Format
    if (target.classList.contains('price-input') || target.classList.contains('table-input-fee') || target.id?.includes('price') || target.id?.includes('fee') || target.className?.includes('fee')) {
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

});
