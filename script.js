const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxKnKVxp1VjPV4HnqPTVrd9zDC7Y5nrt0P2YQvx34CaDPF5embxzd5OE97fEon2LfKM/exec";

let customerData = {
  customerId: '',
  customerName: '',
  rating: 0,
  ratingText: '',
  feedback: ''
};

let autoResetTimer = null;

// عناصر الواجهة
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepSuccess = document.getElementById('step-success');
const customerForm = document.getElementById('customer-form');
const welcomeMsg = document.getElementById('welcome-msg');
const emojiOptions = document.querySelectorAll('.emoji-option');
const submitBtn = document.getElementById('submit-btn');
const backBtn = document.getElementById('back-btn');

// --- 1. منع خمول الشاشة برمجياً ---
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

document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

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

// --- 2. التحكم بالواجهة ---
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

// --- 3. الإرسال السريع وتصفير الشاشة ---
submitBtn.addEventListener('click', () => {
  if (customerData.rating === 0) {
    alert('يرجى اختيار مستوى التقييم قبل الإرسال.');
    return;
  }

  customerData.feedback = document.getElementById('feedback').value.trim();

  const payload = {
    customerId: customerData.customerId,
    customerName: customerData.customerName,
    rating: customerData.ratingText,
    feedback: customerData.feedback
  };

  fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Background send error:', err));

  step2.classList.remove('active');
  stepSuccess.classList.add('active');

  if (autoResetTimer) clearTimeout(autoResetTimer);
  autoResetTimer = setTimeout(() => {
    resetApp();
  }, 4000);
});

function resetApp() {
  if (autoResetTimer) clearTimeout(autoResetTimer);
  
  customerData = { customerId: '', customerName: '', rating: 0, ratingText: '', feedback: '' };
  customerForm.reset();
  document.getElementById('feedback').value = '';
  emojiOptions.forEach(opt => opt.classList.remove('selected'));
  
  submitBtn.disabled = false;
  submitBtn.textContent = 'إرسال التقييم';

  stepSuccess.classList.remove('active');
  step2.classList.remove('active');
  step1.classList.add('active');
}
