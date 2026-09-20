# Maleka Furnitures — Project Report and Technical Handover

**Project type:** Responsive furniture-showroom catalogue and enquiry website  
**Business:** Maleka Furnitures  
**Location:** 18-7-198/A/3, Murad Mahal, Sultan Shahi Road, Moghalpura, Hyderabad  
**Customer contact:** +91 93910 33589 / +91 89853 14344  
**Opening hours:** Mon–Sat, 9:00 AM–10:00 PM; Sun, 9:00 AM–6:00 PM  
**Google rating shown:** 3.7 from 147 reviews  
**Commercial model:** Physical showroom, direct enquiries; no basket, checkout, online payment, or inventory commitment.

---

## 1. Executive summary

This project is a premium digital showroom for Maleka Furnitures. It is designed to help a visitor discover furniture, inspect a product, and contact the showroom through WhatsApp or phone. It is deliberately **not** an e-commerce store: a visitor can never add an item to a cart or pay online. This is important because price, availability, finish, dimensions, delivery details, and customisation are expected to be discussed with the showroom.

The experience has two distinct sides:

1. The public website presents the brand, collections, active offers, wedding furniture packages, product catalogue, product details, map, and enquiry actions.
2. The owner dashboard is an authenticated workspace intended for Maleka staff to publish products and offers, manage imagery, and control visibility.

The site contains the public user interface, Supabase data model, authenticated owner controls, a private Backblaze B2 image route through a Cloudflare Worker proxy, and the real 346-record Maleka catalogue import. The new-account bootstrap script remains at [supabase/MALEKA_FRESH_SETUP.sql](supabase/MALEKA_FRESH_SETUP.sql). A complete image-pipeline history and the verified import outcome are recorded in section 8A.

---

## 2. Brand and customer-facing proposition

### Brand story and positioning

Maleka Furnitures is presented as an established Hyderabad showroom with a focus on furniture that customers should see in person before they choose. The writing emphasises showroom confidence, directly inspecting furniture, wedding packages, practical affordability, and tailored enquiries.

The visual identity uses the supplied Maleka crest logo (`src/assets/logo.webp`) rather than the temporary “M” placeholder. The crest is shown in both the site header and footer. The palette is warm sand, dark ink/brown, cream, and gold to support a traditional premium-furniture mood.

### Customer trust signals

- Google rating: **3.7**
- Google review count: **147**
- Established: **2003** (used in brand-story copy)
- Physical presence: Moghalpura, Hyderabad
- Direct phone and WhatsApp access
- Satellite map and directions link

Reviews are not copied into the website. The site uses only the aggregate rating and count supplied by the business, avoiding any unsupported claims or quoted customer endorsements.

---

## 3. Public website experience

### Header and navigation

The sticky header contains:

- Maleka crest icon and “MALEKA FURNITURES” wordmark
- Hyderabad location label
- Home, Explore, and Visit navigation
- Phone-call control on desktop
- Mobile menu with touch-friendly navigation and phone action

The header remains visible while scrolling to keep contact and navigation actions accessible.

### Hero section

The hero is a full-width looping showroom video with a dark readable overlay. It includes:

- Brand/location line: Hyderabad, Telangana
- “Furniture worth making room for.” headline
- Explore Collection CTA to the catalogue
- Enquire Now CTA to WhatsApp
- Rating and Google review-count trust line

The background video utilizes an optimized responsive implementation featuring four assets: a WebP poster fallback, a mobile-optimized MP4, a desktop-preferred WebM, and a desktop MP4 fallback. It also respects the browser's "Save-Data" setting to pause playback for constrained connections. The hero’s composition, messaging, video treatment, and primary actions were preserved as requested.

### Active offer section

Immediately below the hero is the **Featured Offer** region.

The intended state logic is:

| Offer state | Public outcome |
|---|---|
| No active offer | The entire offer area is hidden. The floating offer control is hidden. |
| One active offer | One large image-and-copy offer card is shown. |
| Multiple active offers | One card is shown at a time with previous/next carousel controls. |

Each offer supports a promotional image, headline, supporting text, original price, offer price, CTA label, active status, and display order. Original pricing is styled with a strikethrough, while offer pricing is highlighted.

The floating **View offer** button anchors to this area only when at least one active offer exists. Offer enquiries use a WhatsApp message containing the offer headline.

### Shop by piece / collections

The horizontal, touch-scrollable category strip contains:

- Sofas
- Beds
- Dining
- Wardrobes
- Tables
- Seating
- Mirrors
- Study/Office
- Commercial
- Wedding Sets
- Shoe Racks & Storage

Each selection routes to `/explore?category=<category name>`. On narrow screens it scrolls horizontally rather than becoming cramped. Furniture silhouette treatments provide visual recognition without forcing category photos into standard rectangles.

### Featured collection

The homepage uses an editorial, varied-scale furniture layout rather than a flat product grid. Sofas, beds, wardrobes, dining furniture, dressing furniture, and seating are presented with different ratios to feel closer to a curated showroom floor.

This area currently uses local artwork supplied with the project as a visual showcase. Once real product records are populated, the catalogue becomes the source of truth for the commercial product range.

### Wedding furniture section

The wedding section is positioned immediately before the dark showroom/story block. It follows the supplied reference direction with a deep brown and gold treatment, two package cards, a summary of typical package elements, and a **Plan a wedding set** CTA.

That CTA opens the Explore page already filtered to `Wedding Sets`. Its WhatsApp links create wedding-package-specific enquiry messages.

### Catalogue / Explore page

The `/explore` route is the practical browsing experience:

- Case-insensitive text search bar for finding products by name
- Category filter strip, including an All state
- Product count
- Responsive product grid
- Featured products ordered first, then display order, then newest products
- Loading skeletons
- Empty-category state with WhatsApp enquiry action
- Product-card category, image, name, description preview, featured marker, WhatsApp CTA, and phone CTA

Only `visible = true` products are fetched for public browsing. A hidden product is therefore not presented publicly.

### Product detail page

Each product title opens `/product/$id`. The page has:

- Back-to-category action
- Main product image
- Category, product title, optional description, and tags
- WhatsApp enquiry that includes product name and category
- Call showroom action
- Graceful unavailable/empty state

The database supports up to four ordered product images. The public detail component renders the ordered gallery, including thumbnail selection and the primary image.

### Showroom and visit pages

The homepage showroom block and `/visit` page provide a physical-store conversion path:

- Moghalpura address
- Phone and WhatsApp actions
- Opening hours
- Directions link to Google Maps
- Satellite Google Maps embed (`t=k`, zoom level 18)
- A showroom-visit CTA

---

## 4. Enquiry behaviour

All messaging goes through the primary WhatsApp number, `+91 93910 33589`, via a mobile-friendly `wa.me` deep link.

| Context | Generated message purpose |
|---|---|
| General enquiry | Customer wants to enquire about Maleka furniture. |
| Product card/detail | Includes product name and category. |
| Offer | Includes the offer headline. |
| Wedding package | Identifies the selected wedding package. |

Telephone links use `tel:` and are suitable for mobile visitors. The secondary number is presented in the footer as an additional direct calling option.

---

## 5. Owner dashboard

The owner workspace is at `/owner` and is excluded from search indexing.

### Access model

1. A staff member signs in or creates an authentication account with Supabase Auth.
2. The application checks whether the user has the `owner` role in `public.user_roles`.
3. Only an owner can see and use the catalogue-management interface.
4. A signed-in user without that role receives a Not Authorised screen.

The dashboard includes Home and Sign Out actions plus entry cards for Products, Add Product, and Categories.

### Product maintenance

The product interface enables complete catalogue control:

- **Create / Edit / Delete**: Full lifecycle management of product records.
- **Visibility & Featured**: Toggles to hide a product from the public catalogue or bump it to the featured section.
- **1–4 Image Management**: Owners can upload up to 4 images per product.
- **Automatic Ordering**: Images are displayed in the order they are added; manual sort order inputs have been removed in favour of visual sequence.
- **Primary Star**: A star icon on the image thumbnail allows the owner to instantly mark any of the images as the primary thumbnail. The catalogue will automatically extract the starred image and display it first.
- **Fixed 4:5 Cropper**: All uploaded product images go through a forced 4:5 aspect ratio cropping tool before upload to ensure catalogue uniformity.
  - **Fit/Fill**: Presets allow the owner to "Fit" the image to show maximum area without empty space, or "Fill" to zoom in slightly.
  - **Rotate/pan/zoom**: The crop dialog supports 90° rotation, mouse-wheel/pinch zooming, and drag panning.
  - **WebP processing**: The browser generates a highly optimized 1200×1500 WebP file entirely client-side before uploading, saving significant bandwidth and storage.

### Offer maintenance

The offer area supports:

- Create offer
- Upload a promotional image (automatically converted to WebP client-side while preserving its original aspect ratio)
- Activate/deactivate an offer
- Delete an offer

The database also supports headline, supporting copy, original price, offer price, CTA label, and order. These fields should be surfaced in the owner form as the next small dashboard enhancement.

### Category maintenance

Category visibility is persisted in `categories.visible`. The owner eye-toggle updates that shared value, and the homepage and public Explore page load only visible categories. This makes hide/show behaviour consistent across devices after refresh.

### Known dashboard work remaining

The requested product-management search/filter/hidden-product controls are not yet fully exposed in the dashboard UI. The data schema already includes `visible`, categories, and sort order, so the remaining work is interface wiring rather than a database redesign.

---

## 6. Data architecture

The database is relational and intentionally small. It serves a showroom catalogue, not a full commerce system.

### Main tables

#### `user_roles`

Maps an authenticated Supabase user to the `owner` application role. This is the authorization gate for all management operations.

#### `categories`

| Field | Use |
|---|---|
| `id` | Unique category ID |
| `name` | Visible name, e.g. Wedding Sets |
| `slug` | URL-safe identifier |
| `image_url` | Optional category presentation image |
| `visible` | Public visibility switch |
| `sort_order` | Admin-controlled order |

#### `products`

| Field | Use |
|---|---|
| `id` | Unique product ID |
| `name` | Product title |
| `category` | Assigned category name |
| `description` | Optional customer-facing description |
| `image_url` | Primary image path or HTTPS URL served through the B2 image proxy |
| `featured` | Featured-first display marker |
| `visible` | Public visibility switch |
| `tags` | Flexible descriptive/filter tags |
| `sort_order` | Manual display order |
| timestamps | Creation and update tracking |

#### `product_images`

Stores ordered secondary/primary gallery images for a product. A product may have up to four images in the current user interface.

#### `offers`

Stores promotional cards independently from products. An offer has a headline, optional supporting text/prices, image, active flag, CTA label, and sort order.

---

## 7. Security and permissions

The fresh setup SQL turns Row Level Security on for every application table.

### Public users can

- Read visible categories
- Read visible products
- Read images that belong to visible products
- Read active offers
- Read product-image storage objects needed for display

### Public users cannot

- Create, edit, hide, feature, order, or delete catalogue data
- Create or change offers
- Upload/delete images
- Assign themselves the owner role
- Access account role records other than their own

### Owners can

- Read and manage catalogue records
- Upload, replace, and remove approved image objects
- Create/update/delete offers and categories

The browser never contains a Supabase service-role key. Only the publishable/anon credentials are used by the frontend; access is enforced by Supabase RLS.

---

## 8. Image and storage strategy

### B2 image delivery: implemented and verified

Supabase remains responsible for PostgreSQL catalogue data, authentication, and authorization. The production image-storage architecture is now Backblaze B2 plus a Cloudflare Worker proxy:

```text
Public website
  → Supabase product metadata (`image_url`)
  → Cloudflare Worker image URL
  → private Backblaze B2 object
  → streamed, cacheable image response
```

The live components are:

- **B2 bucket:** `maleka-furniture-images` in US East (`s3.us-east-005.backblazeb2.com`)
- **Bucket settings:** private, Backblaze-managed encryption enabled, Object Lock disabled
- **B2 key:** dedicated `maleka-website` application key, scoped to this bucket; key ID and application key are not stored in source control
- **Worker:** `maleka-image-proxy` at `https://maleka-image-proxy.malekafurniture1.workers.dev`
- **Worker secrets:** `B2_KEY_ID` and `B2_APPLICATION_KEY`, encrypted in Cloudflare
- **Verified health endpoint:** `/` returns `Maleka Image Proxy OK`
- **Verified private-image endpoint:** `/images/logo.webp` streams the root-level B2 test object successfully

No B2 credentials are present in React, Supabase browser variables, or Git. The Worker obtains private B2 objects server-side and returns only the image response to visitors.

### Legacy compatibility storage and current production route

The fresh setup script still creates a private Supabase Storage bucket named `product-images` for compatibility with earlier paths. It is not the production route for the imported catalogue. The current owner product flow uploads through the protected `/api/b2-upload` endpoint and stores the returned Cloudflare Worker image URL in `products.image_url` and `product_images.image_url`.

The crop tool produces WebP before upload and targets 1200 × 1500 pixels (4:5). This is a sensible maximum presentation size for product cards and detail views while keeping mobile delivery manageable.

### B2 application integration: implemented

The application provides authenticated upload/delete handlers and the owner dashboard uses them for product media. The established flow is:

```text
Owner selects image
  → browser crops to WebP
  → authenticated request to image-management Worker endpoint
  → Worker verifies Supabase user/owner authorization
  → Worker validates file and creates B2 object key
  → Worker writes/replaces/deletes B2 object
  → Worker returns stable `/images/...` URL
  → URL/path is saved to Supabase product/category/offer record
```

The owner dashboard creates collision-safe keys under the following shape; the bulk Stage 3 import uses deterministic keys in the same product namespace:

```text
products/<product-id>/<position>-<random-id>.webp
offers/<offer-id>/<random-id>.webp
categories/<category-id>/<random-id>.webp
```

The database already accepts either a storage path or a direct HTTP(S) URL, which makes the B2 proxy integration non-disruptive.

### Important integration note

The Offer component expects a directly displayable image URL. Offer uploads are converted to WebP and use the B2 upload endpoint; live offer URL behaviour should remain part of release QA.

---

### 8A. Product-image pipeline history and verified import status

This is the operational record for the MALEKA image pipeline. It distinguishes the image-processing workspace from this application repository and preserves the difference between original inventory, final Stage 2 output, and the Stage 3 production import.

#### Separate workspaces

| Workspace | Purpose |
|---|---|
| `E:\Projects\LEADS\mf-pro` | Stage 2 source organisation, OpenAI image processing, captions, batch state, and enhancement output. |
| `E:\Projects\LEADS\12.HILINE` | The MALEKA production application, import scripts, generated local plan, Supabase metadata, and B2 delivery integration. |

Stage 2 was intentionally run outside this production repository. A temporary local copy of the final assets exists at `img_upload/` in this repository to support validation/import; that directory is Git-ignored and must not be committed. Original `OUTPUT` images and enhanced source images are never modified by the Stage 3 scripts.

#### Stage 1 inventory and final Stage 2 source of truth

The manually organised original inventory was: Beds 124, Sofas 119, Wedding Sets 38, Mirrors 29, Shoe Racks & Storage 20, Dining 14, Wardrobes 12, and Seating 6.

After recovery, validation, and removal of non-final material, the final Stage 2 dataset became:

| Category | Final enhanced records |
|---|---:|
| Beds | 124 |
| Dining | 14 |
| Mirrors | 29 |
| Shoe Racks & Storage | 20 |
| Sofas | 115 |
| Wardrobes | 12 |
| Wedding Sets | 32 |
| **Total** | **346** |

There are no Seating records in the final 346-item import set. These final counts—not the earlier intake counts—are the Stage 3 source of truth.

#### Stage 2 enhancement process

Stage 2 used the OpenAI Batch API with GPT Image 2 (`gpt-image-2`) at medium quality and category-specific prompts. The pipeline corrected orientation, removed distracting background material, preserved genuine furniture identity/materials/proportions, and permitted reconstruction only where visible evidence reliably supported it. It explicitly prohibited generic replacement furniture, redesign, changed proportions, invented components, or changed materials/colours.

Final enhanced outputs were RGB JPEGs, intelligently cropped to exact 4:5 at 1600 × 2000. The Stage 3 importer converts these source-preserving enhanced files in memory to the application's 1200 × 1500 WebP production format; it does not overwrite the JPEG source assets.

Wedding Sets used a dedicated prompt that preserves the complete visible composition: bed/headboard, side tables, dressing/wardrobe/mirror, stools or benches, storage, panels, carvings, grain/veneer, upholstery, colours, hardware, and matching design language. Dining, Mirrors, Shoe Racks & Storage, and Wardrobes each used corrected dedicated scripts with category-specific state/error files and a shared-manifest lock for safe concurrent caption updates.

#### Batch processing, credit incident, and recovery

- **Beds:** 124 images began synchronously; 115 succeeded and 9 were deferred by prepaid-credit exhaustion. The recovery image batch `batch_6aaea29c306881908f321e2c03a0dfc1` completed 9/9 with no failures. The last known Beds caption batch state was `batch_6aaea6575e3c8190a3b952e3f9b125da`, `validating`, 0/0 complete; it must not be represented as independently confirmed complete.
- **Sofas:** the final 115-image image batch `batch_6aaeaa5152748190838c2b6f79a31999` completed 115/115 with no failures. A later local `NameError: save_final_image is not defined` was a script recovery bug, not an OpenAI image-processing failure. Restoring `save_final_image()` allowed valid existing batch results to be saved without submitting another Sofa batch. The function converts to RGB, corrects/crops 4:5, resizes to 1600 × 2000, and saves JPEG quality 95.
- **API billing incident:** HTTP 429 resulted from exhausted prepaid OpenAI API credit, not an application integration failure. Credits were added (including a further $5 purchase); an exposed API key was revoked/replaced; OpenAI SDK connectivity was later verified. API billing was separate from the ChatGPT subscription.
- **Accidental deletion/recovery:** two enhanced images were accidentally deleted during the workflow and restored. They are included in the final inventory and must not be reported as permanently missing.

Category scripts use resumable state/error files such as `stage2_batch_state_Dining.json` and `stage2_errors_Dining.json`; the shared `stage2_manifest.json` records source paths, categories, captions, and processing metadata.

#### Stage 3 validation and deterministic plan

Before the production import, the following read-only preparation assets were created:

- [scripts/validate-maleka-import.mjs](scripts/validate-maleka-import.mjs)
- `img_upload/import_plan.json` (local, Git-ignored)

Validation scanned final enhanced files, verified dimensions/aspect/format/size, matched the manifest, verified the seven existing Supabase categories, generated deterministic product UUIDs and B2 keys, and checked existing Supabase/B2 identity conflicts. It performed no upload or database write.

The final validation result was **346 valid, 0 blocked, 0 identity conflicts, 0 existing Supabase UUID conflicts, and 0 existing B2 object-key conflicts**. It produced eight non-blocking warnings across four duplicated captions. Those eight records deliberately remain separate products: no product/view grouping was inferred from caption similarity.

The planned key shape is deterministic: `products/<planned-product-uuid>/0-<source-basename>.webp`. Each record plans one primary image at `sort_order = 0`; an importer-derived deterministic primary-image UUID makes retry handling safe.

#### Stage 3 production import: evidence-backed current state

**Status:** Stage 2 is complete. Stage 3 validation is complete. Stage 3 production import has also been executed successfully.

The historical brief that originally accompanied this report says “Stage 3 production import not yet executed.” That statement is stale and conflicts with repository history, the committed [scripts/import-maleka-products.mjs](scripts/import-maleka-products.mjs), and the verified production result. The factual import record is:

1. A required dry run passed **346/346 ready, 0 blockers**.
2. The first live pass created 342 B2 objects, 342 hidden Supabase products, and 342 primary `product_images` rows. Four B2/network uploads failed transiently; no product/image rows were created for those four.
3. A resumable second pass verified the completed records, uploaded the remaining four objects, and created the remaining four products and primary image records with zero failures.
4. A final read-only dry run reported 346/346 ready, 0 blockers, and 0 remaining uploads/products/image rows required.

Final import totals are **346 B2 WebP uploads, 346 initially hidden/draft Supabase products, and 346 primary `product_images` rows**, with deterministic IDs and object keys preserved. Products may subsequently be made public individually by the owner; current publication state is an operational database state, not a change to the import record.

The importer is intentionally idempotent/resumable. It hashes the planned WebP output, rejects a pre-existing B2 key with different content, rejects conflicting deterministic UUID data, skips matching completed objects/rows, and can safely resume a partial run. It does not alter Stage 2 source files, enhanced images, or `stage2_manifest.json`.

#### Current next step

There is no remaining bulk Stage 3 import to perform. The next operational work is catalogue QA and publishing: review names/categories, choose featured items, set `visible = true` for approved products, test public product pages and mobile delivery, and retain the deterministic plan/import scripts for audit or recovery. Do not create a second plan, re-run Stage 2 enhancement, or infer multi-image product groupings without new source evidence.

---

## 9. Required Supabase setup

Use only [supabase/MALEKA_FRESH_SETUP.sql](supabase/MALEKA_FRESH_SETUP.sql) for a brand-new Supabase project. Do not also apply the older incremental migrations.

### Setup sequence

1. Create a Supabase project.
2. Open **SQL Editor** and run the entire fresh setup file once.
3. In **Authentication → Users**, create the real owner account or sign up through `/owner`.
4. Copy that user’s UUID.
5. Run the final commented `insert into public.user_roles ...` statement in the SQL file after replacing the UUID.
6. Put the project URL and publishable key in the local/environment deployment variables:

```env
VITE_SUPABASE_URL=<project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable anon key>
VITE_SUPABASE_PROJECT_ID=<project ID>
```

7. Test: sign in at `/owner`, add one product, upload an image, mark it visible, then confirm it appears in `/explore`.

### What the setup script does not do

- Create the first owner automatically (doing that safely requires a real Auth user UUID)
- Add fictional products, offers, or prices
- Configure deployment environment variables for the implemented B2 upload/delete endpoints
- Publish a production domain

---

## 10. End-to-end dependency chains

The system is designed around real dependency chains rather than disconnected screens.

### Product catalogue flow

```text
Real product photography
  → Admin crop / WebP conversion
  → Private Backblaze B2 via Cloudflare Worker (production target)
  → Product + product_images records
  → Category assignment and published visibility
  → Public catalogue grid
  → Product detail page
  → Product-specific WhatsApp / phone enquiry
```

### Offer flow

```text
Admin creates offer
  → crop/upload promotional image
  → offer record saved
  → owner activates it
  → active-offer query returns record(s)
  → one offer = card / multiple offers = carousel
  → floating offer link becomes visible
  → offer-specific WhatsApp enquiry
```

### Category flow

```text
Admin creates or edits category
  → category order / visibility / image saved
  → products assigned to category
  → category appears in selector and Explore filter
  → filtered product grid
  → product detail and enquiry
```

---

## 11. Routes and key source files

| Route / file | Responsibility |
|---|---|
| `src/routes/index.tsx` | Homepage: hero, offers, categories, editorial collection, wedding section, showroom, contact map |
| `src/routes/explore.tsx` | Filterable public catalogue |
| `src/routes/product.$id.tsx` | Product details and enquiry actions |
| `src/routes/visit.tsx` | Address, hours, contact, satellite map |
| `src/routes/owner.tsx` | Owner authentication, product/admin controls, offers |
| `src/components/site/Header.tsx` | Sticky brand navigation |
| `src/components/site/Footer.tsx` | Contact and secondary navigation |
| `src/components/site/ImageCropDialog.tsx` | Fixed 4:5 client crop and WebP conversion |
| `src/components/site/OfferSection.tsx` | Active offer conditional rendering/carousel |
| `src/components/site/WeddingSection.tsx` | Wedding package presentation and filtered routing |
| `src/lib/business.ts` | Single source for business identity/contact/map URLs |
| `src/lib/products.ts` | Product types, category constants, public fetch and signed-image resolution |
| `src/lib/offers.ts` | Active offers and WhatsApp offer enquiry helper |
| `supabase/MALEKA_FRESH_SETUP.sql` | Complete new-project database/bootstrap script |

---

## 12. Technical stack

- React 19
- TypeScript
- TanStack Start / TanStack Router
- TanStack Query for client data fetching/cache invalidation
- Tailwind CSS
- Lucide icons
- Supabase Auth, PostgreSQL, RLS, and temporary compatibility storage
- Backblaze B2 private object storage
- Cloudflare Worker image proxy
- Cloudflare-compatible Nitro build target

The application builds with:

```bash
npm run build
```

The build has passed after the current changes.

---

## 13. Deployment and operations plan

### Before launch

- Confirm the existing Supabase setup and owner role
- Verify the imported catalogue and approve publication state
- Test every public and owner workflow
- Configure production Supabase variables
- Verify WhatsApp number, phone links, map, address, and hours on mobile
- Add legal/privacy text if required by the business

### Backblaze B2 / Cloudflare Worker phase

The private-image read path is live and verified through `maleka-image-proxy`. The application-side authenticated management handlers are implemented and:

- Receives crop-processed uploads from the owner dashboard
- Checks a valid Supabase JWT and owner role
- Enforces MIME type and size limits
- Creates collision-safe B2 object keys
- Uploads, replaces, and deletes B2 objects
- Returns a stable Worker `/images/...` URL for Supabase to store
- Retains cache/content-type headers for public delivery
- Never exposes B2 secrets in the browser

### Deployment target

The current build emits a Cloudflare-compatible Nitro output. The intended production path is Cloudflare Pages/Workers with a custom HTTPS domain. A deployment should only follow a successful build plus production environment-variable configuration.

---

## 14. Scope boundaries

### In scope

- Product discovery and direct enquiry
- Wedding furniture packages
- Active promotional offers
- Owner-managed catalogue
- Public product/category pages
- Secure authenticated data writes
- Image processing and private B2/CDN delivery
- Local SEO-oriented business information

### Explicitly out of scope

- Cart
- Checkout
- Online payment
- Customer order management
- Real-time stock/inventory
- Warehouse/POS integration
- Automated delivery promise/date calculation
- Unsupported product claims or invented pricing

These can be added later without replacing the core catalogue architecture.

---

## 15. Operational details

### Exactly what the owner can do
- Read and manage all catalogue records (create, edit, delete).
- Upload, replace, set primary, and remove approved product images (1–4 per product).
- Toggle public visibility and featured status for products.
- Create, update, toggle, and delete promotional offers.
- Manage categories.

### Exactly what the public user can do
- Read visible categories, active offers, and visible products.
- Use a case-insensitive search bar to find products by name.
- View optimized product image galleries and video presentations.
- Send direct WhatsApp enquiries prepopulated with specific product, offer, or wedding set context.
- Call the showroom directly or view satellite map directions.

### What is deliberately NOT supported
- No shopping cart, checkout, or online payments.
- No customer order management or account creation.
- No real-time stock/inventory tracking or warehouse/POS integration.
- No automated delivery promise/date calculation.

### Image standards
- **Product-image standards**: Enforced fixed 4:5 aspect ratio. Client-side cropped, scaled to a maximum of 1200×1500 pixels, and converted to highly optimized WebP format before upload to ensure uniformity across the catalogue grid.
- **Offer-image standards**: Uploaded in their original aspect ratio (no fixed cropping) to preserve promotional text and composition, but still optimized and converted to WebP.

### Backup/cleanup behavior
- **Orphaned Images**: If an error occurs during product creation/upload, or if an owner explicitly deletes a product or image, an `/api/b2-delete` request is issued to automatically remove the backing object from the B2 bucket. This prevents accumulating orphaned image data over time.
- Database records strictly cascade or safely remove dependencies when parent entities are deleted.

---

## 16. Recommended next implementation milestones

1. **Catalogue QA and publication:** review the imported product names/categories, make approved products visible, and choose featured items.
2. **Finish dashboard controls:** complete category edit/order and remaining offer-management ergonomics.
3. **SEO and launch QA:** verify the canonical production domain, Open Graph sharing image, sitemap/robots delivery, mobile enquiry flows, map directions, image delivery, and owner authorization after deployment.
4. **Operational backup:** retain the ignored Stage 2 asset copy and deterministic plan outside Git according to the business backup policy.

---

## 17. Current-status snapshot

| Area | Status | Notes |
|---|---|---|
| Maleka branding/contact/rating | Implemented | Uses real supplied location, phone numbers, hours, rating and review count. |
| Hero background video | Implemented | Uses 4 optimized responsive formats (WebM/MP4) and respects Save-Data. |
| Public homepage/catalogue/detail | Implemented | Real imported catalogue data is present; publication is controlled by product visibility. |
| Wedding set routing | Implemented | Routes to `Wedding Sets` filter. |
| Satellite map | Implemented | Google map embed uses satellite parameter. |
| Product crop + WebP | Implemented | Fixed 4:5 browser crop; accepts four files. |
| Supabase schema and RLS | Implemented | Real catalogue records and ordered primary product images are present. |
| Product gallery database/UI | Implemented | Ordered `product_images` are rendered on the public product detail page. |
| Dashboard search/filter/hide UI | Implemented | Product visibility/featured controls exist; category visibility persists through Supabase. |
| Full category editor UI | Partial | Visibility is shared/persisted; image/order editing remains a future enhancement. |
| B2 private bucket | Implemented | `maleka-furniture-images`; US East; private; encryption enabled; Object Lock disabled. |
| B2 Worker image retrieval | Implemented and verified | `maleka-image-proxy` streams `/images/logo.webp` from the private bucket; B2 secrets remain in Cloudflare. |
| B2 admin upload/delete integration | Implemented | Protected B2 handlers are used by owner product/offer media flows. |
| Real inventory and photography | Imported | 346 Stage 2 enhanced source records were imported through the deterministic Stage 3 process. |

This document is intended to be the operational picture of the project: what the showroom site is, how a visitor and owner move through it, where data is stored, what is protected, and which next steps unlock production operation.
