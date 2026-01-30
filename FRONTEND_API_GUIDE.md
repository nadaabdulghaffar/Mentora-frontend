# 📚 دليل هيكل المشروع - Frontend API Integration

## 📁 هيكل الملفات

```
mentora-frontend/
├── .env                          # إعدادات البيئة
├── .env.example                  # مثال لإعدادات البيئة
├── src/
│   ├── config/
│   │   └── api.ts               # ⚙️ إعدادات Axios الأساسية
│   ├── types/
│   │   └── api.ts               # 📝 أنواع البيانات المشتركة
│   ├── services/
│   │   ├── authService.ts       # 🔐 خدمات المصادقة
│   │   └── lookupService.ts     # 📋 خدمات البيانات الثابتة
│   └── examples/
│       └── ApiUsageExample.tsx  # 💡 أمثلة الاستخدام
```

## 🚀 البداية السريعة

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد ملف البيئة
```bash
cp .env.example .env
```

عدّل الـ `.env` وضع رابط الباك إند:
```env
VITE_API_URL=https://localhost:7018/api
```

### 3. استخدام الخدمات

#### 📌 مثال بسيط - تسجيل الدخول
```typescript
import authAPI from './services/authService';

const login = async () => {
  try {
    const response = await authAPI.login('user@example.com', 'password');
    
    if (response.success) {
      // ✅ تم تسجيل الدخول بنجاح
      // الـ tokens تم حفظها تلقائياً
      console.log('User:', response.data.user);
    }
  } catch (error) {
    // ❌ حدث خطأ
    console.error(error);
  }
};
```

## 📖 الخدمات المتاحة

### 🔐 Authentication Service (authService.ts)

| الوظيفة | الاستخدام |
|---------|-----------|
| `registerInitial()` | التسجيل الأولي |
| `login()` | تسجيل الدخول |
| `verifyEmail()` | تأكيد البريد الإلكتروني |
| `resendVerificationCode()` | إعادة إرسال كود التحقق |
| `selectRole()` | اختيار الدور (Mentor/Mentee) |
| `completeMentorProfile()` | إكمال بروفايل المنتور |
| `completeMenteeProfile()` | إكمال بروفايل المتدرب |
| `requestPasswordReset()` | طلب إعادة تعيين كلمة المرور |
| `resetPassword()` | إعادة تعيين كلمة المرور |
| `logout()` | تسجيل الخروج |
| `getCurrentUser()` | الحصول على بيانات المستخدم الحالي |
| `isAuthenticated()` | التحقق من تسجيل الدخول |

### 📋 Lookup Service (lookupService.ts)

| الوظيفة | الاستخدام |
|---------|-----------|
| `getCountries()` | قائمة الدول |
| `getDomains()` | قائمة المجالات |
| `getSubDomains()` | قائمة المجالات الفرعية |
| `getCareerGoals()` | قائمة الأهداف المهنية |
| `getLearningStyles()` | قائمة أساليب التعلم |

## 💡 أمثلة الاستخدام

### تسجيل حساب جديد
```typescript
const response = await authAPI.registerInitial(
  'أحمد',
  'محمد',
  'ahmed@example.com',
  'SecurePass123!'
);
```

### تأكيد البريد الإلكتروني
```typescript
const response = await authAPI.verifyEmail(
  'ahmed@example.com',
  '123456'
);
```

### الحصول على قائمة الدول
```typescript
const response = await lookupAPI.getCountries();
if (response.success) {
  const countries = response.data;
}
```

### إكمال بروفايل المنتور
```typescript
const response = await authAPI.completeMentorProfile({
  yearsOfExperience: 5,
  currentTitle: 'Senior Developer',
  companyName: 'Tech Corp',
  expertiseAreas: ['React', 'Node.js'],
  bio: 'Experienced developer...',
});
```

## ⚡ المميزات الذكية

### 1️⃣ إضافة الـ Token تلقائياً
كل request بيتم إرساله تلقائياً مع الـ Authorization header

### 2️⃣ تحديث الـ Token التلقائي
لو انتهت صلاحية الـ token، بيتم تحديثه تلقائياً في الخلفية

### 3️⃣ معالجة الأخطاء الموحدة
جميع الأخطاء بتتعالج بطريقة موحدة ومنظمة

### 4️⃣ TypeScript Support
جميع الأنواع محددة بوضوح لتجنب الأخطاء

## 🔧 الإعدادات المتقدمة

### تغيير مدة الـ Timeout
في ملف `src/config/api.ts`:
```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 ثواني
  // ...
});
```

### إضافة Headers مخصصة
```typescript
apiClient.defaults.headers.common['X-Custom-Header'] = 'value';
```

## ❓ الأسئلة الشائعة

**س: كيف أعرف إذا المستخدم مسجل دخول؟**
```typescript
const isLoggedIn = authAPI.isAuthenticated();
```

**س: كيف أحصل على بيانات المستخدم الحالي؟**
```typescript
const user = authAPI.getCurrentUser();
```

**س: كيف أتعامل مع الأخطاء؟**
```typescript
try {
  const response = await authAPI.login(email, password);
} catch (error: any) {
  const message = error.response?.data?.message || 'حدث خطأ';
  console.error(message);
}
```

## 📝 ملاحظات مهمة

- ✅ تأكد من تشغيل الباك إند قبل استخدام الـ API
- ✅ الـ tokens يتم حفظها تلقائياً في localStorage
- ✅ في حالة الـ 401 Unauthorized، سيتم إعادة التوجيه تلقائياً لصفحة تسجيل الدخول
- ✅ جميع الـ timestamps بالـ UTC

## 🔒 الأمان

- الـ tokens يتم تخزينها في localStorage
- الـ API يستخدم HTTPS في الإنتاج
- الـ refresh token يتم استخدامه تلقائياً عند انتهاء صلاحية الـ access token

---

**للمزيد من الأمثلة، راجع:** `src/examples/ApiUsageExample.tsx`
