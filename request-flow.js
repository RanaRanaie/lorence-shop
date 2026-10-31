'use strict';

function completeRequestText(items, details) {
  const selection = requestText(items);
  if (!selection) return '';
  return selection + '\n\n' + formatRequestDetails(details);
}

const requestFlowDialog = document.querySelector('#requestDialog');
const requestFlowForm = document.querySelector('#requestForm');
let requestPrepared = false;
let lastCopiedRequestText = '';
let requestRenderedText = '';

function readRequestForm() {
  return {
    name: document.querySelector('#requestName').value,
    phone: document.querySelector('#requestPhone').value,
    fulfillment: document.querySelector('#requestFulfillment').value,
    city: document.querySelector('#requestCity').value,
    note: document.querySelector('#requestNote').value
  };
}

function refreshRequestFlow(showErrors = false) {
  const {details, errors} = validateRequestDetails(readRequestForm());
  const rows = sanitizeBasket(basket);
  const valid = !Object.keys(errors).length;
  const ready = rows.length > 0 && valid && requestPrepared && !catalogLoadError;
  const text = ready ? completeRequestText(rows, details) : '';
  if (text !== requestRenderedText) {
    document.querySelector('#requestFlowStatus').textContent = '';
    requestRenderedText = text;
  }
  const delivery = details.fulfillment === 'delivery';
  document.querySelector('#requestCityField').hidden = !delivery;
  document.querySelector('#requestCity').required = delivery;
  document.querySelector('#requestPickup').hidden = details.fulfillment !== 'pickup';
  document.querySelector('#requestEmpty').hidden = rows.length > 0;
  document.querySelector('#prepareRequest').disabled = !rows.length || catalogLoadError;
  for (const field of ['phone', 'city']) {
    const id = field === 'phone' ? '#requestPhone' : '#requestCity';
    const error = showErrors || requestPrepared ? errors[field] || '' : '';
    document.querySelector(id + 'Error').textContent = error;
    document.querySelector(id).setAttribute('aria-invalid', String(!!error));
  }
  const summary = summaryFor(rows);
  document.querySelector('#requestSelectionSummary').textContent = rows.length
    ? summary.totalQuantity.toLocaleString('fa-IR') + ' عدد در انتخاب‌های شما' + (summary.knownTotal ? ' · جمع قیمت‌های مشخص: ' + summary.knownTotal.toLocaleString('fa-IR') + ' تومان' : '') + (summary.unknownCount ? ' · بعضی قیمت‌ها نیاز به استعلام دارند.' : '')
    : 'سبد انتخاب‌ها خالی است.';
  document.querySelector('#requestPreviewPanel').hidden = !ready;
  document.querySelector('#completeRequestPreview').textContent = text;
  document.querySelector('#copyCompleteRequest').disabled = !ready;
  document.querySelector('#requestManualCopy').hidden = true;
  document.querySelector('#completeRequestManual').value = '';
  const phone = normalizeWhatsAppNumber(storeContact.whatsappNumber);
  const link = document.querySelector('#orderContact');
  link.hidden = !ready || !phone;
  if (ready && phone) link.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
  else link.removeAttribute('href');
  document.querySelector('#contactPending').hidden = !!phone;
  if (ready && lastCopiedRequestText && text !== lastCopiedRequestText) document.querySelector('#requestFlowStatus').textContent = 'متن درخواست تغییر کرده است؛ متن جدید را دوباره کپی کنید.';
  if (requestPrepared && !ready) document.querySelector('#requestFlowStatus').textContent = rows.length ? 'برای آماده‌شدن متن، موارد مشخص‌شده را اصلاح کنید.' : 'سبد خالی شده است؛ ابتدا لباس موردنظر را انتخاب کنید.';
  return {ready, text, errors};
}

function openRequestFlow() {
  if (catalogLoadError || !sanitizeBasket(basket).length) return;
  if (basketDialog.open) basketDialog.close();
  if (dialog.open) dialog.close();
  document.querySelector('#requestFlowStatus').textContent = '';
  refreshRequestFlow();
  if (!requestFlowDialog.open) requestFlowDialog.showModal();
}

function backToBasket() {
  requestFlowDialog.close();
  openBasket();
}

document.querySelector('#completeRequest').onclick = openRequestFlow;
document.querySelector('#requestClose').onclick = backToBasket;
document.querySelector('#requestBack').onclick = backToBasket;
requestFlowDialog.addEventListener('cancel', event => { event.preventDefault(); backToBasket(); });
requestFlowForm.addEventListener('input', () => {
  document.querySelector('#requestFlowStatus').textContent = '';
  refreshRequestFlow();
});
requestFlowForm.addEventListener('change', () => refreshRequestFlow());
requestFlowForm.addEventListener('submit', event => {
  event.preventDefault();
  requestPrepared = true;
  const state = refreshRequestFlow(true);
  if (!state.ready) {
    if (state.errors.phone) document.querySelector('#requestPhone').focus();
    else if (state.errors.city) document.querySelector('#requestCity').focus();
    return;
  }
  document.querySelector('#requestFlowStatus').textContent = 'متن آماده است. آن را بررسی و سپس کپی کنید؛ هنوز پیامی ارسال نشده است.';
  document.querySelector('#requestPreviewPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
});
document.querySelector('#copyCompleteRequest').onclick = async () => {
  const state = refreshRequestFlow(true);
  if (!state.ready) return;
  try {
    await navigator.clipboard.writeText(state.text);
    lastCopiedRequestText = state.text;
    const current = refreshRequestFlow(true);
    if (current.ready && current.text === state.text) document.querySelector('#requestFlowStatus').textContent = 'متن کامل درخواست کپی شد. آن را برای فروشگاه بفرستید؛ سفارش هنوز تأیید نشده است.';
  } catch {
    const manual = document.querySelector('#completeRequestManual');
    manual.value = state.text;
    document.querySelector('#requestManualCopy').hidden = false;
    manual.focus();
    manual.select();
    document.querySelector('#requestFlowStatus').textContent = 'متن آماده است؛ آن را دستی کپی کنید و برای فروشگاه بفرستید.';
  }
};
document.querySelector('#orderContact').onclick = event => {
  const state = refreshRequestFlow(true);
  if (!state.ready || !normalizeWhatsAppNumber(storeContact.whatsappNumber)) { event.preventDefault(); return; }
  document.querySelector('#requestFlowStatus').textContent = 'واتساپ با متن آماده باز می‌شود. برای ارسال، دکمهٔ ارسال را در واتساپ بزنید.';
};
refreshRequestFlow();
