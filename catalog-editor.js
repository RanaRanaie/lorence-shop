'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const storageKey = 'lorence-catalog-draft-v1';
  let baseline, draft, productIndex = 0, variantIndex = 0, undoState = null;
  let recoveringDraft = false;

  const message = (text, error = false, target = 'editorStatus') => {
    $(target).textContent = text;
    $(target).classList.toggle('error', error);
  };
  const localTime = () => new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const digits = value => value.replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632));
  function optionalInteger(value, field) {
    const normalized = digits(value.trim()).replace(/[\s,٬]/g, '');
    if (!normalized) return null;
    if (!/^\d+$/.test(normalized)) throw new Error(field + ' را به‌صورت عدد صحیح وارد کنید.');
    const number = Number(normalized);
    if (!Number.isSafeInteger(number)) throw new Error(field + ' بیش از حد بزرگ است.');
    return number;
  }
  const expandHex = hex => /^#[a-f\d]{3}$/i.test(hex) ? '#' + [...hex.slice(1)].map(c => c + c).join('') : hex;

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ savedAt: new Date().toISOString(), catalog: draft }));
      $('draftInfo').textContent = 'پیش‌نویس این مرورگر · ذخیره در ساعت ' + localTime();
      return true;
    } catch {
      $('draftInfo').textContent = 'پیش‌نویس در این نشست آماده است؛ برای نگهداری، فایل پشتیبان بگیرید.';
      return false;
    }
  }

  function markUndo() {
    undoState = { catalog: clone(draft), productIndex, variantIndex };
    $('undoChange').disabled = false;
  }

  function renderProductOptions() {
    const select = $('productSelect');
    select.replaceChildren();
    draft.products.forEach((product, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = product.name + (product.visible ? '' : ' · پنهان');
      select.append(option);
    });
    select.value = String(productIndex);
    $('totalProducts').textContent = draft.products.length.toLocaleString('fa-IR');
    $('visibleProducts').textContent = draft.products.filter(product => product.visible).length.toLocaleString('fa-IR');
    $('pricedProducts').textContent = draft.products.filter(product => product.priceToman !== null).length.toLocaleString('fa-IR');
  }

  function renderVariant() {
    const product = draft.products[productIndex];
    const variant = product.variants[variantIndex];
    $('variantLabel').value = variant.label;
    $('variantHex').value = variant.hex;
    $('variantColor').value = expandHex(variant.hex);
    $('variantSizes').value = variant.sizes.join('، ');
    $('variantStock').value = variant.stock === null ? '' : variant.stock.toLocaleString('fa-IR', { useGrouping: false });
    const preview = $('variantImages');
    preview.replaceChildren();
    variant.images.forEach(filename => {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.src = 'assets/' + filename;
      img.alt = product.name + ' · ' + variant.label;
      const caption = document.createElement('figcaption');
      caption.textContent = filename;
      const fallback = document.createElement('span');
      fallback.className = 'image-error';
      fallback.textContent = 'تصویر در این بسته موجود نیست.';
      img.addEventListener('error', () => { img.hidden = true; fallback.style.display = 'block'; });
      figure.append(img, fallback, caption);
      preview.append(figure);
    });
  }

  function renderForm() {
    renderProductOptions();
    const product = draft.products[productIndex];
    variantIndex = Math.min(variantIndex, product.variants.length - 1);
    $('editorTitle').textContent = product.name;
    $('productName').value = product.name;
    $('productCategory').value = product.category;
    $('productPrice').value = product.priceToman === null ? '' : product.priceToman.toLocaleString('fa-IR', { useGrouping: false });
    $('productId').value = product.id;
    $('productDescription').value = product.description;
    $('productVisible').checked = product.visible;
    $('variantSelect').replaceChildren();
    product.variants.forEach((variant, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = variant.label;
      $('variantSelect').append(option);
    });
    $('variantSelect').value = String(variantIndex);
    renderVariant();
  }

  function readForm() {
    const next = clone(draft);
    const product = next.products[productIndex];
    product.name = $('productName').value;
    product.category = $('productCategory').value;
    product.description = $('productDescription').value;
    product.priceToman = optionalInteger($('productPrice').value, 'قیمت');
    product.visible = $('productVisible').checked;
    const variant = product.variants[variantIndex];
    variant.label = $('variantLabel').value;
    variant.hex = $('variantHex').value;
    variant.sizes = $('variantSizes').value.trim() ? $('variantSizes').value.split(/[,،\n]/).map(size => size.trim()).filter(Boolean) : [];
    variant.stock = optionalInteger($('variantStock').value, 'موجودی');
    return validateCatalog(next);
  }

  function saveForm(silent = false) {
    try {
      const next = readForm();
      const changed = JSON.stringify(next) !== JSON.stringify(draft);
      if (changed) { markUndo(); draft = next; }
      const saved = persist();
      renderProductOptions();
      if (!silent) message(saved ? 'پیش‌نویس در مرورگر ذخیره شد. برای به‌روزرسانی سایت، فایل انتشار را دریافت کنید.' : 'اطلاعات آماده است، اما مرورگر نتوانست آن را نگه دارد. فایل پشتیبان یا انتشار را دریافت کنید.', !saved);
      return true;
    } catch (error) {
      message(error.message, true);
      return false;
    }
  }

  function download(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  try {
    if (typeof lorenceCatalog === 'undefined' || typeof validateCatalog !== 'function') throw new Error('فایل کاتالوگ یا ابزار بررسی آن بارگذاری نشد. فایل‌های این صفحه را کنار هم نگه دارید.');
    baseline = validateCatalog(lorenceCatalog);
    draft = clone(baseline);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.catalog) { draft = validateCatalog(saved.catalog); recoveringDraft = true; }
    } catch {
      message('پیش‌نویس قبلی قابل خواندن نبود؛ کاتالوگ فعلی فروشگاه باز شد. می‌توانید پشتیبان JSON را باز کنید.', true);
    }
    $('workspace').hidden = false;
    $('exportPanel').hidden = false;
    renderForm();
    if (recoveringDraft) $('draftInfo').textContent = 'پیش‌نویس ذخیره‌شدهٔ همین مرورگر بازیابی شد.';
  } catch (error) {
    $('startupError').textContent = error.message;
    $('startupError').style.display = 'block';
    return;
  }

  $('catalogForm').addEventListener('submit', event => { event.preventDefault(); if (saveForm()) renderForm(); });
  $('productSelect').addEventListener('change', () => {
    const next = Number($('productSelect').value);
    if (!saveForm(true)) { $('productSelect').value = String(productIndex); return; }
    productIndex = next;
    variantIndex = 0;
    renderForm();
    message('');
  });
  $('variantSelect').addEventListener('change', () => {
    const next = Number($('variantSelect').value);
    if (!saveForm(true)) { $('variantSelect').value = String(variantIndex); return; }
    variantIndex = next;
    $('variantSelect').value = String(variantIndex);
    renderVariant();
    message('');
  });
  $('variantColor').addEventListener('input', () => { $('variantHex').value = $('variantColor').value; });
  $('variantHex').addEventListener('input', () => {
    const hex = $('variantHex').value.trim();
    if (/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) $('variantColor').value = expandHex(hex);
  });

  $('restoreProduct').addEventListener('click', () => {
    const original = baseline.products.find(product => product.id === draft.products[productIndex].id);
    if (!original) { message('این محصول در نسخهٔ اولیهٔ این صفحه وجود ندارد. برای بازگشت از دکمهٔ «برگرداندن تغییر آخر» استفاده کنید.', true); return; }
    markUndo();
    draft.products[productIndex] = clone(original);
    variantIndex = 0;
    const saved = persist();
    renderForm();
    message(saved ? 'اطلاعات این محصول به نسخهٔ فعلی فروشگاه برگشت. تغییر را می‌توانید برگردانید.' : 'اطلاعات این محصول برگشت. برای نگهداری پیش‌نویس، پشتیبان بگیرید.', !saved);
  });
  $('undoChange').addEventListener('click', () => {
    if (!undoState) return;
    draft = undoState.catalog;
    productIndex = undoState.productIndex;
    variantIndex = undoState.variantIndex;
    undoState = null;
    $('undoChange').disabled = true;
    const saved = persist();
    renderForm();
    message(saved ? 'آخرین تغییر برگردانده شد؛ پیش‌نویس مرورگر به‌روزرسانی شد.' : 'آخرین تغییر برگردانده شد. برای نگهداری، فایل پشتیبان بگیرید.', !saved);
  });

  $('exportPublication').addEventListener('click', () => {
    if (!saveForm(true)) return;
    const clean = validateCatalog(draft);
    const json = JSON.stringify(clean, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    download('const lorenceCatalog = ' + json + ';\n', 'text/javascript;charset=utf-8', 'catalog.js');
    message('فایل catalog.js آمادهٔ دریافت شد. پس از جایگزینی این فایل در بستهٔ سایت و انتشار، تغییرات برای مشتری‌ها نمایش داده می‌شوند.', false, 'exportStatus');
  });
  $('exportBackup').addEventListener('click', () => {
    if (!saveForm(true)) return;
    download(JSON.stringify(validateCatalog(draft), null, 2) + '\n', 'application/json;charset=utf-8', 'lorence-catalog-backup.json');
    message('پشتیبان JSON آمادهٔ دریافت شد؛ با دکمهٔ «بازکردن پشتیبان» می‌توانید ویرایش را ادامه دهید.', false, 'exportStatus');
  });
  $('importBackup').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error('اندازهٔ فایل پشتیبان بیش از حد مجاز است.');
      const imported = validateCatalog(JSON.parse(await file.text()));
      markUndo();
      draft = imported;
      productIndex = 0;
      variantIndex = 0;
      const saved = persist();
      renderForm();
      message(saved ? 'پشتیبان باز و در پیش‌نویس این مرورگر ذخیره شد. سایت آنلاین تغییری نکرد.' : 'پشتیبان باز شد؛ ذخیرهٔ مرورگر ممکن نبود. پیش از بستن صفحه، فایل خروجی بگیرید.', !saved, 'exportStatus');
      message('');
    } catch (error) {
      message(error instanceof SyntaxError ? 'فایل انتخاب‌شده JSON معتبر نیست. فایل catalog.js را وارد نکنید؛ از پشتیبان JSON استفاده کنید.' : error.message, true, 'exportStatus');
    } finally { event.target.value = ''; }
  });
})();
