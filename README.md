# LORENCE / لورنس

Independent clothing shop design prototype. This project is separate from Zehnno.

## Preview

Open `index.html` in a browser. HTML, CSS and JavaScript are self-contained; images are in `assets/`.

## Public hosting

The `public/` directory contains the complete web-ready preview with 19 WebP images (about 2.8 MB total), preserving the source images' dimensions. It excludes source screenshots and internal generation notes.

For Cloudflare Pages Git integration:

- Repository: `RanaRanaie/lorence-shop`
- Production branch: `main`
- Framework: None
- Build command: leave blank
- Build output directory: `public`

The preview is deployed on Cloudflare Pages at https://lorence-shop.pages.dev/ with automatic deployments from `main`. The first successful deployment is `e993556c-08d2-4a40-acea-3933c8b9c218` from commit `f004409a782183d1bb823ea5e05ff5e689096ff9`.

The preview remains a catalog demonstration: order recording and payment are not enabled. Public URL reachability may depend on the visitor's network; the publishing session confirmed Cloudflare's deployment success but its local network timed out on pages.dev.

## Current scope

- Responsive Persian RTL storefront, search and category filters.
- Ten products, with product dialogs and independent galleries by color.
- Four recently added styles use clean AI catalog reconstructions from the owner's garment references; screenshots remain as source files only.
- No backend, payment, order storage, or production deployment.
- Confirmed prices: Makan long sleeve, 1,480,000 toman; imported cropped sweatshirt, 1,680,000 toman. Other prices, sizes, stock and final color names remain unconfirmed.
- Model images are synthetic previews from supplied references and require product comparison before sales use.

## Next steps

Confirm product details, choose the order contact/flow, and deploy to suitable commercial hosting.
