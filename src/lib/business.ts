export const BUSINESS = {
  name: "Maleka Furnitures",
  address: "18-7-198/A/3, Murad Mahal, Sultan Shahi Road, Moghalpura, Hyderabad",
  phone: "+919391033589",
  phoneDisplay: "+91 93910 33589",
  alternatePhone: "+918985314344",
  rating: 3.7,
  reviewCount: 147,
  hours: "Mon – Sat: 9:00 AM – 10:00 PM · Sun: 9:00 AM – 6:00 PM",
} as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${BUSINESS.name}, ${BUSINESS.address}`,
)}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  `${BUSINESS.name}, ${BUSINESS.address}`,
)}&t=k&z=18&output=embed`;

export const telUrl = `tel:${BUSINESS.phone}`;

export function whatsappUrl(message?: string) {
  const text =
    message ??
    `Hello Maleka Furnitures, I would like to enquire about your furniture.`;
  return `https://wa.me/${BUSINESS.phone.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

export function productEnquiryUrl(productName: string, category?: string) {
  return whatsappUrl(
    `Hello Maleka Furnitures, I'd like to enquire about "${productName}"${
      category ? ` (${category})` : ""
    }.`,
  );
}
