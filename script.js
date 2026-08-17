// ضع رابط Apps Script الخاص بك هنا
const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

let customerData = {
  customerId: '',
  customerName: '',
  rating: 0,
  feedback: ''
};

// عناصر الواجهة
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepSuccess = document.getElementById('step-success');
const customerForm = document.getElementById('customer-form');
const welcomeMsg = document.getElementById('welcome-msg');
const stars = document.querySelectorAll('.star');
const submitBtn = document.getElementById('submit-btn');
const backBtn = document.getElementById('back-btn');

// الانتقال للشاشة الثانية
customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
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

// اختيار النجوم
stars.forEach(star => {
  star.addEventListener('click', () => {
    customerData.rating = parseInt(star.getAttribute('data-value'));
    updateStars(customerData.rating);
  });
});

function updateStars(rating) {
  stars.forEach(star => {
    const val = parseInt(star.getAttribute('data-value'));
    if (val <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

// إرسال البيانات إلى Google Sheets
submitBtn.addEventListener('click', async () => {
  if (customerData.rating === 0) {
    alert('يرجى اختيار التقييم (من 1 إلى 5 نجوم) قبل الإرسال.');
    return;
  }

  customerData.feedback = document.getElementById('feedback').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'جاري الإرسال...';

  try {
    // إرسال البيانات باستخدام fetch
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // يتطلبه Apps Script لتفادي مشاكل CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    // إظهار شاشة النجاح
    step2.classList.remove('active');
    stepSuccess.classList.add('active');

  } catch (error) {
    alert('حدث خطأ أثناء إرسال البيانات، يرجى المحاولة لاحقاً.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'إرسال التقييم';
  }
});
