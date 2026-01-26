# 📁 مجلد الصور - Images Folder

## 📍 أين ترفع الصور؟ Where to upload images?

ارفع صورك هنا في هذا المجلد:
**Upload your images here in this folder:**

### الصور المطلوبة - Required Images:

1. **الشعار (Logo)**
   - اسم الملف: `logo.png` أو `logo.svg` أو `logo.jpg`
   - File name: `logo.png` or `logo.svg` or `logo.jpg`
   - الحجم الموصى به: 200x200 بكسل أو أكبر
   - Recommended size: 200x200 pixels or larger

2. **الصورة التوضيحية (Illustration)**
   - اسم الملف: `illustration.png` أو `illustration.svg` أو `illustration.jpg`
   - File name: `illustration.png` or `illustration.svg` or `illustration.jpg`
   - الحجم الموصى به: 800x600 بكسل أو أكبر
   - Recommended size: 800x600 pixels or larger

## 🔧 كيفية التعديل - How to Update:

### إذا غيرت أسماء الملفات - If you changed file names:

افتح ملف `src/pages/auth/login.tsx` وعدل السطرين التاليين:
**Open `src/pages/auth/login.tsx` and modify these two lines:**

```typescript
// غير اسم الملف هنا - Change file name here
import logoImage from "../assets/images/YOUR_LOGO_NAME.png"
import illustrationImage from "../assets/images/YOUR_ILLUSTRATION_NAME.png"
```

### الصيغ المدعومة - Supported Formats:
- ✅ PNG (`.png`)
- ✅ SVG (`.svg`) - موصى به للشعار
- ✅ JPG/JPEG (`.jpg`, `.jpeg`)
- ✅ WebP (`.webp`)

## 💡 نصائح - Tips:

1. **للشعار (Logo)**: استخدم SVG للحصول على جودة أفضل
   - **For Logo**: Use SVG for better quality

2. **للصورة التوضيحية (Illustration)**: استخدم PNG أو JPG
   - **For Illustration**: Use PNG or JPG

3. **حجم الملف**: حاول أن يكون أقل من 500KB لكل صورة
   - **File size**: Try to keep under 500KB per image

4. **الشفافية**: إذا كنت تريد خلفية شفافة، استخدم PNG أو SVG
   - **Transparency**: If you want transparent background, use PNG or SVG
