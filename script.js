const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxKnKVxp1VjPV4HnqPTVrd9zDC7Y5nrt0P2YQvx34CaDPF5embxzd5OE97fEon2LfKM/exec";

let customerData = {
  customerId: '',
  customerName: '',
  rating: 0,
  ratingText: '',
  feedback: ''
};

// عناصر الواجهة
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepSuccess = document.getElementById('step-success');
const customerForm = document.getElementById('customer-form');
const welcomeMsg = document.getElementById('welcome-msg');
const emojiOptions = document.querySelectorAll('.emoji-option');
const submitBtn = document.getElementById('submit-btn');
const backBtn = document.getElementById('back-btn');

// --- 1. منع إغلاق شاشة التابلت تلقائياً (Screen Wake Lock) ---
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {
    console.log(`Wake Lock Error: ${err.message}`);
  }
}

// إعادة القفل إذا تم التبديل ورجع العميل للتابلت
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

// تفعيل وضع الكشك والتطبيق الكامل عند أول لمسة
function initAppMode() {
  requestWakeLock();
  
  const docElm = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch(() => {});
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    }
  }
}

window.addEventListener('click', initAppMode, { once: true });
window.addEventListener('touchstart', initAppMode, { once: true });

// --- 2. إدارة خطوات التقييم ---
customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  initAppMode();

  customerData.customerId = document.getElementById('customerId').value.trim();
  customerData.customerName = document.getElementById('customerName').value.trim();

  welcomeMsg.textContent = `أهلاً بك يا ${customerData.customerName}، يسعدنا تقييمك للخدمة:`;
  
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
    customerData.ratingText = this.getAttribute('data-text');
  });
});

submitBtn.addEventListener('click', async () => {
  if (customerData.rating === 0) {
    alert('يرجى اختيار مستوى التقييم قبل الإرسال.');
    return;
  }

  customerData.feedback = document.getElementById('feedback').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'جاري الإرسال...';

  const payload = {
    customerId: customerData.customerId,
    customerName: customerData.customerName,
    rating: customerData.ratingText,
    feedback: customerData.feedback
  };

  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    step2.classList.remove('active');
    stepSuccess.classList.add('active');

  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ أثناء إرسال البيانات، يرجى المحاولة لاحقاً.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'إرسال التقييم';
  }
});
