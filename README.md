# Shakuntala Dental Clinic

Responsive dental clinic website for **Dr. Rohan Bharti, BDS**, in **Mogal Bazar, Munger, Bihar**. Built with Astro and static HTML/CSS, with interactive educational visuals and a short WhatsApp appointment-request flow.

![Shakuntala Dental Clinic](public/images/social.png)

## Features

- Locally relevant clinic and doctor information, hours, directions and click-to-call links.
- Interactive blue tooth illustration with keyboard controls and reduced-motion support.
- A five-step educational root canal walkthrough with readable text.
- One compact appointment form: name, preferred day, then WhatsApp. Availability is confirmed by clinic staff.
- India-time date handling, with same-day requests disabled after 7 PM.
- Doctor portrait and clinic gallery, including an enhanced working photograph.
- Twenty separate dental education guides with sources, related articles and appointment links.
- Responsive layouts, bilingual labels/FAQs, sitemap, canonical metadata and Dentist structured data.
- Official-source WhatsApp symbol and footer credit linking to [ANAND](https://anandbuild.dev/).

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Astro prints the local preview URL. To create and preview the static build:

```sh
npm run build
npm run preview
```

## Check the website

```sh
npm run check
```

This builds the website, checks static assets/navigation/SEO output, and runs six tests covering booking validation/date boundaries and all twenty blog routes. Run the build before `npm test`, because blog tests inspect generated pages.

GitHub Actions runs the same checks for pushes and pull requests to `main`.

## Content and configuration

| Location | Purpose |
|---|---|
| `src/data.js` | Clinic contact details, service information and treatment steps |
| `src/pages/index.astro` | Clinic homepage |
| `src/content/blogs.json` | Twenty educational articles and review status |
| `src/pages/blog/` | Article library and individual routes |
| `src/scripts/booking.mjs` | WhatsApp message preparation and India-time date validation |
| `public/images/` | Optimized website artwork and photographs |
| `astro.config.mjs` | Canonical website origin and static output settings |

Original image masters, local reference material, private hosting configuration and working previews are excluded from this repository. The committed optimized assets are sufficient to build the website. `scripts/export-preview.mjs` optionally exports an embedded homepage preview after a build; blog pages need a local server or hosting.

## Before public launch

1. Configure the final public HTTPS domain in `astro.config.mjs`. Its current preview origin has not been verified as a public production deployment. Upload `dist/` to a static host; the homepage assumes a root-domain deployment rather than a GitHub Pages project subpath.
2. Confirm the address/postcode, map pin, hours, proposed services, credentials and all clinical content with the clinic. The current map links use an address search.
3. The clinic owner has confirmed review and approved all twenty articles for publication. They have `reviewed: true`, are indexable, and are included in the sitemap.
4. Verify the final domain in Search Console, submit its sitemap and link the website from the existing Google Business Profile.
5. Check mobile photo framing, accessibility, loading performance and real-device phone/WhatsApp handoffs.

The website has no live availability system, patient database, analytics tracker or automatic booking confirmation. The form prepares a message on the visitor's device; the visitor sends it in WhatsApp. Google Maps loads only on request. Fonts are served by Google Fonts.

## Image and content notes

The doctor portrait has a digitally edited background; the working photograph has enhanced lighting/framing. Public captions identify the doctor and clinical activity; image treatment notes remain here. Educational tooth/blog illustrations are generated conceptual artwork, not diagnostic models or evidence of treatment outcomes. The WhatsApp glyph comes from the official [WhatsApp website](https://www.whatsapp.com/); its trademark belongs to its owner. No fabricated patient testimonials or review schema are included.

## Credits

© 2026 Shakuntala Dental Clinic. All rights reserved.

Designed & developed by [ANAND](https://anandbuild.dev/) ↗
