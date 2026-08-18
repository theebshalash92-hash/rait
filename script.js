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

// --- دالة الشاشة الكاملة برمجياً ---
function enableFullScreen() {
  const docElm = document.documentElement;
  
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch(err => console.log(err));
    } else if (docElm.webkitRequestFullscreen) { /* iPad / Safari */
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) { /* IE/Edge */
      docElm.msRequestFullscreen();
    }
  }
}

// 1. تفعيل الشاشة الكاملة برمجياً عند أول لمسة/نقرة في الصفحة بعد التشغيل
window.addEventListener('click', enableFullScreen, { once: true });
window.addEventListener('touchstart', enableFullScreen, { once: true });

// 2. الانتقال للشاشة الثانية وتأكيد تفعيل الشاشة الكاملة
customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // تأكيد تفعيل الشاشة الكاملة عند فتح النموذج
  enableFullScreen();

  customerData.customerId = document.getElementById('customerId').value.trim();
  customerData.customerName = document.getElementById('customerName').value.trim();

  welcomeMsg.textContent = `أهلاً بك يا ${customerData.customerName}، يسعدنا تقييمك للخدمة:`;
  
  step1.classList.remove('active');
  step2.classList.add('active');
});

// الرجوع للشاشة الأولى
backBtn.addEventListener('click', () => {
  step2.classList.remove('active');
  step1.classList.add('active');
});

// اختيار الإيموجي
emojiOptions.forEach(option => {
  option.addEventListener('click', function() {
    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
    
    customerData.rating = parseInt(this.getAttribute('data-value'));
    customerData.ratingText = this.getAttribute('data-text');
  });
});

// إرسال البيانات إلى Google Sheets
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
