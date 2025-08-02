// Helper function to translate Firebase errors to user-friendly messages
export const getFirebaseErrorMessage = (error: unknown, locale: string): string => {
  const errorMessage = (error as Error)?.message || error?.toString() || '';
  const errorCode = (error as { code?: string })?.code || '';
  
  // Handle specific Firebase Auth errors
  if (errorMessage.includes('TOO_SHORT') || errorCode === 'auth/weak-password') {
    return locale === 'ar-SA' 
      ? 'كلمة المرور قصيرة جداً. يجب أن تكون 6 أحرف على الأقل'
      : 'Password is too short. Must be at least 6 characters';
  }
  
  if (errorMessage.includes('INVALID_EMAIL') || errorCode === 'auth/invalid-email') {
    return locale === 'ar-SA' 
      ? 'البريد الإلكتروني غير صحيح. يرجى التحقق من تنسيق البريد الإلكتروني'
      : 'Invalid email format. Please check the email address';
  }
  
  if (errorMessage.includes('EMAIL_EXISTS') || errorCode === 'auth/email-already-exists') {
    return locale === 'ar-SA' 
      ? 'البريد الإلكتروني مستخدم مسبقاً. يرجى استخدام بريد إلكتروني آخر'
      : 'Email already exists. Please use a different email address';
  }
  
  if (errorMessage.includes('INVALID_PHONE_NUMBER') || errorCode === 'invalid-phone-number') {
    return locale === 'ar-SA' 
      ? 'رقم الهاتف غير صحيح. يرجى استخدام التنسيق الدولي (مثال: +966501234567)'
      : 'Invalid phone number. Please use international format (e.g., +966501234567)';
  }
  
  if (errorMessage.includes('PHONE_NUMBER_EXISTS') || errorCode === 'phone-number-already-exists') {
    return locale === 'ar-SA' 
      ? 'رقم الهاتف مستخدم مسبقاً. يرجى استخدام رقم هاتف آخر'
      : 'Phone number already exists. Please use a different phone number';
  }
  
  if (errorMessage.includes('INVALID_DISPLAY_NAME') || errorCode === 'invalid-display-name') {
    return locale === 'ar-SA' 
      ? 'اسم العرض غير صحيح. يجب أن يكون من 1-100 حرف'
      : 'Invalid display name. Must be 1-100 characters long';
  }
  
  if (errorMessage.includes('INSUFFICIENT_PERMISSION') || errorCode === 'auth/insufficient-permission') {
    return locale === 'ar-SA' 
      ? 'ليس لديك صلاحية كافية لإجراء هذه العملية'
      : 'Insufficient permissions to perform this operation';
  }
  
  if (errorMessage.includes('INTERNAL_ERROR') || errorCode === 'auth/internal-error') {
    return locale === 'ar-SA' 
      ? 'خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى'
      : 'Internal server error. Please try again';
  }
  
  // Handle general validation errors
  if (errorMessage.includes('TOO_SHORT')) {
    return locale === 'ar-SA' 
      ? 'البيانات المدخلة قصيرة جداً. يرجى التحقق من كلمة المرور (6 أحرف على الأقل) ورقم الهاتف'
      : 'Input too short. Please check password (min 6 characters) and phone number format';
  }
  
  if (errorMessage.includes('TOO_LONG')) {
    return locale === 'ar-SA' 
      ? 'البيانات المدخلة طويلة جداً. يرجى التحقق من الحقول المطلوبة'
      : 'Input too long. Please check the required fields';
  }
  
  if (errorMessage.includes('INVALID_FORMAT')) {
    return locale === 'ar-SA' 
      ? 'تنسيق البيانات غير صحيح. يرجى التحقق من البريد الإلكتروني ورقم الهاتف'
      : 'Invalid data format. Please check email and phone number format';
  }
  
  // Return the original error message if no specific translation found
  return errorMessage || (locale === 'ar-SA' ? 'حدث خطأ غير معروف' : 'Unknown error occurred');
};
