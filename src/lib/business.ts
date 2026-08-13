export const BUSINESS = {
  name: "HI LINE COMFORTS",
  address:
    "New Bolarum, Railway Employees Colony Phase I, Sri Ganesh Nagar, Bolarum, Secunderabad, Telangana 500010",
  phone: "+917842682771",
  phoneDisplay: "call",
  rating: 4.9,
  reviewCount: 12,
} as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${BUSINESS.name}, ${BUSINESS.address}`,
)}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  `${BUSINESS.name}, ${BUSINESS.address}`,
)}&output=embed`;

export const telUrl = `tel:${BUSINESS.phone}`;

export function whatsappUrl(message?: string) {
  const text =
    message ??
    `Hello HI LINE COMFORTS, I would like to enquire about your furniture.`;
  return `https://wa.me/${BUSINESS.phone.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

export function productEnquiryUrl(productName: string, category?: string) {
  return whatsappUrl(
    `Hello HI LINE COMFORTS, I'd like to enquire about "${productName}"${
      category ? ` (${category})` : ""
    }.`,
  );
}
