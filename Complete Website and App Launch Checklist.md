**Complete Website and App Launch Checklist**

Use this document as a master checklist after completing a website or web application. Mark each item as **Done**, **Pending**, **Not Applicable**, or **Needs Fixing**.

**Project:**  
**Domain:**  
**Launch date:**  
**Reviewer:**  
**Last audit date:**

**1\. Project and Content Readiness**

**Project configuration**

- The production domain is connected correctly.
- The website is running on the correct hosting platform.
- The production environment is separate from development and staging.
- All production environment variables are configured.
- API keys and secrets are stored securely as environment variables.
- Development credentials and test accounts have been removed or protected.
- Debug mode is disabled in production.
- Console logs do not expose sensitive information.
- The correct logo, colors, fonts, and brand assets are used.
- The website has a consistent design on every page.
- All planned pages have been created.
- All planned features have been implemented.
- All pages contain final content.
- Placeholder text such as "Lorem ipsum," "Coming soon," and "Your text here" has been removed.
- Placeholder images have been replaced.
- Dummy names, phone numbers, addresses, and emails have been removed.
- Test products, services, blog posts, and user accounts have been removed.
- Spelling and grammar have been checked.
- Content has been reviewed for accuracy.
- Brand claims, pricing, offers, and contact information are correct.
- Copyright permissions have been confirmed for images, videos, icons, and fonts.
- The website clearly explains what the business offers.
- The target audience can understand the main offer quickly.
- The primary call to action is clear.

**Page content**

For every important page:

- The page has one clear purpose.
- The page has a clear heading.
- The page has an appropriate call to action.
- The content is unique and not copied from another page.
- The content answers the visitor's likely questions.
- The page includes relevant internal links.
- The page includes correct contact or conversion information.
- The page has no unfinished sections.
- The page has no unnecessary duplicate content.
- The page displays correctly when shared or bookmarked.

**2\. Website Structure and Navigation**

- The main navigation is visible and understandable.
- The logo links to the homepage.
- All navigation links lead to the correct pages.
- Dropdown menus work correctly.
- The mobile navigation menu opens and closes correctly.
- The mobile menu can be closed by tapping outside it or using a close button.
- The mobile menu does not remain over the page after navigation.
- The current page is visually indicated where appropriate.
- Important pages can be reached within a reasonable number of clicks.
- The footer is present on all required pages.
- Footer links work correctly.
- Social media links open the correct profiles.
- External links open as intended.
- Links are descriptive rather than vague text such as "Click here."
- Buttons look and behave like buttons.
- Links look and behave like links.
- There are no dead-end pages.
- There are no duplicate or unnecessary menu items.
- Breadcrumbs are added where they improve navigation.
- Search functionality works, if included.
- Filters and sorting work correctly, if included.
- Pagination works correctly, if included.

**3\. Mobile and Responsive Design**

Test the website on real devices where possible, not only by resizing a desktop browser.

**Layout**

- The website works on small mobile screens.
- The website works on tablets.
- The website works on laptops and desktops.
- The website works in portrait orientation.
- The website works in landscape orientation.
- There is no horizontal scrolling.
- No element extends outside the viewport.
- Mobile overflow issues have been fixed.
- Long words and URLs do not break the layout.
- Images do not overflow their containers.
- Tables are responsive or scrollable within their own container.
- Modals fit inside the mobile viewport.
- Pop-ups do not cover essential content.
- Fixed elements do not cover buttons, forms, or text.
- The page does not jump unexpectedly during loading.
- Appropriate mobile breakpoints have been implemented.
- Spacing is comfortable on touch screens.
- Text is readable without zooming.
- Buttons are large enough to tap easily.
- Form fields are easy to select and complete.
- The mobile CTA is visible when appropriate.
- The sticky mobile CTA does not block content or browser controls.
- The mobile menu works on all relevant pages.

**Mobile testing**

- Test the homepage on a real Android device.
- Test the website on a real iPhone or iPad where possible.
- Test on both Wi-Fi and mobile data.
- Test slow network conditions.
- Test scrolling from top to bottom.
- Test every form on mobile.
- Test phone links on mobile.
- Test email links on mobile.
- Test image galleries, sliders, and carousels.
- Test login, registration, and password-reset flows.
- Test checkout or payment flows, if applicable.
- Test the mobile menu after navigating backward and forward.
- Confirm that the keyboard does not hide important form fields.
- Confirm that orientation changes do not break the layout.

**4\. SEO and Keyword Planning**

**Keyword research**

- Keyword research has been completed.
- Primary keywords have been identified.
- Secondary and supporting keywords have been identified.
- Search intent has been identified for each important keyword.
- Local keywords have been identified where relevant.
- Competitor keywords have been reviewed.
- Keywords have been grouped into keyword clusters.
- Each keyword cluster has a suitable target page.
- Keyword cannibalization has been avoided.
- Keywords are used naturally rather than excessively.
- Content is written for users first, not only search engines.

**Website architecture**

- The homepage targets the main business or brand topic.
- A separate page exists for each major service.
- A separate page exists for each important location served.
- Location pages contain genuinely unique and useful information.
- Service pages contain genuinely unique and useful information.
- Location pages are not mass-generated with only the city name changed.
- Service and location pages are linked logically.
- Blog or resource pages support the main service topics.
- Each page has a clearly defined target keyword or topic.
- Each important page has a unique URL.
- URLs are short, readable, and descriptive.
- URLs use lowercase characters consistently.
- Unnecessary parameters and duplicate URLs are controlled.
- Redirects are configured for changed URLs.
- Canonical URLs are configured for indexable pages.
- Staging and development URLs are not indexed.

**Page titles and descriptions**

For every indexable page:

- The page has a unique meta title.
- The meta title accurately describes the page.
- The primary topic appears naturally in the title.
- The brand name is included where useful.
- The title is not duplicated on another page.
- The page has a unique meta description.
- The meta description accurately describes the page.
- The meta description encourages a relevant click.
- The meta description is not stuffed with keywords.
- Private, duplicate, or utility pages have the correct indexing directives.
- Page titles visible in browser tabs are accurate.
- Heading structure is logical.
- Each page has one clear main heading where appropriate.
- Subheadings are used in the correct order.

Google describes the meta description as a short description of a page and supports page-level robots directives such as noindex; verify these settings page by page.\[[developers.google](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)\]

**Images and social sharing**

- Every meaningful image has descriptive alt text.
- Decorative images use appropriate empty alt attributes.
- Alt text describes the image's purpose rather than stuffing keywords.
- Open Graph title is configured.
- Open Graph description is configured.
- Open Graph image is configured.
- Social sharing images have the correct dimensions and appearance.
- Twitter/X card metadata is configured where relevant.
- Shared links show the correct title, description, and image.
- Images have descriptive file names where practical.

**Crawlability and indexing**

- robots.txt exists at the root domain.
- robots.txt does not accidentally block the entire website.
- Staging rules such as Disallow: / have been removed from production.
- Sensitive paths are not exposed unnecessarily.
- sitemap.xml exists and loads correctly.
- The sitemap includes only canonical, indexable URLs.
- The sitemap does not contain broken URLs.
- The sitemap is referenced in robots.txt.
- Google Search Console has been added.
- The correct domain property has been verified in Google Search Console.
- The XML sitemap has been submitted in Google Search Console.
- Bing Webmaster Tools has been added.
- The website has been verified in Bing Webmaster Tools.
- The sitemap has been submitted to Bing Webmaster Tools.
- Important pages are submitted for indexing where appropriate.
- Important pages are not blocked by noindex.
- Important pages are not blocked by robots directives.
- Canonical tags point to the correct production URLs.
- Internal links use the correct production domain.
- Search Console coverage and indexing reports have been reviewed.
- Crawl errors have been fixed.
- Duplicate-page warnings have been reviewed.
- Mobile usability issues have been reviewed.
- Rich-result or structured-data errors have been reviewed.
- Indexing has been checked after launch.

Do not assume that submitting a sitemap guarantees indexing; use Search Console and Bing Webmaster reports to verify crawl and indexing status.

**5\. Analytics and Tracking**

- Google Analytics has been installed.
- Google Analytics is connected to the correct property.
- The production website sends data to the correct property.
- Test traffic appears in the real-time report.
- Internal testing traffic is excluded where appropriate.
- Google Tag Manager has been installed.
- Google Tag Manager is connected to the correct container.
- The container is published in production.
- Tags, triggers, and variables have been reviewed.
- Duplicate analytics tags have been removed.
- Form-submission events are tracked.
- Phone-click events are tracked where useful.
- Email-click events are tracked where useful.
- CTA-click events are tracked where useful.
- Purchase, booking, or lead events are tracked where applicable.
- Conversion events are marked correctly.
- Microsoft Clarity has been installed where appropriate.
- Clarity recordings and heatmaps work correctly.
- Sensitive fields are masked in session recordings.
- Analytics tools respect applicable privacy and consent requirements.
- Analytics has been tested on desktop and mobile.
- Analytics does not load duplicate page views.
- Analytics does not expose personal or sensitive data.

**6\. Performance and Image Optimization**

- All images have been compressed.
- Images are served in suitable dimensions.
- WebP or AVIF is used where suitable.
- Images are lazy-loaded when appropriate.
- Above-the-fold images are not unnecessarily lazy-loaded.
- Images have width and height attributes or reserved space.
- Large background images have been optimized.
- Unused images have been removed.
- Videos are compressed and optimized.
- Fonts are optimized.
- Unused CSS has been removed where practical.
- Unused JavaScript has been removed where practical.
- JavaScript bundles are optimized.
- Code splitting is used where appropriate.
- Third-party scripts have been reviewed.
- Unnecessary tracking or widget scripts have been removed.
- Browser caching is configured.
- Compression is enabled on the server.
- A CDN is used where appropriate.
- Slow API requests have been reviewed.
- Database queries have been reviewed where applicable.
- Loading states are shown while content is being fetched.
- Skeleton screens or progress indicators are used where helpful.
- The website remains usable on a slow connection.
- Performance has been tested on mobile.
- Core Web Vitals or equivalent performance metrics have been reviewed.
- No major layout shifts occur during loading.
- The page becomes interactive within an acceptable time.

**7\. Forms, Feedback, and Conversion**

**Forms**

- Every form has a clear purpose.
- Every field has a visible label.
- Placeholder text is not used as the only field label.
- Required fields are clearly indicated.
- Field types are appropriate.
- Email fields validate email format.
- Phone fields validate phone format appropriately.
- Numeric fields reject invalid characters.
- Character limits are configured where needed.
- Users can paste into fields.
- Password managers work correctly.
- Browser autofill works correctly where appropriate.
- Validation occurs on both the frontend and backend.
- Server-side validation cannot be bypassed.
- Form errors identify the field that needs correction.
- Error messages are clear and actionable.
- Form errors are accessible to screen readers.
- Invalid fields use suitable accessibility attributes.
- Submitted data is sanitized.
- Spam protection is enabled where needed.
- CAPTCHA or bot protection does not block legitimate users.
- Duplicate submissions are prevented where necessary.
- Forms work on mobile.
- Forms work on slow connections.
- Form submissions reach the correct email or database.
- Success messages are displayed after submission.
- A thank-you page is displayed where appropriate.
- Users are not left wondering whether the form was submitted.
- Failed submissions can be retried safely.
- Sensitive information is not shown in URLs.
- Confirmation emails are sent where applicable.
- The sender and reply-to addresses are configured correctly.

**Contact actions**

- Email addresses use clickable mailto: links.
- Phone numbers use clickable tel: links.
- Phone numbers are formatted consistently.
- WhatsApp or other messaging links work where included.
- Contact forms show the correct business details.
- The real business address is displayed where appropriate.
- Business hours are accurate.
- Map links or embedded maps point to the correct location.
- CTA buttons lead to the intended action.
- CTA buttons are visible above the fold where appropriate.
- CTAs are repeated at sensible points on long pages.
- Conversion actions are trackable in analytics.

**8\. User Experience States**

**Loading states**

- Every asynchronous page has a loading state.
- Buttons show a loading state during submission.
- Users cannot accidentally submit a form multiple times.
- Data-fetching errors do not leave an infinite spinner.
- Loading states preserve layout stability.
- Loading indicators are understandable and accessible.

**Empty states**

- Empty search results have a helpful message.
- Empty product or service lists have a helpful message.
- Empty dashboards have an onboarding message or next step.
- Empty bookings, orders, or saved items have an appropriate explanation.
- Empty states include a useful action where applicable.
- Empty states do not look like broken pages.

**Error states**

- User-facing errors are written in plain language.
- Errors explain what the user can do next.
- Technical stack traces are hidden from users.
- API failures are handled gracefully.
- Network failures are handled gracefully.
- Permission errors are handled correctly.
- Session-expiry errors redirect users appropriately.
- Payment errors are handled safely where applicable.
- Error messages do not reveal sensitive system details.
- Errors are logged securely for debugging.
- Error monitoring is configured where appropriate.

**Success states**

- Successful actions display a success message.
- Success messages are visible long enough to read.
- Success messages are accessible.
- Users are redirected correctly after important actions.
- Confirmation pages contain the relevant next steps.
- Emails or notifications are sent where promised.

**404 and utility pages**

- A custom 404 page exists.
- The custom 404 page returns an actual HTTP 404 status.
- The 404 page explains that the page was not found.
- The 404 page links to the homepage.
- The 404 page offers useful navigation or search.
- The 404 page matches the brand design.
- Server errors display a suitable fallback page.
- Maintenance pages are prepared if needed.

**9\. Accessibility**

- The website can be navigated using only a keyboard.
- Keyboard focus is visible.
- Focus order is logical.
- Users can reach and operate all interactive elements with a keyboard.
- Buttons and links have accessible names.
- Images have appropriate alt text.
- Form fields have visible labels.
- Form error messages are associated with their fields.
- Color is not the only way information is communicated.
- Text has sufficient contrast.
- Buttons and links have sufficient contrast.
- Text can be enlarged without breaking the layout.
- Content remains usable at increased browser zoom.
- Headings follow a logical hierarchy.
- Landmark elements are used appropriately.
- Modals trap focus correctly and return focus after closing.
- Menus are usable with a keyboard and screen reader.
- Carousels can be paused or controlled.
- Animations can be reduced or disabled where appropriate.
- Videos have captions where necessary.
- Tables have suitable headings.
- ARIA is used only where necessary and correctly.
- Decorative icons are hidden from assistive technology where appropriate.
- Automated accessibility testing has been completed.
- Manual accessibility testing has been completed.

A practical QA standard is to ensure form fields have real labels, not placeholder-only labels, and to associate errors with fields for assistive technologies.\[[verlua](https://www.verlua.com/resources/pre-launch-qa-checklist)\]

**10\. Browser, Device, and Functional Testing**

- The website works in Chrome.
- The website works in Safari.
- The website works in Firefox.
- The website works in Edge.
- The website works on Android browsers.
- The website works on iOS browsers.
- The homepage loads correctly.
- Every important page loads correctly.
- Browser back and forward buttons work.
- Refreshing a page does not cause unexpected errors.
- Deep links work correctly.
- Query parameters work correctly where used.
- Authentication redirects work correctly.
- Logout works correctly.
- Forms work correctly.
- Search works correctly.
- Filters and sorting work correctly.
- Pagination works correctly.
- File uploads work correctly where applicable.
- Downloads work correctly where applicable.
- Maps and embedded media work correctly.
- Payment or booking flows work correctly where applicable.
- Emails and notifications are sent correctly.
- All buttons have been tested.
- All links have been tested.
- No JavaScript errors appear in the browser console.
- No failed network requests remain without explanation.
- No broken images remain.
- No accidental alerts, test banners, or developer messages remain.

**11\. Authentication and Login Security**

This section applies to websites or applications with user accounts.

**Session and token security**

- Session tokens are not stored in localStorage unless there is a documented security reason and appropriate mitigation.
- Sensitive session credentials use secure, HttpOnly cookies where appropriate.
- Cookies use the Secure attribute in production.
- Cookies use an appropriate SameSite setting.
- Session identifiers are random and generated using a cryptographically secure method.
- Tokens are not placed in URLs.
- Tokens are not exposed in logs.
- Tokens are not included in error messages.
- A new session identifier is issued after successful login.
- Sessions expire after an appropriate idle period.
- Sessions have an absolute expiration time.
- Logout invalidates the session on the server.
- Password changes invalidate or review existing sessions.
- Account compromise can be mitigated by revoking sessions.
- Refresh tokens are rotated where applicable.
- CSRF protection is implemented where cookie-based authentication requires it.
- CORS allows only trusted origins.
- HTTPS is enforced across the entire application.

OWASP recommends session expiration controls and secure session handling to reduce the time available for session hijacking and misuse.\[[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)\]\[[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)\]

**Authorization**

- Authentication is checked on the server.
- Authorization is checked on the server.
- Admin authorization is not based only on frontend logic.
- Hidden buttons are not treated as a security control.
- Frontend route guards are supplemented by backend authorization.
- Every admin API endpoint checks the user's role.
- Every sensitive database operation checks permissions.
- Regular users cannot access admin data.
- Regular users cannot call admin APIs directly.
- Users cannot modify their own role through a client request.
- Object-level access control prevents users from accessing another user's records.
- Privilege escalation attempts are rejected.
- Authorization tests have been completed.
- Unauthorized requests return appropriate errors without exposing sensitive details.

**Email verification and two-factor authentication**

- Email verification is implemented where required.
- Verification links expire.
- Verification tokens are single-use.
- Verification tokens are cryptographically secure.
- Used verification tokens are invalidated.
- Sensitive actions can require a verified email address.
- Two-factor authentication is enabled for administrators.
- Two-factor authentication is available for regular users where appropriate.
- Two-factor authentication secrets are stored securely.
- Two-factor codes expire quickly.
- Two-factor codes cannot be reused.
- Two-factor attempts are rate-limited.
- Recovery codes are generated securely.
- Recovery codes are displayed only when appropriate.
- Recovery codes are stored securely.
- Users can safely replace or disable an authenticator.
- High-risk security changes require re-authentication.
- Account-recovery flows are protected from takeover.
- The application does not reveal whether an account exists.

**Login and password-reset protection**

- Login attempts are rate-limited per IP address.
- Login attempts are rate-limited per account identifier.
- Password-reset requests are rate-limited.
- Registration requests are rate-limited.
- Email-verification requests are rate-limited.
- Two-factor verification attempts are rate-limited.
- Progressive delays are used after repeated failures.
- Temporary lockouts are implemented carefully where appropriate.
- Bot protection is used when suspicious activity is detected.
- Generic login and password-reset messages are used.
- Password-reset tokens are single-use.
- Password-reset tokens expire.
- Password-reset tokens are not exposed in logs.
- Password-reset sessions are invalidated after use.
- Password-reset links use HTTPS.
- Password-reset forms do not reveal whether an account exists.
- Brute-force testing has been performed safely.
- Rate limits cannot be bypassed through frontend changes.

**Password security**

- Passwords are never stored in plain text.
- Passwords are hashed using Argon2id, bcrypt, or scrypt.
- Password hashes use secure parameters.
- Long passphrases are allowed.
- Common passwords are rejected.
- Breached passwords are checked where appropriate.
- Password composition rules do not encourage predictable patterns.
- Password managers are supported.
- Users can paste passwords.
- Password reset requires a secure, time-limited token.
- Password changes require confirmation of the new password.
- Password changes trigger appropriate notifications.
- Users can revoke other sessions after changing a password.
- Passwords are not sent in emails.
- Passwords are not written to logs.
- Password fields are not accidentally included in analytics or recordings.

**12\. Application and Data Security**

- All production traffic uses HTTPS.
- HTTP redirects to HTTPS.
- TLS certificates are valid and auto-renewal is configured.
- Security headers have been reviewed.
- Content Security Policy has been considered and configured where practical.
- Clickjacking protection is configured.
- MIME-sniffing protection is configured.
- Referrer policy is configured appropriately.
- Permissions policy is configured appropriately.
- Input is validated on the server.
- User input is sanitized before display.
- SQL or NoSQL injection protections are in place.
- Cross-site scripting protections are in place.
- Cross-site request forgery protections are in place where needed.
- File uploads restrict file type and size.
- Uploaded files are renamed safely.
- Uploaded files cannot execute server-side code.
- Server-side request forgery risks have been reviewed.
- API requests validate authentication and authorization.
- API payload sizes are limited.
- Sensitive API endpoints have rate limits.
- Sensitive data is encrypted in transit.
- Sensitive data is encrypted at rest where appropriate.
- Database access is restricted.
- Production database credentials are protected.
- Backups are configured.
- Backups have been tested by restoring them.
- Data retention rules have been defined.
- Personal data is collected only when necessary.
- Personal data is not exposed in URLs.
- Personal data is not sent to analytics unnecessarily.
- Error messages do not expose stack traces or database details.
- Dependencies have been updated and audited.
- Unused dependencies have been removed.
- Admin accounts are limited.
- Admin passwords are strong and protected with two-factor authentication.
- Malware monitoring or security monitoring is configured where appropriate.
- Security logs are protected from unauthorized access.

**13\. Legal, Privacy, and Trust**

- A privacy policy page has been added.
- A terms and conditions page has been added.
- A cookie policy has been added where required.
- A cookie-consent banner has been added where required.
- The cookie banner explains the relevant categories of cookies.
- Non-essential tracking waits for consent where required.
- Users can change or withdraw consent where required.
- Privacy-policy links are visible in the footer.
- Terms links are visible in the footer.
- Contact information is accurate.
- A real business address is displayed where appropriate.
- Business registration or license information is displayed where legally required.
- Refund, cancellation, and shipping policies are displayed where applicable.
- Payment information is handled by a trusted payment provider where appropriate.
- Testimonials and reviews are genuine.
- Marketing claims are accurate and supportable.
- The website identifies how submitted information is used.
- Forms include consent language where appropriate.
- Users can contact the business about privacy requests.
- Legal pages have been reviewed for the target market and jurisdiction.

**14\. Launch-Day Checklist**

- Final backup has been created.
- The latest approved version has been deployed.
- The production domain opens correctly.
- HTTPS is working.
- The www and non-www versions redirect consistently.
- The correct canonical domain is configured.
- Staging access is disabled or protected.
- Search engines are not blocked accidentally.
- robots.txt is accessible.
- sitemap.xml is accessible.
- Google Search Console is verified.
- Bing Webmaster Tools is verified.
- The sitemap has been submitted.
- Google Analytics is receiving traffic.
- Google Tag Manager is published and working.
- Microsoft Clarity is working where installed.
- Forms have been tested in production.
- Email notifications have been tested.
- Phone and email links have been tested.
- The homepage has been tested on mobile.
- Login and account flows have been tested.
- Payment or booking flows have been tested where applicable.
- A 404 URL has been tested.
- No critical console errors remain.
- No broken links remain.
- No placeholder content remains.
- No test data is visible.
- Monitoring and alerts are active.
- The launch has been recorded with the date and version number.

**15\. Post-Launch Monitoring**

**First 24–48 hours**

- Confirm the website remains online.
- Check uptime monitoring.
- Check server and application error logs.
- Check analytics data.
- Confirm contact forms are delivering messages.
- Confirm successful conversions are being recorded.
- Check Search Console for crawl errors.
- Check Bing Webmaster Tools for crawl errors.
- Check broken links again after deployment.
- Check that redirects work.
- Check mobile layout on real devices.
- Check page speed after production deployment.
- Check for unexpected traffic spikes.
- Check for repeated failed login attempts.
- Check for suspicious password-reset requests.
- Confirm backups are running.

**First 7–30 days**

- Review indexed pages.
- Review pages excluded from indexing.
- Review search queries and impressions.
- Review click-through rates.
- Review conversion rates.
- Review popular and underperforming pages.
- Review Microsoft Clarity recordings for usability problems.
- Fix unexpected mobile issues.
- Fix high-exit or high-abandonment pages.
- Update weak titles and meta descriptions.
- Improve pages that receive impressions but few clicks.
- Add content to pages that do not satisfy search intent.
- Review security logs.
- Review dependency updates.
- Test backup restoration.
- Schedule recurring technical audits.

**Final Project Status**

| **Area**                                  | **Done** | **Pending** | **Needs Fixing** | **N/A** |
| ----------------------------------------- | -------- | ----------- | ---------------- | ------- |
| Project and content readiness             | ☐        | ☐           | ☐                | ☐       |
| Website structure and navigation          | ☐        | ☐           | ☐                | ☐       |
| Mobile and responsive design              | ☐        | ☐           | ☐                | ☐       |
| SEO and keyword planning                  | ☐        | ☐           | ☐                | ☐       |
| Analytics and tracking                    | ☐        | ☐           | ☐                | ☐       |
| Performance and images                    | ☐        | ☐           | ☐                | ☐       |
| Forms and conversion                      | ☐        | ☐           | ☐                | ☐       |
| Loading, empty, error, and success states | ☐        | ☐           | ☐                | ☐       |
| Accessibility                             | ☐        | ☐           | ☐                | ☐       |
| Browser and functional testing            | ☐        | ☐           | ☐                | ☐       |
| Authentication and login security         | ☐        | ☐           | ☐                | ☐       |
| Application and data security             | ☐        | ☐           | ☐                | ☐       |
| Legal and privacy                         | ☐        | ☐           | ☐                | ☐       |
| Launch-day checks                         | ☐        | ☐           | ☐                | ☐       |
| Post-launch monitoring                    | ☐        | ☐           | ☐                | ☐       |

**Approval**

- No critical issue remains.
- No high-priority security issue remains.
- All important pages work on mobile.
- All important pages have been reviewed for SEO.
- Analytics and webmaster tools are verified.
- Forms, CTAs, and contact methods work.
- Legal pages are published.
- Backups and monitoring are active.
- The project is ready for launch.

**Final notes:**

OWASP guidance supports secure session expiration, session handling, server-side authentication controls, and protection against repeated authentication attempts.\[[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)\]\[[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)\]\[[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)\]