// Shop navigation and hero strings. Other copy is English-only for now.
const en = {
  parts: "Parts",
  vehicles: "Vehicles",
  brands: "Brands",
  admin: "Admin",
  staff: "Staff · Billing",
  cart: "Cart",
  heroEyebrow: "Commercial vehicle parts · UAE",
  heroTitle: "The right truck part, first time.",
  heroBody:
    "Search by part number, OE number or description across stocked brands and the TecDoc catalogue. Verified fitment, live stock, same-day dispatch from Dubai.",
  searchPlaceholder: "Part number, OE number or description",
  search: "Search",
  vehicleTitle: "Shop by vehicle",
  vehicleBody: "Choose your truck to see parts that fit.",
  make: "Make",
  model: "Model series",
  year: "Year",
  findParts: "Find parts",
  popular: "Popular",
};

export type ShopStrings = Record<keyof typeof en, string>;
export type Locale = "en" | "ar";

const STRINGS: Record<Locale, ShopStrings> = {
  en,
  ar: {
    parts: "قطع الغيار",
    vehicles: "المركبات",
    brands: "العلامات التجارية",
    admin: "الإدارة",
    staff: "الموظفون · الفوترة",
    cart: "السلة",
    heroEyebrow: "قطع غيار المركبات التجارية · الإمارات",
    heroTitle: "قطعة الشاحنة الصحيحة من أول مرة.",
    heroBody:
      "ابحث برقم القطعة أو رقم المصنع الأصلي أو الوصف عبر العلامات المتوفرة وكتالوج TecDoc. توافق مؤكد ومخزون مباشر وشحن في نفس اليوم من دبي.",
    searchPlaceholder: "رقم القطعة أو رقم OE أو الوصف",
    search: "بحث",
    vehicleTitle: "تسوق حسب المركبة",
    vehicleBody: "اختر شاحنتك لعرض القطع المتوافقة.",
    make: "الشركة المصنعة",
    model: "الطراز",
    year: "السنة",
    findParts: "اعرض القطع",
    popular: "الأكثر بحثاً",
  },
};

export const strings = (locale: Locale): ShopStrings => STRINGS[locale];
