'use strict';

function validateCatalog(input) {
  const categories = ['سویشرت', 'تیشرت', 'ست', 'بافت', 'کت'];
  const fail = message => { throw new Error(message); };
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value, label, max, allowEmpty = false) => {
    if (typeof value !== 'string') fail(label + ' باید متن باشد.');
    const clean = value.trim();
    if ((!allowEmpty && !clean) || clean.length > max) fail(label + ' معتبر نیست؛ حداکثر ' + max + ' نویسه مجاز است.');
    return clean;
  };
  if (!object(input) || input.version !== 1 || !Array.isArray(input.products)) fail('ساختار فایل کاتالوگ معتبر نیست.');
  if (input.products.length < 1 || input.products.length > 200) fail('کاتالوگ باید بین ۱ تا ۲۰۰ محصول داشته باشد.');
  const ids = new Set();
  const products = input.products.map((product, productIndex) => {
    const label = 'محصول ' + (productIndex + 1);
    if (!object(product)) fail(label + ' معتبر نیست.');
    const id = text(product.id, 'شناسهٔ ' + label, 64);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) fail('شناسهٔ محصول تکراری یا نامعتبر است: ' + id);
    ids.add(id);
    const name = text(product.name, 'نام ' + label, 100);
    if (!categories.includes(product.category)) fail('دسته‌بندی ' + name + ' معتبر نیست.');
    const description = text(product.description, 'توضیحات ' + name, 1200, true);
    const priceToman = product.priceToman;
    if (priceToman !== null && (!Number.isSafeInteger(priceToman) || priceToman <= 0 || priceToman > 10000000000)) fail('قیمت ' + name + ' باید یک عدد صحیح مثبت به تومان باشد؛ برای قیمت نامشخص، کادر را خالی بگذارید.');
    if (typeof product.visible !== 'boolean') fail('وضعیت نمایش ' + name + ' معتبر نیست.');
    if (!['crop', 'full'].includes(product.frame)) fail('نوع نمایش تصویر ' + name + ' معتبر نیست.');
    if (!Array.isArray(product.variants) || product.variants.length < 1 || product.variants.length > 12) fail(name + ' باید بین ۱ تا ۱۲ رنگ داشته باشد.');
    const labels = new Set();
    const variants = product.variants.map((variant, variantIndex) => {
      if (!object(variant)) fail('رنگ ' + (variantIndex + 1) + ' از ' + name + ' معتبر نیست.');
      const variantLabel = text(variant.label, 'نام رنگ', 60);
      if (labels.has(variantLabel)) fail('نام رنگ در ' + name + ' تکراری است.');
      labels.add(variantLabel);
      const hex = text(variant.hex, 'کد رنگ', 7).toLowerCase();
      if (!/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/.test(hex)) fail('کد رنگ ' + variantLabel + ' معتبر نیست.');
      if (!Array.isArray(variant.images) || variant.images.length < 1 || variant.images.length > 20) fail('هر رنگ باید بین ۱ تا ۲۰ تصویر داشته باشد.');
      const images = variant.images.map(filename => {
        const image = text(filename, 'نام فایل تصویر', 180);
        if (!/^[a-z0-9][a-z0-9._-]*\.(?:png|webp|jpe?g)$/i.test(image)) fail('نام فایل تصویر معتبر نیست؛ فقط نام فایل داخل پوشهٔ assets مجاز است.');
        return image;
      });
      if (!Array.isArray(variant.sizes) || variant.sizes.length > 20) fail('حداکثر ۲۰ سایز برای هر رنگ مجاز است.');
      const sizes = variant.sizes.map(size => text(size, 'سایز', 30));
      const stock = variant.stock;
      if (stock !== null && (!Number.isSafeInteger(stock) || stock < 0 || stock > 9999)) fail('موجودی ' + variantLabel + ' باید عدد صحیح بین ۰ و ۹۹۹۹ باشد؛ موجودی نامشخص را خالی بگذارید.');
      return { label: variantLabel, hex, images: [...new Set(images)], sizes: [...new Set(sizes)], stock };
    });
    return { id, name, category: product.category, description, priceToman, visible: product.visible, frame: product.frame, variants };
  });
  return { version: 1, products };
}
