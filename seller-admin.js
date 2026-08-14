import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

document.addEventListener('DOMContentLoaded', async () => {
  /* ==========================================================================
     1. Convex Client & Data State
     ========================================================================== */
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  let convex = null;
  if (convexUrl) {
    try {
      convex = new ConvexClient(convexUrl);
    } catch (e) {
      console.warn("Failed to initialize Convex Client:", e);
    }
  }

  let SELLER_DATA = [];
  let CONSULTATION_DATA = [];
  let SETTLEMENT_DATA = [];
  let BRAND_DATA = [];
  let currentSeller = null;

  // DOM Elements
  const loginWrapper = document.getElementById('seller-login-wrapper');
  const workspace = document.getElementById('seller-workspace');
  const loginForm = document.getElementById('seller-login-form');
  const loginUsernameInput = document.getElementById('seller-login-username');
  const loginPasswordInput = document.getElementById('seller-login-password');
  const btnLogout = document.getElementById('btn-seller-logout');

  // Topbar & Sidebar Elements
  const topbarLandingLink = document.getElementById('topbar-seller-landing-link');
  const btnCopyTopbarLanding = document.getElementById('btn-copy-topbar-landing');
  const bannerSellerUrl = document.getElementById('banner-seller-url');
  const bannerBtnOpenLanding = document.getElementById('banner-btn-open-landing');
  const bannerBtnCopyUrl = document.getElementById('banner-btn-copy-url');
  const sidebarSellerName = document.getElementById('sidebar-seller-name');
  const sidebarSellerSub = document.getElementById('sidebar-seller-sub');
  const sellerAvatarLetter = document.getElementById('seller-avatar-letter');
  const currentDateText = document.getElementById('seller-current-date');

  // Customer Modal Elements
  const customerModal = document.getElementById('seller-customer-modal');
  const btnCloseCustomerModal = document.getElementById('seller-customer-modal-close');
  const btnCancelCustomerModal = document.getElementById('modal-consult-cancel');
  const customerModalForm = document.getElementById('seller-customer-modal-form');

  /* ==========================================================================
     2. Date Formatting Helper
     ========================================================================== */
  function updateCurrentDate() {
    if (!currentDateText) return;
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const formatted = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 (${days[now.getDay()]})`;
    currentDateText.textContent = formatted;
  }
  updateCurrentDate();

  /* ==========================================================================
     3. Data Loading Functions
     ========================================================================== */
  async function loadData() {
    try {
      if (convex) {
        const [sellers, consults, settlements, brands] = await Promise.all([
          convex.query(api.sellers.get).catch(() => []),
          convex.query(api.consultations.get).catch(() => []),
          convex.query(api.settlements.get).catch(() => []),
          convex.query(api.brands.get).catch(() => [])
        ]);

        SELLER_DATA = sellers || [];
        CONSULTATION_DATA = consults || [];
        SETTLEMENT_DATA = settlements || [];
        BRAND_DATA = brands || [];

        // Save local backup cache
        localStorage.setItem('lifemoa_sellers', JSON.stringify(SELLER_DATA));
        localStorage.setItem('lifemoa_consultations', JSON.stringify(CONSULTATION_DATA));
        localStorage.setItem('lifemoa_settlements', JSON.stringify(SETTLEMENT_DATA));
        localStorage.setItem('lifemoa_brands', JSON.stringify(BRAND_DATA));
      } else {
        throw new Error("No Convex Client");
      }
    } catch (e) {
      console.warn("Loading data from LocalStorage fallback:", e);
      SELLER_DATA = JSON.parse(localStorage.getItem('lifemoa_sellers') || '[]');
      CONSULTATION_DATA = JSON.parse(localStorage.getItem('lifemoa_consultations') || '[]');
      SETTLEMENT_DATA = JSON.parse(localStorage.getItem('lifemoa_settlements') || '[]');
      BRAND_DATA = JSON.parse(localStorage.getItem('lifemoa_brands') || '[]');
    }
  }

  /* ==========================================================================
     4. Seller Landing Page URL Generator (/아이디 형태)
     ========================================================================== */
  function getSellerLandingUrl(seller) {
    if (!seller) return window.location.origin;
    const identifier = seller.username || seller.id;
    return `${window.location.origin}/${encodeURIComponent(identifier)}`;
  }

  function setupLandingLinks() {
    if (!currentSeller) return;
    const landingUrl = getSellerLandingUrl(currentSeller);

    if (topbarLandingLink) topbarLandingLink.href = landingUrl;
    if (bannerBtnOpenLanding) bannerBtnOpenLanding.href = landingUrl;
    if (bannerSellerUrl) bannerSellerUrl.textContent = landingUrl;

    const handleCopy = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(landingUrl).then(() => {
        alert(`셀러 전용 랜딩페이지 URL이 클립보드에 복사되었습니다!\n\n${landingUrl}`);
      }).catch(() => {
        prompt("아래 URL을 복사하세요:", landingUrl);
      });
    };

    if (btnCopyTopbarLanding) btnCopyTopbarLanding.onclick = handleCopy;
    if (bannerBtnCopyUrl) bannerBtnCopyUrl.onclick = handleCopy;
  }

  /* ==========================================================================
     5. Authentication & Direct Access Logic
     ========================================================================== */
  function checkSession() {
    const saved = sessionStorage.getItem('lifemoa_seller_session');
    if (saved) {
      try {
        currentSeller = JSON.parse(saved);
        showWorkspace();
        return true;
      } catch (e) {}
    }
    return false;
  }

  function showWorkspace() {
    if (!currentSeller) return;
    if (loginWrapper) loginWrapper.style.display = 'none';
    if (workspace) workspace.style.display = 'flex';

    // Update Profile Header
    if (sidebarSellerName) sidebarSellerName.textContent = `${currentSeller.name} 셀러`;
    if (sidebarSellerSub) sidebarSellerSub.textContent = `아이디: ${currentSeller.username}`;
    if (sellerAvatarLetter) sellerAvatarLetter.textContent = (currentSeller.name || 'S').charAt(0);

    setupLandingLinks();
    renderAllViews();
  }

  function showLogin() {
    currentSeller = null;
    sessionStorage.removeItem('lifemoa_seller_session');
    if (workspace) workspace.style.display = 'none';
    if (loginWrapper) loginWrapper.style.display = 'flex';
  }

  // Handle URL shortcut login from HQ Admin (e.g. ?seller=chulsoo&token=...)
  async function handleAutoLoginFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sellerParam = params.get('seller');
    const tokenParam = params.get('token');

    if (sellerParam) {
      await loadData();
      const targetSeller = SELLER_DATA.find(s => s.username === sellerParam || s.id === sellerParam || s.subdomain === sellerParam);
      
      if (targetSeller) {
        if (tokenParam) {
          try {
            const decoded = atob(tokenParam);
            const [u, p] = decoded.split(':');
            if (u === targetSeller.username && p === targetSeller.password) {
              currentSeller = targetSeller;
              sessionStorage.setItem('lifemoa_seller_session', JSON.stringify(targetSeller));
              showWorkspace();
              return;
            }
          } catch (e) {}
        }

        // Fill username in login form for convenience
        if (loginUsernameInput) loginUsernameInput.value = targetSeller.username;
        if (loginPasswordInput) loginPasswordInput.focus();
      }
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginUsernameInput.value.trim();
      const password = loginPasswordInput.value.trim();

      await loadData();
      const seller = SELLER_DATA.find(s => s.username === username && s.password === password);

      if (!seller) {
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (seller.status === '보류') {
        alert("현재 본사 가입 승인 대기 중인 계정입니다.\n본사 관리자의 승인 후 로그인이 가능합니다.");
        return;
      }

      if (seller.status === '취소') {
        alert("활동이 비활성화되거나 취소된 계정입니다.\n본사 고객센터로 문의해주세요.");
        return;
      }

      currentSeller = seller;
      sessionStorage.setItem('lifemoa_seller_session', JSON.stringify(seller));
      showWorkspace();
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm("셀러 관리자에서 로그아웃하시겠습니까?")) {
        showLogin();
      }
    });
  }

  /* ==========================================================================
     6. View Rendering Functions
     ========================================================================== */
  function getMyConsultations() {
    if (!currentSeller) return [];
    const myId = currentSeller.username;
    const mySubdomain = currentSeller.subdomain;
    return CONSULTATION_DATA.filter(c => c.sellerId === myId || c.sellerId === mySubdomain || c.sellerId === currentSeller.id);
  }

  function getMySettlements() {
    if (!currentSeller) return [];
    const myId = currentSeller.username;
    const mySubdomain = currentSeller.subdomain;
    return SETTLEMENT_DATA.filter(s => s.sellerId === myId || s.sellerId === mySubdomain || s.sellerId === currentSeller.id);
  }

  function renderAllViews() {
    renderDashboard();
    renderCustomersTable();
    renderSettlementsTable();
    renderProfileView();
  }

  // [View 1] Dashboard
  function renderDashboard() {
    const consults = getMyConsultations();
    const settlements = getMySettlements();

    const totalCount = consults.length;
    const progressCount = consults.filter(c => c.status === '상담 진행중' || c.status === '신규 접수').length;
    const completedCount = consults.filter(c => c.status === '계약 완료').length;

    const totalCommission = settlements.reduce((sum, s) => sum + (Number(s.commission) || 0), 0);

    const elTotal = document.getElementById('stat-total-consults');
    const elProgress = document.getElementById('stat-progress-consults');
    const elCompleted = document.getElementById('stat-completed-consults');
    const elComm = document.getElementById('stat-total-commission');

    if (elTotal) elTotal.textContent = `${totalCount}건`;
    if (elProgress) elProgress.textContent = `${progressCount}건`;
    if (elCompleted) elCompleted.textContent = `${completedCount}건`;
    if (elComm) elComm.textContent = `${totalCommission.toLocaleString('ko-KR')}원`;

    // Recent 5 inquiries
    const recentBody = document.getElementById('seller-recent-customers-body');
    if (recentBody) {
      const recent = [...consults].sort((a, b) => new Date(b.registerDate || 0) - new Date(a.registerDate || 0)).slice(0, 5);
      if (recent.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 30px;">아직 접수된 고객 상담이 없습니다. 전용 랜딩 URL을 홍보해보세요!</td></tr>`;
      } else {
        recentBody.innerHTML = recent.map(c => {
          const dateStr = c.registerDate ? new Date(c.registerDate).toLocaleDateString('ko-KR') : '-';
          let badgeClass = 'badge-pending';
          if (c.status === '계약 완료') badgeClass = 'badge-approved';
          else if (c.status === '상담 진행중') badgeClass = 'badge-active';
          else if (c.status === '부재/취소') badgeClass = 'badge-cancelled';

          return `
            <tr>
              <td style="font-weight: 700;">${c.name || '-'}</td>
              <td>${c.phone || '-'}</td>
              <td>${c.hopeItem || '-'}</td>
              <td>${c.hopeBrand || '-'}</td>
              <td style="color: var(--text-muted); font-size: 0.85rem;">${dateStr}</td>
              <td><span class="badge ${badgeClass}">${c.status || '신규 접수'}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // [View 2] Customer Consultation Table
  function renderCustomersTable() {
    const tbody = document.getElementById('seller-customers-table-body');
    if (!tbody) return;

    let list = getMyConsultations();
    const searchVal = document.getElementById('seller-customer-search')?.value.trim().toLowerCase() || '';
    const statusVal = document.getElementById('seller-customer-status-filter')?.value || '';

    if (searchVal) {
      list = list.filter(c => 
        (c.name && c.name.toLowerCase().includes(searchVal)) ||
        (c.phone && c.phone.includes(searchVal)) ||
        (c.hopeItem && c.hopeItem.toLowerCase().includes(searchVal)) ||
        (c.hopeBrand && c.hopeBrand.toLowerCase().includes(searchVal))
      );
    }

    if (statusVal) {
      list = list.filter(c => c.status === statusVal);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.registerDate || 0) - new Date(a.registerDate || 0));

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">조회된 고객 상담 내역이 없습니다.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => {
      const dateStr = c.registerDate ? new Date(c.registerDate).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
      let badgeClass = 'badge-pending';
      if (c.status === '계약 완료') badgeClass = 'badge-approved';
      else if (c.status === '상담 진행중') badgeClass = 'badge-active';
      else if (c.status === '부재/취소') badgeClass = 'badge-cancelled';

      return `
        <tr>
          <td style="font-weight: 700; color: var(--primary-color);">${c.name || '-'}</td>
          <td style="font-family: monospace;">${c.phone || '-'}</td>
          <td><span style="font-weight: 600;">${c.hopeItem || '-'}</span></td>
          <td>${c.hopeBrand || '-'}</td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${c.budget || '-'} / ${c.consultTime || '-'}</td>
          <td style="font-size: 0.82rem; color: var(--text-muted);">${dateStr}</td>
          <td><span class="badge ${badgeClass}">${c.status || '신규 접수'}</span></td>
          <td>
            <button type="button" class="btn btn-outline btn-sm btn-open-consult" data-id="${c.id}" style="padding: 6px 12px; font-size: 0.82rem;">
              상세 / 메모
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click events
    tbody.querySelectorAll('.btn-open-consult').forEach(btn => {
      btn.addEventListener('click', () => {
        openCustomerModal(btn.getAttribute('data-id'));
      });
    });
  }

  // [View 3] Settlements Table
  function renderSettlementsTable() {
    const tbody = document.getElementById('seller-settlements-table-body');
    if (!tbody) return;

    let list = getMySettlements();
    const filterVal = document.getElementById('seller-settlement-filter')?.value || '';

    const totalAmt = list.reduce((sum, s) => sum + (Number(s.commission) || 0), 0);
    const pendingAmt = list.filter(s => s.status === '미정산').reduce((sum, s) => sum + (Number(s.commission) || 0), 0);
    const paidAmt = list.filter(s => s.status === '지급완료').reduce((sum, s) => sum + (Number(s.commission) || 0), 0);

    const elTotal = document.getElementById('settlement-stat-total');
    const elPending = document.getElementById('settlement-stat-pending');
    const elPaid = document.getElementById('settlement-stat-paid');

    if (elTotal) elTotal.textContent = `${totalAmt.toLocaleString('ko-KR')}원`;
    if (elPending) elPending.textContent = `${pendingAmt.toLocaleString('ko-KR')}원`;
    if (elPaid) elPaid.textContent = `${paidAmt.toLocaleString('ko-KR')}원`;

    if (filterVal) {
      list = list.filter(s => s.status === filterVal);
    }

    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">정산 내역이 없습니다. (상담 건이 '계약 완료'되면 자동 생성됩니다)</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => {
      const dateStr = s.date ? new Date(s.date).toLocaleDateString('ko-KR') : '-';
      const isPaid = s.status === '지급완료';
      const badgeClass = isPaid ? 'badge-approved' : 'badge-pending';
      const statusText = isPaid ? '지급 완료' : '정산 대기 (미지급)';

      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted);">${s.id || s.orderId || '-'}</td>
          <td style="font-weight: 700;">${s.customerName || '-'}</td>
          <td>${s.productName || '-'}</td>
          <td>${s.brandName || '-'}</td>
          <td style="font-weight: 800; color: var(--accent-color); font-size: 1.05rem;">
            ${(Number(s.commission) || 0).toLocaleString('ko-KR')}원
          </td>
          <td><span class="badge ${badgeClass}">${statusText}</span></td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${dateStr}</td>
        </tr>
      `;
    }).join('');
  }

  // [View 4] Seller Profile in Settings
  function renderProfileView() {
    if (!currentSeller) return;
    const nameEl = document.getElementById('profile-seller-name');
    const userEl = document.getElementById('profile-seller-username');
    const phoneEl = document.getElementById('profile-seller-phone');
    const addrEl = document.getElementById('profile-seller-address');

    if (nameEl) nameEl.textContent = currentSeller.name || '-';
    if (userEl) userEl.textContent = currentSeller.username || '-';
    if (phoneEl) phoneEl.textContent = currentSeller.phone || '-';
    if (addrEl) addrEl.textContent = currentSeller.address || '-';
  }

  /* ==========================================================================
     7. Customer Consultation Modal Logic (Seller Edit Memo / Status)
     ========================================================================== */
  function openCustomerModal(id) {
    const consult = CONSULTATION_DATA.find(c => c.id === id);
    if (!consult || !customerModal) return;

    document.getElementById('modal-consult-id').value = consult.id;
    document.getElementById('modal-consult-name').value = consult.name || '';
    document.getElementById('modal-consult-phone').value = consult.phone || '';
    document.getElementById('modal-consult-item').value = consult.hopeItem || '';
    document.getElementById('modal-consult-brand').value = consult.hopeBrand || '';
    document.getElementById('modal-consult-purpose').value = consult.purpose || '';
    document.getElementById('modal-consult-budget-time').value = `${consult.budget || '-'} / ${consult.consultTime || '-'}`;
    document.getElementById('modal-consult-date').value = consult.registerDate ? new Date(consult.registerDate).toLocaleString('ko-KR') : '';
    document.getElementById('modal-consult-status').value = consult.status || '신규 접수';
    document.getElementById('modal-consult-memo').value = consult.userMessage || '';

    customerModal.classList.add('active');
  }

  function closeCustomerModal() {
    if (customerModal) customerModal.classList.remove('active');
  }

  if (btnCloseCustomerModal) btnCloseCustomerModal.addEventListener('click', closeCustomerModal);
  if (btnCancelCustomerModal) btnCancelCustomerModal.addEventListener('click', closeCustomerModal);

  if (customerModalForm) {
    customerModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-consult-id').value;
      const newStatus = document.getElementById('modal-consult-status').value;
      const newMemo = document.getElementById('modal-consult-memo').value.trim();

      const consultIndex = CONSULTATION_DATA.findIndex(c => c.id === id);
      if (consultIndex === -1) return;

      const oldStatus = CONSULTATION_DATA[consultIndex].status;
      CONSULTATION_DATA[consultIndex].status = newStatus;
      CONSULTATION_DATA[consultIndex].userMessage = newMemo;

      // Update in Convex backend
      if (convex) {
        try {
          await convex.mutation(api.consultations.update, {
            id: id,
            status: newStatus,
            sellerId: currentSeller.username
          });
        } catch (err) {
          console.warn("Convex consult update error:", err);
        }
      }

      // Auto-generate commission settlement if status changed to '계약 완료'
      if (newStatus === '계약 완료' && oldStatus !== '계약 완료') {
        const consult = CONSULTATION_DATA[consultIndex];
        const alreadyExists = SETTLEMENT_DATA.some(s => s.orderId === consult.id);
        if (!alreadyExists) {
          const brandObj = BRAND_DATA.find(b => b.name === consult.hopeBrand || b.id === consult.hopeBrand);
          const commissionAmount = brandObj && brandObj.fee ? Number(brandObj.fee) : 100000;
          
          const newSettlement = {
            id: `set_${Date.now()}`,
            orderId: consult.id,
            sellerId: currentSeller.username,
            customerName: consult.name,
            productName: consult.hopeItem || '결합 가전',
            brandId: brandObj ? brandObj.id : 'daemyung',
            brandName: consult.hopeBrand || '상조 결합',
            commission: commissionAmount,
            status: '미정산',
            date: new Date().toISOString()
          };

          SETTLEMENT_DATA.unshift(newSettlement);
          localStorage.setItem('lifemoa_settlements', JSON.stringify(SETTLEMENT_DATA));

          if (convex) {
            try {
              await convex.mutation(api.settlements.add, newSettlement);
            } catch (err) {
              console.warn("Convex settlement add error:", err);
            }
          }
        }
      }

      localStorage.setItem('lifemoa_consultations', JSON.stringify(CONSULTATION_DATA));
      closeCustomerModal();
      alert("상담 정보 및 메모가 성공적으로 저장되었습니다.");
      renderAllViews();
    });
  }

  /* ==========================================================================
     8. Password Change Handler
     ========================================================================== */
  const passwordForm = document.getElementById('seller-password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPw = document.getElementById('seller-current-pw').value;
      const newPw = document.getElementById('seller-new-pw').value;
      const confirmPw = document.getElementById('seller-new-pw-confirm').value;

      if (currentPw !== currentSeller.password) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (newPw.length < 4) {
        alert("새 비밀번호는 최소 4자리 이상 입력해주세요.");
        return;
      }

      if (newPw !== confirmPw) {
        alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      currentSeller.password = newPw;
      sessionStorage.setItem('lifemoa_seller_session', JSON.stringify(currentSeller));

      // Update in seller array
      const sIdx = SELLER_DATA.findIndex(s => s.id === currentSeller.id || s.username === currentSeller.username);
      if (sIdx !== -1) {
        SELLER_DATA[sIdx].password = newPw;
        localStorage.setItem('lifemoa_sellers', JSON.stringify(SELLER_DATA));
      }

      if (convex) {
        try {
          await convex.mutation(api.sellers.update, {
            id: currentSeller.id,
            password: newPw
          });
        } catch (err) {
          console.warn("Convex password update error:", err);
        }
      }

      alert("비밀번호가 안전하게 변경되었습니다.");
      passwordForm.reset();
    });
  }

  /* ==========================================================================
     9. Navigation & Search Listeners
     ========================================================================== */
  // Tab Navigation
  const navItems = document.querySelectorAll('#seller-sidebar-menu .nav-item');
  const panels = document.querySelectorAll('.tab-panel');
  const panelTitle = document.getElementById('seller-panel-title');

  const titleMap = {
    'seller-dashboard': '실적 대시보드',
    'seller-customers': '내 유치고객 상담관리',
    'seller-settlements': '수수료 정산 내역',
    'seller-settings': '계정 및 랜딩 설정'
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab');
      navItems.forEach(n => n.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPanel = document.getElementById(`panel-${tab}`);
      if (targetPanel) targetPanel.classList.add('active');
      if (panelTitle) panelTitle.textContent = titleMap[tab] || '셀러 어드민';
    });
  });

  // Shortcut from dashboard to customers tab
  const btnGotoAll = document.getElementById('btn-goto-all-customers');
  if (btnGotoAll) {
    btnGotoAll.addEventListener('click', () => {
      const custNav = document.querySelector('[data-tab="seller-customers"]');
      if (custNav) custNav.click();
    });
  }

  // Filter & Search Event Listeners
  document.getElementById('seller-customer-search')?.addEventListener('input', renderCustomersTable);
  document.getElementById('seller-customer-status-filter')?.addEventListener('change', renderCustomersTable);
  document.getElementById('seller-settlement-filter')?.addEventListener('change', renderSettlementsTable);

  /* ==========================================================================
     10. Bootstrap App
     ========================================================================== */
  await loadData();
  const hasSession = checkSession();
  if (!hasSession) {
    await handleAutoLoginFromUrl();
  }
});
