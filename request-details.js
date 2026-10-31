'use strict';

function normalizeRequestDetails(raw) {
  const input = raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const phone = typeof input.phone === 'string'
    ? input.phone.trim()
      .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
      .replace(/[\s().-]/g, '')
      .slice(0, 40)
    : '';
  return {
    name: text(input.name, 80),
    phone,
    fulfillment: ['ask', 'pickup', 'delivery'].includes(input.fulfillment) ? input.fulfillment : 'ask',
    city: text(input.city, 80),
    note: text(input.note, 500)
  };
}

function validateRequestDetails(raw) {
  const details = normalizeRequestDetails(raw);
  const errors = {};
  if (details.phone && !/^(?:09\d{9}|\+[1-9]\d{7,14})$/.test(details.phone)) {
    errors.phone = 'شماره تماس را به‌صورت ۰۹… یا شمارهٔ بین‌المللی با + وارد کنید.';
  }
  if (details.fulfillment === 'delivery' && !details.city) {
    errors.city = 'برای درخواست ارسال، نام شهر را وارد کنید.';
  }
  return { details, errors };
}

function formatRequestDetails(raw) {
  const details = normalizeRequestDetails(raw);
  const lines = [];
  if (details.name) lines.push('نام: ' + details.name);
  if (details.phone) lines.push('شماره تماس: ' + details.phone);
  const method = {
    ask: 'برای روش تحویل راهنمایی می‌خواهم',
    pickup: 'خرید حضوری از فروشگاه',
    delivery: 'درخواست ارسال'
  };
  lines.push('روش دریافت: ' + method[details.fulfillment]);
  if (details.fulfillment === 'delivery' && details.city) lines.push('شهر: ' + details.city);
  if (details.note) lines.push('توضیحات درخواست: ' + details.note);
  return lines.join('\n');
}
