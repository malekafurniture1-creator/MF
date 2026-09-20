import { BUSINESS } from "@/lib/business";
import type { ProductWithImage } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export { SITE_URL };

export const faqs = [
  {
    question: "What is MALEKA Furnitures?",
    answer:
      "MALEKA Furnitures is a furniture showroom in Moghalpura, Hyderabad offering ready-made furniture and custom furniture.",
  },
  {
    question: "Where is MALEKA Furnitures located?",
    answer: `MALEKA Furnitures is located at ${BUSINESS.address}.`,
  },
  {
    question: "What furniture does MALEKA Furnitures sell?",
    answer:
      "The showroom offers beds, sofas, wedding sets, dining furniture, mirrors, shoe racks and storage, and wardrobes.",
  },
  {
    question: "Does MALEKA Furnitures offer custom furniture?",
    answer:
      "Yes. MALEKA Furnitures offers custom furniture. Contact the showroom to discuss the piece you need.",
  },
  {
    question: "Does MALEKA Furnitures deliver and provide installation?",
    answer:
      "Yes. Delivery and installation or assembly are available. Contact MALEKA Furnitures to confirm the arrangements for your order.",
  },
  {
    question: "Does MALEKA Furnitures serve customers outside Hyderabad?",
    answer:
      "MALEKA Furnitures serves Hyderabad, Telangana and nearby cities around Hyderabad. Contact the showroom to confirm delivery for your location.",
  },
  {
    question: "How can I enquire about furniture pricing?",
    answer:
      "For current pricing, send MALEKA Furnitures an enquiry on WhatsApp, call the showroom, or visit in person.",
  },
] as const;

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS.name,
  url: SITE_URL,
  telephone: BUSINESS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "18-7-198/A/3, Murad Mahal, Sultan Shahi Road",
    addressLocality: "Moghalpura",
    addressRegion: "Hyderabad",
    addressCountry: "IN",
  },
  areaServed: ["Hyderabad", "Telangana", "Nearby cities around Hyderabad"],
  description:
    "MALEKA Furnitures is a furniture showroom in Moghalpura, Hyderabad offering ready-made furniture, custom furniture, delivery and installation.",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
};

export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export function productPageSchema(product: ProductWithImage) {
  const productUrl = `${SITE_URL}/product/${product.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description:
          product.description ||
          `${product.name} in the ${product.category} collection at MALEKA Furnitures in Moghalpura, Hyderabad.`,
        image: product.images.filter(Boolean),
        category: product.category,
        brand: { "@type": "Brand", name: BUSINESS.name },
        url: productUrl,
        mainEntityOfPage: productUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Explore", item: `${SITE_URL}/explore` },
          {
            "@type": "ListItem",
            position: 3,
            name: product.category,
            item: `${SITE_URL}/explore?category=${encodeURIComponent(product.category)}`,
          },
          { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
        ],
      },
    ],
  };
}
