const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxKnKVxp1VjPV4HnqPTVrd9zDC7Y5nrt0P2YQvx34CaDPF5embxzd5OE97fEon2LfKM/exec";

let currentLang = 'ar';

// القاموس للغتين
const i18n = {
  ar: {
    step1_title: "مرحباً بك!",
    step1_subtitle: "أدخل بيانات الفاتورة لتسجيل نقاط الولاء ومتابعة التقييم",
    label_phone: "رقم الهاتف:",
    ph_phone: "079XXXXXXX",
    label_name: "اسم العميل:",
    ph_name: "أدخل اسمك الكريم",
    label_invoice_no: "رقم الفاتورة:",
    ph_invoice_no: "رقم الفاتورة",
    label_invoice_amount: "قيمة الفاتورة (بالدينار):",
    ph_invoice_amount: "مثال: 15.50",
    btn_next: "التالي",
    step2_title: "كيف كانت تجربتك اليوم؟",
    welcome_prefix: "أهلاً بك يا ",
    welcome_suffix: "، يسعدنا تقييمك للخدمة:",
    emoji_great: "راضي جداً",
    emoji_good: "راضي",
    emoji_bad: "سيئ",
    label_feedback: "ملاحظاتك (اختياري):",
    ph_feedback: "أخبرنا بالمزيد عن تجربتك...",
    btn_back: "السابق",
    btn_submit: "إرسال التقييم",
    success_title: "شكراً لك!",
    success_msg: "تم استلام تقييمك وتسجيل نقاط الفاتورة بنجاح.",
    badge_points_suffix: " نقطة ولاء",
    badge_invoice_prefix: "فاتورة رقم ",
    badge_invoice_mid: " بقيمة ",
    badge_invoice_suffix: " دينار",
    btn_new_rating: "تقييم جديد",
    alert_rating: "يرجى اختيار مستوى التقييم قبل الإرسال."
  },
  en: {
    step1_title: "Welcome!",
    step1_subtitle: "Enter invoice details to claim loyalty points and rate us",
    label_phone: "Phone Number:",
    ph_phone: "079XXXXXXX",
    label_name: "Customer Name:",
    ph_name: "Enter your full name",
    label_invoice_no: "Invoice Number:",
    ph_invoice_no: "Invoice No.",
    label_invoice_amount: "Invoice Amount (JOD):",
    ph_invoice_amount: "e.g. 15.50",
    btn_next: "Next",
    step2_title: "How was your experience today?",
    welcome_prefix: "Welcome ",
    welcome_suffix: ", we value your feedback:",
    emoji_great: "Very Satisfied",
    emoji_good: "Satisfied",
    emoji_bad: "Bad",
    label_feedback: "Notes (Optional):",
    ph_feedback: "Tell us more about your experience...",
    btn_back: "Back",
    btn_submit: "Submit Rating",
    success_title: "Thank You!",
    success_msg: "Your rating & loyalty points have been saved successfully.",
    badge_points_suffix: " Loyalty Points",
    badge_invoice_prefix: "Invoice #",
    badge_invoice_mid: " Amount: ",
    badge_invoice_suffix: " JOD",
    btn_new_rating: "New Rating",
    alert_rating: "Please select a rating level before submitting."
  }
};

let customerData = {
  customerId: '',
  customerName: '',
  invoiceNo: '',
  invoiceAmount: 0,
  earnedPoints: 0,
  rating: 0,
  ratingText: '',
  feedback: '',
  lang: 'ar'
};

let autoResetTimer = null;

const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepSuccess = document.getElementById('step-success');
const customerForm = document.getElementById('customer-form');
const welcomeMsg = document.getElementById('welcome-msg');
const emojiOptions = document.querySelectorAll('.emoji-option');
const submitBtn = document.getElementById('submit-btn');
const backBtn = document.getElementById('back-btn');
const langBtn = document.getElementById('lang-btn');

// --- 1. تبديل اللغة والاتجاه ---
langBtn.addEventListener('click', () => {
  currentLang = (currentLang === 'ar') ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = (currentLang === 'ar') ? 'rtl' : 'ltr';
  langBtn.textContent = (currentLang === 'ar') ? 'English' : 'عربي';
  
  updateLanguageUI();
});

function updateLanguageUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      el.textContent = i18n[currentLang][key];
    }
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (i18n[currentLang][key]) {
      el.placeholder = i18n[currentLang][key];
    }
  });
}

// --- 2. منع خمول الشاشة ---
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {}
}

function initAppMode() {
  requestWakeLock();
  const docElm = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (docElm.requestFullscreen) docElm.requestFullscreen().catch(() => {});
    else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
  }
}

window.addEventListener('click', initAppMode, { once: true });
window.addEventListener('touchstart', initAppMode, { once: true });

// --- 3. التنقل بالنموذج ---
customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  initAppMode();

  customerData.customerId = document.getElementById('customerId').value.trim();
  customerData.customerName = document.getElementById('customerName').value.trim();
  customerData.invoiceNo = document.getElementById('invoiceNo').value.trim();
  
  const amount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
  customerData.invoiceAmount = amount;
  customerData.earnedPoints = Math.floor(amount);
  customerData.lang = currentLang;

  welcomeMsg.textContent = `${i18n[currentLang].welcome_prefix}${customerData.customerName}${i18n[currentLang].welcome_suffix}`;
  
  step1.classList.remove('active');
  step2.classList.add('active');
});

backBtn.addEventListener('click', () => {
  step2.classList.remove('active');
  step1.classList.add('active');
});

emojiOptions.forEach(option => {
  option.addEventListener('click', function() {
    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
    
    customerData.rating = parseInt(this.getAttribute('data-value'));
    customerData.ratingText = (currentLang === 'ar') 
      ? this.getAttribute('data-text-ar') 
      : this.getAttribute('data-text-en');
  });
});

// --- 4. الإرسال الفوري ---
submitBtn.addEventListener('click', () => {
  if (customerData.rating === 0) {
    alert(i18n[currentLang].alert_rating);
    return;
  }

  customerData.feedback = document.getElementById('feedback').value.trim();

  fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(customerData)
  }).catch(err => console.error('Background send error:', err));

  // تحديث نص الشارة ببيانات اللغة الحالية
  document.getElementById('earned-points-display').textContent = `+${customerData.earnedPoints}${i18n[currentLang].badge_points_suffix}`;
  document.getElementById('invoice-summary-display').textContent = `${i18n[currentLang].badge_invoice_prefix}${customerData.invoiceNo}${i18n[currentLang].badge_invoice_mid}${customerData.invoiceAmount}${i18n[currentLang].badge_invoice_suffix}`;

  step2.classList.remove('active');
  stepSuccess.classList.add('active');

  if (autoResetTimer) clearTimeout(autoResetTimer);
  autoResetTimer = setTimeout(() => { resetApp(); }, 4500);
});

function resetApp() {
  if (autoResetTimer) clearTimeout(autoResetTimer);
  
  customerData = { customerId: '', customerName: '', invoiceNo: '', invoiceAmount: 0, earnedPoints: 0, rating: 0, ratingText: '', feedback: '', lang: currentLang };
  
  customerForm.reset();
  document.getElementById('feedback').value = '';
  emojiOptions.forEach(opt => opt.classList.remove('selected'));

  stepSuccess.classList.remove('active');
  step2.classList.remove('active');
  step1.classList.add('active');
}
