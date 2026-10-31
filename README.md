# LORENCE / لورنس

Independent Persian clothing storefront. This project is separate from Zehnno.

## Storefront

Public preview: https://lorence-shop.pages.dev/

Open `index.html` from the prepared local bundle to inspect the storefront. Keep its companion JavaScript files and `assets/` directory alongside it.

- Ten products with search, category filters, and separate galleries by color.
- Inquiry basket with quantities, requested sizes, browser persistence, and a copyable request summary.
- Shareable links identify the selected product and color.
- WhatsApp handoff is configured for the supplied store business number, `+989102453713`. After preparing the full request, the WhatsApp link opens the store conversation with that text filled in; the customer sends it themselves.
- Store address for in-person shopping: خیابان افسریه، پانزده‌متری دوم، حدفاصل خیابان‌های ۳۰ و ۳۱.
- `guide.html` explains the purchase steps, contact options, and common shopping questions. It is linked from the storefront navigation, footer, and basket help.

The basket prepares an inquiry. It does not record an order on a server, reserve inventory, confirm payment, or send a message automatically. Online payment and an order-management backend are not implemented.

## Completing an inquiry

From the basket, “تکمیل درخواست خرید” opens a form with optional name, phone number, and a note. The customer can leave the delivery method for discussion, choose in-person shopping, or request shipping. A destination city is required only for shipping; no home address, shipping rate, or delivery availability is assumed. In-person shopping shows the supplied store address.

The prepared preview, full-text copy, and WhatsApp handoff use the same request text, including the selected products, colors, quantities, sizes, and supplied contact/delivery details. The basket also retains a quick-copy option for selections alone. The store must confirm stock, final price, and delivery arrangements in conversation.

The site keeps contact and delivery fields in the current page only and does not save them in localStorage or submit them to a Lorence backend. Basket selections are stored separately in the browser. Copying text does not send it. Opening the WhatsApp handoff passes the prepared text to WhatsApp; the customer must press Send there to message the store.

## Catalog data and editing

`catalog.js` contains the product data, and `catalog-schema.js` validates its structure. `catalog-editor.html` provides a Persian form for editing the existing products' names, categories, descriptions, prices, visibility, and each color's label, swatch, sizes, and stock. Existing image files are previewed in the form.

Saving in the editor stores a draft in that browser. It does not change the online storefront. The editor has no server login or online write access and receives no customer information.

1. Open `catalog-editor.html` and edit a product or color.
2. Save the browser draft. Blank price, size, and stock fields preserve unknown information; stock `0` means unavailable.
3. Download a JSON backup to retain or transfer the draft. The editor imports validated JSON backups only, not executable JavaScript files.
4. Download `catalog.js` for publication. Replace the catalog data in the website's release bundle and republish before expecting customers to see changes.

The editor exports data only. New-product creation, image upload, and automatic publication are not part of this stage.

## Public hosting

The GitHub repository is `RanaRanaie/lorence-shop`. Cloudflare Pages publishes its `public/` directory automatically from `main`.

- Framework: None
- Build command: leave blank
- Build output directory: `public`

The web bundle uses 19 WebP catalog images, about 2.8 MB total, with the source dimensions preserved. Source screenshots and internal generation notes are excluded from `public/`. Keep the catalog data's image filenames consistent with the asset format in the release bundle.

Cloudflare deployment success was verified. The original publishing connection timed out when opening the public pages.dev URL, so public rendering from that connection was not confirmed.

## Product information

Confirmed prices are Makan long sleeve, 1,480,000 toman, and imported cropped sweatshirt, 1,680,000 toman. Other prices, sizes, stock counts, and final color names remain unconfirmed until the store supplies them.

Catalog model images are synthetic reconstructions based on the supplied garment references. Compare colors, cuts, lettering, and other details with the actual garments before using them for sales.

## Next steps

Confirm product information and sales/delivery policies, then decide whether online order storage, payment, or an authenticated publishing workflow is needed.
