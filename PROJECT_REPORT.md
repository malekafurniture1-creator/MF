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

The site already contains the public user interface and the initial Supabase data model. The new account bootstrap script is at [supabase/MALEKA_FRESH_SETUP.sql](supabase/MALEKA_FRESH_SETUP.sql). It creates the complete initial database, a temporary private storage bucket, categories, and security policies without adding fake catalogue items. Production image delivery has now been proven separately through a private Backblaze B2 bucket and Cloudflare Worker proxy; application upload integration is the next development step.

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

The hero’s composition, messaging, video treatment, and primary actions were preserved as requested; only the real business rating/count and city label were updated.

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

The database supports up to four ordered product images. The current public detail component shows the primary product image; expanding it to render the stored gallery is a clearly scoped next UI task after the database is connected and populated.

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

The product interface currently supports:

- Create a product
- Edit a product
- Delete a product
- Set product name, description, category, featured status, and sort order
- Upload one to four product images
- Create WebP output from uploads
- Set the first image as primary
- Store additional images in `product_images`
- Mark product featured

During upload, the admin selects one to four input images. Each image is placed in a sequential crop dialog with a fixed **4:5** frame. The user can adjust zoom, horizontal position, and vertical position. The browser renders the result to an optimized WebP file before upload.

### Offer maintenance

The offer area supports:

- Create offer
- Upload/crop a promotional image as WebP
- Activate/deactivate an offer
- Delete an offer

The database also supports headline, supporting copy, original price, offer price, CTA label, and order. These fields should be surfaced in the owner form as the next small dashboard enhancement.

### Category maintenance

The dashboard currently presents the defined category groups and their active state. The underlying database supports category image, visibility, and sort order. Editing those fields in the dashboard is still pending; it should be implemented before day-to-day category administration begins.

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

### Current application state

The fresh setup script still creates a private Supabase Storage bucket named `product-images`, and the current React uploader still writes there. This is temporary compatibility storage; it is not the final production image route. The product resolver already passes through direct HTTPS URLs, so a Worker image URL can be saved in `products.image_url` without changing the table schema.

The crop tool produces WebP before upload and targets 1200 × 1500 pixels (4:5). This is a sensible maximum presentation size for product cards and detail views while keeping mobile delivery manageable.

### B2 application-integration work still pending

The verified Worker currently reads private B2 files; the React app and owner dashboard have not yet been switched to upload, replace, and delete through it. The intended production flow is:

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

Recommended object-key shape:

```text
products/<product-id>/<position>-<random-id>.webp
offers/<offer-id>/<random-id>.webp
categories/<category-id>/<random-id>.webp
```

The database already accepts either a storage path or a direct HTTP(S) URL, which makes the B2 proxy integration non-disruptive.

### Important integration note

The current Offer component expects a directly displayable image URL, while the initial offer uploader stores a private Supabase Storage path. Offer uploads should be migrated to store the Worker image URL before live offers are activated.

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
- Configure the B2 upload/delete endpoints or connect the React dashboard to them
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

- Run fresh Supabase setup
- Create and authorize one owner account
- Add actual product data and real Maleka photography
- Test every public and owner workflow
- Configure production Supabase variables
- Verify WhatsApp number, phone links, map, address, and hours on mobile
- Add legal/privacy text if required by the business

### Backblaze B2 / Cloudflare Worker phase

The private-image read path is already live and verified through `maleka-image-proxy`. The remaining implementation is an authenticated management API on the Worker that:

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

## 15. Recommended next implementation milestones

1. **Connect Supabase:** run the fresh script, set environment variables, create the owner role, and validate one real product record.
2. **Connect owner uploads to B2:** add protected Worker upload, replace, and delete endpoints; store returned Worker URLs in Supabase. Do not expose B2 credentials or upload all catalogue images manually before this is ready.
3. **Finalize B2 object keys:** adopt collision-safe paths such as `products/<product-id>/<position>-<random-id>.webp`, `offers/<offer-id>/<random-id>.webp`, and `categories/<category-id>/<random-id>.webp`.
4. **Finish dashboard controls:** searchable product list; category filter; hide/show switch; per-image reorder/remove/primary controls; category edit/hide/order form; offer supporting-copy/price/order fields.
5. **Render product galleries:** load ordered `product_images` in the product detail route and provide thumbnail selection.
6. **Populate real catalogue:** add actual Maleka photography, correct names, descriptions, categories, tags, visibility, and display order. Do not fabricate 250–300 product records.
7. **SEO completion:** production canonical URL, Open Graph image, sitemap, robots rules, structured local-business JSON-LD, and Google Business Profile link.
8. **Final QA:** test desktop/tablet/mobile, Android/iOS WhatsApp links, map directions, admin authorization, empty states, slow image loading, and no-active-offer behaviour.

---

## 16. Current-status snapshot

| Area | Status | Notes |
|---|---|---|
| Maleka branding/contact/rating | Implemented | Uses real supplied location, phone numbers, hours, rating and review count. |
| Public homepage/catalogue/detail | Implemented | Public catalogue requires real Supabase data. |
| Wedding set routing | Implemented | Routes to `Wedding Sets` filter. |
| Satellite map | Implemented | Google map embed uses satellite parameter. |
| Product crop + WebP | Implemented | Fixed 4:5 browser crop; accepts four files. |
| Supabase schema and RLS | Ready | Categories are seeded; products, product images and offers await real catalogue data. |
| Product gallery database | Ready | Detail gallery display remains to be wired. |
| Full dashboard search/filter/hide UI | Pending | Schema supports it; UI is incomplete. |
| Full category editor UI | Pending | Schema supports it; UI is incomplete. |
| B2 private bucket | Implemented | `maleka-furniture-images`; US East; private; encryption enabled; Object Lock disabled. |
| B2 Worker image retrieval | Implemented and verified | `maleka-image-proxy` streams `/images/logo.webp` from the private bucket; B2 secrets remain in Cloudflare. |
| B2 admin upload/delete integration | Pending | Current owner uploader still writes to temporary Supabase Storage. |
| Real inventory and photography | Pending | Must be supplied by Maleka; no placeholder inventory should be treated as real. |

This document is intended to be the operational picture of the project: what the showroom site is, how a visitor and owner move through it, where data is stored, what is protected, and which next steps unlock production operation.
