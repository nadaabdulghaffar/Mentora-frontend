# دليل ربط الفرونت إند بالباك إند

## الإعداد

### 1. ملف الإعدادات (.env)
```env
VITE_API_URL=https://localhost:7018/api
```

### 2. استخدام الخدمات

#### تسجيل حساب جديد
```typescript
import authAPI from './services/authService';

const handleRegister = async () => {
  try {
    const response = await authAPI.registerInitial(
      'أحمد',
      'محمد',
      'ahmed@example.com',
      'Password123!'
    );
    
    if (response.success) {
      console.log('تم التسجيل بنجاح');
    }
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
  }
};
```

#### تسجيل الدخول
```typescript
const handleLogin = async () => {
  try {
    const response = await authAPI.login(
      'ahmed@example.com',
      'Password123!'
    );
    
    if (response.success) {
      // الـ tokens تم حفظها تلقائياً
      console.log('تم تسجيل الدخول');
    }
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
  }
};
```

#### الحصول على البيانات الثابتة
```typescript
import lookupAPI from './services/lookupService';

const loadCountries = async () => {
  try {
    const response = await lookupAPI.getCountries();
    if (response.success) {
      setCountries(response.data);
    }
  } catch (error) {
    console.error('خطأ في تحميل الدول:', error);
  }
};
```

## المميزات

✅ **إضافة الـ Token تلقائياً** - كل request بيتضاف له الـ Authorization header تلقائياً

✅ **تحديث الـ Token تلقائياً** - لو انتهت صلاحية الـ token بيتم تحديثه تلقائياً

✅ **معالجة الأخطاء** - الأخطاء بتتعالج بطريقة موحدة

✅ **سهولة الاستخدام** - كل الـ services جاهزة للاستخدام مباشرة

## الملفات المهمة

- `src/config/api.ts` - إعدادات Axios الأساسية
- `src/services/authService.ts` - خدمات المصادقة
- `src/services/lookupService.ts` - خدمات البيانات الثابتة
- `.env` - إعدادات الـ API URL

## ملاحظات

- تأكد من تشغيل الباك إند على `https://localhost:7018`
- جميع الـ requests بتتم بشكل تلقائي مع الـ Authorization header
- في حالة الـ 401، بيتم تحديث الـ token تلقائياً أو إعادة التوجيه للـ login
