// Synthetic catalogue for the Desert Route demo. Nothing here represents
// commercial availability; OE and part numbers follow real-world formats only.

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  partNumber: string;
  oe: string[];
  category: string;
  price: number;
  stock: number;
  warehouse: string;
  fitment: string[];
  specs: Record<string, string>;
  image: string;
  featured?: boolean;
  verified?: boolean;
  source?: string;
  commercialData?: boolean;
};

const DIP = "Dubai Investment Park";
const SHJ = "Sharjah Industrial Area";
const JAFZ = "Jebel Ali Free Zone";
const AUH = "Abu Dhabi Mussafah";
const QUOZ = "Al Quoz Industrial";

const IMG = {
  disc: "/products/brake-disc.png",
  pad: "/products/brake-pad.png",
  caliper: "/products/brake-caliper.png",
  dryer: "/products/air-dryer.png",
  oil: "/products/oil-filter.png",
  fuel: "/products/fuel-filter.png",
  air: "/products/air-filter.png",
  rod: "/products/torque-rod-kit.png",
  sensor: "/products/speed-sensor.png",
  tensioner: "/products/belt-tensioner.png",
  caliperKit: "/products/brake-caliper-repair-kit.png",
  protectionValve: "/products/four-circuit-protection-valve.png",
  footBrakeValve: "/products/foot-brake-valve.png",
  compressorKit: "/products/air-compressor-repair-kit.png",
};

export const trucks = [
  ["Mercedes-Benz", "Actros / Axor / Arocs / Atego", "2012–2024"],
  ["MAN", "TGX / TGS / TGA / TGM", "2010–2024"],
  ["Volvo", "FH / FM / FMX", "2013–2024"],
  ["Scania", "R / G / P / S Series", "2010–2024"],
  ["DAF", "XF / CF / LF", "2013–2024"],
  ["Iveco", "Stralis / S-Way / Trakker / Eurocargo", "2012–2024"],
  ["Renault Trucks", "T / C / K", "2013–2024"],
  ["Hino", "500 / 700", "2010–2024"],
  ["Isuzu", "Giga / F Series", "2010–2024"],
  ["Fuso", "Fighter / Super Great", "2010–2024"],
];

export const seedProducts: Product[] = [
  // ─── Braking ────────────────────────────────────────────────────────────
  {
    id: "p1", sku: "DR-BRK-0021", name: "Ventilated Brake Disc 430 mm", brand: "Sampa", partNumber: "031.047",
    oe: ["9424212112", "A9424212112"], category: "Braking", price: 485, stock: 18, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Axor 1840", "Mercedes-Benz Arocs"],
    specs: { Diameter: "430 mm", Thickness: "45 mm", Height: "130 mm", Holes: "10", Weight: "32.8 kg" },
    image: IMG.disc, featured: true,
  },
  {
    id: "p2", sku: "DR-BRK-0084", name: "Premium Brake Disc 430 mm", brand: "Brembo", partNumber: "14.9398.10",
    oe: ["9424212112", "9424211212"], category: "Braking", price: 625, stock: 7, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP3", "Mercedes-Benz Actros MP4", "Mercedes-Benz Axor"],
    specs: { Diameter: "430 mm", Thickness: "45 mm", Height: "130 mm", Holes: "10", Weight: "33.2 kg" },
    image: IMG.disc,
  },
  {
    id: "p3", sku: "DR-BRK-0062", name: "Brake Disc, Front Axle", brand: "Febi Bilstein", partNumber: "107881",
    oe: ["9424212112"], category: "Braking", price: 540, stock: 24, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor"],
    specs: { Diameter: "430 mm", Thickness: "45 mm", Axle: "Front", Holes: "10", Weight: "32.5 kg" },
    image: IMG.disc,
  },
  {
    id: "p9", sku: "DR-BRK-0710", name: "Brake Pad Set, Disc Brake", brand: "Textar", partNumber: "2927801",
    oe: ["1906400", "K046771K50"], category: "Braking", price: 390, stock: 16, warehouse: JAFZ,
    fitment: ["DAF XF 106", "DAF CF", "Iveco Stralis"],
    specs: { Width: "249 mm", Height: "111 mm", Thickness: "30 mm" }, image: IMG.pad, featured: true,
  },
  {
    id: "p10", sku: "DR-BRK-0731", name: "Air Disc Brake Caliper", brand: "Knorr-Bremse", partNumber: "K013173N50",
    oe: ["20923652", "7420923652"], category: "Braking", price: 2850, stock: 4, warehouse: DIP,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Position: "Right", Type: "Remanufactured", Brake: "SN7" }, image: IMG.caliper, featured: true,
  },
  {
    id: "p28", sku: "DR-BRK-1516", name: "Rear Brake Disc 430 mm", brand: "Zimmermann", partNumber: "450.5216.20",
    oe: ["A9604230612", "9604230612"], category: "Braking", price: 510, stock: 15, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Diameter: "430 mm", Thickness: "45 mm", Position: "Rear axle" }, image: IMG.disc,
  },
  {
    id: "p29", sku: "DR-BRK-1553", name: "Commercial Brake Pad Kit", brand: "Brembo", partNumber: "P 50 091",
    oe: ["A0064201520", "0064201520"], category: "Braking", price: 440, stock: 22, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor"],
    specs: { Width: "248 mm", Height: "109 mm", Axle: "Front / rear" }, image: IMG.pad,
  },
  {
    id: "p30", sku: "DR-BRK-1587", name: "Left Air Disc Brake Caliper", brand: "Meritor", partNumber: "LRA9001",
    oe: ["20424070", "7420424070"], category: "Braking", price: 2650, stock: 5, warehouse: SHJ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Position: "Left", Brake: "Elsa 225", Type: "Remanufactured" }, image: IMG.caliper,
  },
  {
    id: "p31", sku: "DR-BRK-1620", name: "Brake Disc 377 mm, Front", brand: "Jurid", partNumber: "569150J",
    oe: ["81508030025", "81.50803.0025"], category: "Braking", price: 465, stock: 20, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGM"],
    specs: { Diameter: "377 mm", Thickness: "45 mm", Holes: "10", Weight: "28.4 kg" }, image: IMG.disc,
  },
  {
    id: "p32", sku: "DR-BRK-1634", name: "Brake Disc 377 mm, Ventilated", brand: "Sampa", partNumber: "031.100",
    oe: ["81508030025"], category: "Braking", price: 420, stock: 14, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Diameter: "377 mm", Thickness: "45 mm", Holes: "10", Weight: "28.1 kg" }, image: IMG.disc,
  },
  {
    id: "p33", sku: "DR-BRK-1651", name: "Brake Disc 434 mm", brand: "Brembo", partNumber: "14.9418.10",
    oe: ["1387439", "1640561"], category: "Braking", price: 590, stock: 9, warehouse: JAFZ,
    fitment: ["DAF XF 106", "DAF XF 105", "DAF CF"],
    specs: { Diameter: "434 mm", Thickness: "45 mm", Holes: "10", Weight: "33.9 kg" }, image: IMG.disc,
  },
  {
    id: "p34", sku: "DR-BRK-1668", name: "Brake Disc 410 mm, Rear", brand: "Febi Bilstein", partNumber: "172112",
    oe: ["85103803", "20535130"], category: "Braking", price: 515, stock: 17, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Diameter: "410 mm", Thickness: "45 mm", Position: "Rear axle", Weight: "30.6 kg" }, image: IMG.disc,
  },
  {
    id: "p35", sku: "DR-BRK-1684", name: "Brake Disc 375 mm", brand: "Zimmermann", partNumber: "400.6483.20",
    oe: ["1421700", "1728990"], category: "Braking", price: 470, stock: 12, warehouse: DIP,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Diameter: "375 mm", Thickness: "45 mm", Holes: "10", Weight: "27.8 kg" }, image: IMG.disc,
  },
  {
    id: "p36", sku: "DR-BRK-1702", name: "Brake Pad Set, WVA 29087", brand: "Textar", partNumber: "2908701",
    oe: ["A0064204120", "0064204120"], category: "Braking", price: 405, stock: 27, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { WVA: "29087", Width: "211 mm", Height: "106 mm", Thickness: "30 mm" }, image: IMG.pad,
  },
  {
    id: "p37", sku: "DR-BRK-1719", name: "Brake Pad Set, WVA 29174", brand: "Jurid", partNumber: "2917405",
    oe: ["1962433", "1626090"], category: "Braking", price: 385, stock: 19, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { WVA: "29174", Width: "210 mm", Height: "109 mm", Thickness: "29 mm" }, image: IMG.pad,
  },
  {
    id: "p38", sku: "DR-BRK-1735", name: "Brake Pad Set, WVA 29165", brand: "DT Spare Parts", partNumber: "4.91928",
    oe: ["81508206059", "81.50820.6059"], category: "Braking", price: 340, stock: 33, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { WVA: "29165", Width: "211 mm", Height: "100 mm", Thickness: "30 mm" }, image: IMG.pad,
  },
  {
    id: "p39", sku: "DR-BRK-1751", name: "Brake Pad Set, WVA 29171", brand: "Knorr-Bremse", partNumber: "K045443K50",
    oe: ["20768092", "7420768092"], category: "Braking", price: 460, stock: 15, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { WVA: "29171", Width: "248 mm", Height: "118 mm", Thickness: "30 mm" }, image: IMG.pad,
  },
  {
    id: "p40", sku: "DR-BRK-1768", name: "Brake Pad Set, WVA 29125", brand: "Febi Bilstein", partNumber: "16719",
    oe: ["1906400", "1531007"], category: "Braking", price: 355, stock: 24, warehouse: DIP,
    fitment: ["DAF XF", "DAF CF", "Iveco Stralis"],
    specs: { WVA: "29125", Width: "249 mm", Height: "111 mm", Thickness: "30 mm" }, image: IMG.pad,
  },
  {
    id: "p41", sku: "DR-BRK-1784", name: "Brake Pad Set, Heavy Duty", brand: "Sampa", partNumber: "096.685",
    oe: ["A0064201520"], category: "Braking", price: 310, stock: 41, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor"],
    specs: { Width: "248 mm", Height: "109 mm", Thickness: "30 mm" }, image: IMG.pad,
  },
  {
    id: "p42", sku: "DR-BRK-1801", name: "Air Disc Brake Caliper, Left", brand: "Knorr-Bremse", partNumber: "K013174N50",
    oe: ["20923651", "7420923651"], category: "Braking", price: 2850, stock: 3, warehouse: DIP,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Position: "Left", Type: "Remanufactured", Brake: "SN7" }, image: IMG.caliper,
  },
  {
    id: "p43", sku: "DR-BRK-1818", name: "Brake Caliper, Right, Elsa 225", brand: "Meritor", partNumber: "LRA9002",
    oe: ["20424071", "7420424071"], category: "Braking", price: 2650, stock: 4, warehouse: SHJ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Position: "Right", Brake: "Elsa 225", Type: "Remanufactured" }, image: IMG.caliper,
  },
  {
    id: "p44", sku: "DR-BRK-1834", name: "Brake Caliper, Left, SN7", brand: "WABCO / ZF", partNumber: "640 195 013 0",
    oe: ["A0044205683", "0044205683"], category: "Braking", price: 2980, stock: 2, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Position: "Left", Brake: "PAN 22", Type: "New" }, image: IMG.caliper,
  },
  {
    id: "p45", sku: "DR-BRK-1851", name: "Brake Caliper, Right, SN7", brand: "WABCO / ZF", partNumber: "640 195 014 0",
    oe: ["A0044205783", "0044205783"], category: "Braking", price: 2980, stock: 3, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Position: "Right", Brake: "PAN 22", Type: "New" }, image: IMG.caliper,
  },
  {
    id: "p46", sku: "DR-BRK-1867", name: "Brake Caliper Repair Kit", brand: "Sampa", partNumber: "095.831",
    oe: ["81508226034", "81.50822.6034"], category: "Braking", price: 265, stock: 22, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Brake: "SB7 / SN7", Pieces: "14", Contents: "Guide pins, seals, boots" }, image: IMG.caliperKit,
  },
  {
    id: "p47", sku: "DR-BRK-1883", name: "Brake Caliper Guide Pin Kit", brand: "DT Spare Parts", partNumber: "4.91650",
    oe: ["1774606", "1774607"], category: "Braking", price: 118, stock: 46, warehouse: AUH,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Brake: "SB7", Pieces: "6", Contents: "Pins, bushes, boots" }, image: IMG.caliperKit,
  },
  {
    id: "p48", sku: "DR-BRK-1900", name: "Brake Disc 430 mm, Rear", brand: "Jurid", partNumber: "569126J",
    oe: ["A9604230612"], category: "Braking", price: 495, stock: 11, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Diameter: "430 mm", Thickness: "45 mm", Position: "Rear axle", Weight: "32.9 kg" }, image: IMG.disc,
  },

  // ─── Engine ─────────────────────────────────────────────────────────────
  {
    id: "p11", sku: "DR-ENG-0802", name: "Belt Tensioner Assembly", brand: "Sampa", partNumber: "040.447",
    oe: ["1779757", "1888460"], category: "Engine", price: 345, stock: 12, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Pulley: "74 mm", Width: "38 mm", Material: "Aluminium" }, image: IMG.tensioner,
  },
  {
    id: "p13", sku: "DR-ENG-1012", name: "Automatic Belt Tensioner", brand: "Dayco", partNumber: "APV2811",
    oe: ["A5412002470", "5412002470"], category: "Engine", price: 410, stock: 21, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor"],
    specs: { Pulley: "80 mm", Width: "34 mm", Drive: "Poly-V" }, image: IMG.tensioner,
  },
  {
    id: "p14", sku: "DR-ENG-1048", name: "Auxiliary Drive Tensioner", brand: "INA", partNumber: "534 0340 10",
    oe: ["2197391", "21422765"], category: "Engine", price: 525, stock: 8, warehouse: JAFZ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Pulley: "74 mm", Material: "Aluminium", Belt: "8PK" }, image: IMG.tensioner,
  },
  {
    id: "p15", sku: "DR-ENG-1091", name: "Fan Belt Tensioner Assembly", brand: "DT Spare Parts", partNumber: "3.34065",
    oe: ["1859654", "1795774"], category: "Engine", price: 455, stock: 14, warehouse: SHJ,
    fitment: ["DAF XF", "DAF CF"],
    specs: { Pulley: "76 mm", Width: "39 mm", Weight: "2.6 kg" }, image: IMG.tensioner,
  },
  {
    id: "p49", sku: "DR-ENG-1130", name: "Belt Tensioner, V-Ribbed", brand: "Gates", partNumber: "T38547",
    oe: ["A5412001470", "5412001470"], category: "Engine", price: 380, stock: 16, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP3", "Mercedes-Benz Axor"],
    specs: { Pulley: "80 mm", Width: "34 mm", Drive: "Poly-V 8PK" }, image: IMG.tensioner,
  },
  {
    id: "p50", sku: "DR-ENG-1147", name: "Belt Tensioner Assembly, D26", brand: "Febi Bilstein", partNumber: "46168",
    oe: ["51958007460", "51.95800.7460"], category: "Engine", price: 395, stock: 19, warehouse: SHJ,
    fitment: ["MAN TGX D26", "MAN TGS D26"],
    specs: { Pulley: "78 mm", Width: "36 mm", Material: "Aluminium" }, image: IMG.tensioner,
  },
  {
    id: "p51", sku: "DR-ENG-1163", name: "Idler Pulley, 90 mm", brand: "INA", partNumber: "532 0653 10",
    oe: ["A9062020019", "9062020019"], category: "Engine", price: 145, stock: 38, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Atego"],
    specs: { Pulley: "90 mm", Width: "36 mm", Bearing: "Double row" }, image: IMG.tensioner,
  },
  {
    id: "p52", sku: "DR-ENG-1180", name: "Idler Pulley, Alternator Belt", brand: "Dayco", partNumber: "APV1170",
    oe: ["21639808", "7421639808"], category: "Engine", price: 160, stock: 29, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Volvo FMX"],
    specs: { Pulley: "85 mm", Width: "38 mm", Material: "Steel" }, image: IMG.tensioner,
  },
  {
    id: "p53", sku: "DR-ENG-1196", name: "Tensioner Pulley, Poly-V", brand: "SKF", partNumber: "VKM 38650",
    oe: ["1785248", "2197391"], category: "Engine", price: 210, stock: 21, warehouse: DIP,
    fitment: ["Volvo FH", "Renault Trucks T"],
    specs: { Pulley: "74 mm", Width: "38 mm", Belt: "8PK" }, image: IMG.tensioner,
  },
  {
    id: "p54", sku: "DR-ENG-1213", name: "Belt Tensioner, Fan Drive", brand: "Sampa", partNumber: "051.220",
    oe: ["2029386", "1774654"], category: "Engine", price: 440, stock: 12, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { Pulley: "76 mm", Width: "40 mm", Weight: "2.4 kg" }, image: IMG.tensioner,
  },
  {
    id: "p55", sku: "DR-ENG-1229", name: "Automatic Belt Tensioner", brand: "Gates", partNumber: "T39215",
    oe: ["1779757"], category: "Engine", price: 420, stock: 10, warehouse: JAFZ,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Pulley: "74 mm", Width: "38 mm", Drive: "Poly-V 10PK" }, image: IMG.tensioner,
  },
  {
    id: "p56", sku: "DR-ENG-1246", name: "Belt Tensioner, Compressor Drive", brand: "DT Spare Parts", partNumber: "5.41531",
    oe: ["1795774", "2197400"], category: "Engine", price: 470, stock: 8, warehouse: DIP,
    fitment: ["DAF XF 106", "DAF CF"],
    specs: { Pulley: "76 mm", Width: "39 mm", Weight: "2.7 kg" }, image: IMG.tensioner,
  },
  {
    id: "p57", sku: "DR-ENG-1262", name: "Tensioner Assembly, Alternator", brand: "Febi Bilstein", partNumber: "178541",
    oe: ["504086751", "5801654932"], category: "Engine", price: 365, stock: 15, warehouse: AUH,
    fitment: ["Iveco Stralis", "Iveco S-Way", "Iveco Trakker"],
    specs: { Pulley: "70 mm", Width: "32 mm", Material: "Aluminium" }, image: IMG.tensioner,
  },
  {
    id: "p58", sku: "DR-ENG-1279", name: "Belt Tensioner, 8PK", brand: "INA", partNumber: "534 0554 10",
    oe: ["5010550335", "7420747773"], category: "Engine", price: 410, stock: 13, warehouse: SHJ,
    fitment: ["Renault Trucks T", "Renault Trucks C", "Renault Trucks K"],
    specs: { Pulley: "74 mm", Width: "35 mm", Belt: "8PK" }, image: IMG.tensioner,
  },
  {
    id: "p59", sku: "DR-ENG-1295", name: "Idler Pulley, Water Pump Belt", brand: "Dayco", partNumber: "APV2820",
    oe: ["81958006092", "81.95800.6092"], category: "Engine", price: 175, stock: 24, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Pulley: "88 mm", Width: "36 mm", Bearing: "Sealed" }, image: IMG.tensioner,
  },
  {
    id: "p60", sku: "DR-ENG-1312", name: "Belt Tensioner, Auxiliary Drive", brand: "Gates", partNumber: "T39374",
    oe: ["S1631E0090", "ME220700"], category: "Engine", price: 355, stock: 11, warehouse: JAFZ,
    fitment: ["Hino 700", "Fuso Super Great"],
    specs: { Pulley: "72 mm", Width: "30 mm", Drive: "Poly-V" }, image: IMG.tensioner,
  },
  {
    id: "p61", sku: "DR-ENG-1328", name: "Belt Tensioner, 6-Rib", brand: "Sampa", partNumber: "052.033",
    oe: ["1-13650-2211", "1136502211"], category: "Engine", price: 320, stock: 17, warehouse: AUH,
    fitment: ["Isuzu Giga", "Isuzu F Series"],
    specs: { Pulley: "70 mm", Width: "28 mm", Belt: "6PK" }, image: IMG.tensioner,
  },
  {
    id: "p62", sku: "DR-ENG-1345", name: "Alternator Idler Pulley, OM471", brand: "SKF", partNumber: "VKM 31018",
    oe: ["A4722000170", "4722000170"], category: "Engine", price: 150, stock: 40, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Pulley: "80 mm", Width: "36 mm", Bearing: "Double row" }, image: IMG.tensioner,
  },

  // ─── Filters ────────────────────────────────────────────────────────────
  {
    id: "p5", sku: "DR-FIL-0201", name: "Oil Filter Element", brand: "MANN-FILTER", partNumber: "HU 12 140 x",
    oe: ["51055040105", "51.05504.0105"], category: "Filters", price: 72, stock: 96, warehouse: DIP,
    fitment: ["MAN TGX D26", "MAN TGS D26"],
    specs: { Height: "210 mm", Diameter: "120 mm", Media: "Synthetic" }, image: IMG.oil, featured: true,
  },
  {
    id: "p6", sku: "DR-ENG-0332", name: "Fuel Filter, Heavy Duty", brand: "Mahle", partNumber: "KX 400D",
    oe: ["21764966", "7421764966"], category: "Filters", price: 118, stock: 31, warehouse: AUH,
    fitment: ["Volvo FH 460", "Volvo FM 420", "Renault Trucks T"],
    specs: { Height: "202 mm", Diameter: "95 mm", Micron: "5 μm" }, image: IMG.fuel,
  },
  {
    id: "p12", sku: "DR-FIL-0909", name: "Air Filter Element", brand: "MANN-FILTER", partNumber: "C 32 1445",
    oe: ["ME422778", "MK667920"], category: "Filters", price: 198, stock: 28, warehouse: AUH,
    fitment: ["Fuso Super Great", "Fuso Fighter", "Hino 700", "Isuzu Giga"],
    specs: { Length: "498 mm", Diameter: "318 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p25", sku: "DR-FIL-1414", name: "Fuel Filter Water Separator", brand: "Fleetguard", partNumber: "FS19914",
    oe: ["20998367", "7420998367"], category: "Filters", price: 145, stock: 44, warehouse: DIP,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Micron: "10", Thread: "M32 x 1.5", Type: "Water separator" }, image: IMG.fuel,
  },
  {
    id: "p26", sku: "DR-FIL-1449", name: "Long-Life Oil Filter", brand: "Donaldson", partNumber: "P550812",
    oe: ["51055040109", "51.05504.0109"], category: "Filters", price: 96, stock: 72, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Height: "260 mm", Diameter: "118 mm", Media: "Synthetic blend" }, image: IMG.oil,
  },
  {
    id: "p27", sku: "DR-FIL-1488", name: "Cabin Air Filter Set", brand: "Mahle", partNumber: "LAK 675/S",
    oe: ["A0008301218", "0008301218"], category: "Filters", price: 135, stock: 31, warehouse: AUH,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Length: "365 mm", Width: "180 mm", Media: "Activated carbon" }, image: IMG.air,
  },
  {
    id: "p63", sku: "DR-FIL-1520", name: "Oil Filter Element, OM471", brand: "MANN-FILTER", partNumber: "HU 13 125 x",
    oe: ["A4701800109", "4701800109"], category: "Filters", price: 88, stock: 120, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Height: "262 mm", Diameter: "131 mm", Media: "Synthetic" }, image: IMG.oil,
  },
  {
    id: "p64", sku: "DR-FIL-1536", name: "Oil Filter Element", brand: "Hengst", partNumber: "E500H D129",
    oe: ["A4701800109"], category: "Filters", price: 78, stock: 64, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Height: "262 mm", Diameter: "131 mm", Media: "Cellulose blend" }, image: IMG.oil,
  },
  {
    id: "p65", sku: "DR-FIL-1553", name: "Oil Filter, Spin-On, D13", brand: "Fleetguard", partNumber: "LF17511",
    oe: ["21707133", "7421707133"], category: "Filters", price: 92, stock: 85, warehouse: JAFZ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Height: "265 mm", Diameter: "108 mm", Thread: "M36 x 2" }, image: IMG.oil,
  },
  {
    id: "p66", sku: "DR-FIL-1570", name: "Oil Filter, Spin-On", brand: "Mahle", partNumber: "OC 613",
    oe: ["2022275", "1873014"], category: "Filters", price: 84, stock: 71, warehouse: AUH,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Height: "236 mm", Diameter: "110 mm", Thread: "M30 x 2" }, image: IMG.oil,
  },
  {
    id: "p67", sku: "DR-FIL-1586", name: "Oil Filter Element, MX-13", brand: "MANN-FILTER", partNumber: "HU 1390 x",
    oe: ["1948921", "1643070"], category: "Filters", price: 95, stock: 58, warehouse: DIP,
    fitment: ["DAF XF 106", "DAF CF"],
    specs: { Height: "246 mm", Diameter: "139 mm", Media: "Synthetic" }, image: IMG.oil,
  },
  {
    id: "p68", sku: "DR-FIL-1603", name: "Oil Filter, Cursor 13", brand: "Donaldson", partNumber: "P550920",
    oe: ["2996570", "500054655"], category: "Filters", price: 82, stock: 47, warehouse: SHJ,
    fitment: ["Iveco Stralis", "Iveco S-Way", "Iveco Trakker"],
    specs: { Height: "228 mm", Diameter: "108 mm", Thread: "M30 x 2" }, image: IMG.oil,
  },
  {
    id: "p69", sku: "DR-FIL-1619", name: "Oil Filter, Spin-On", brand: "Baldwin", partNumber: "B7635",
    oe: ["15607-2190", "156072190"], category: "Filters", price: 58, stock: 66, warehouse: JAFZ,
    fitment: ["Hino 500", "Hino 700"],
    specs: { Height: "190 mm", Diameter: "108 mm", Thread: "M30 x 1.5" }, image: IMG.oil,
  },
  {
    id: "p70", sku: "DR-FIL-1636", name: "Fuel Filter, Main", brand: "MANN-FILTER", partNumber: "PU 1046 x",
    oe: ["A4700900451", "4700900451"], category: "Filters", price: 96, stock: 74, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Height: "224 mm", Diameter: "105 mm", Micron: "5 μm" }, image: IMG.fuel,
  },
  {
    id: "p71", sku: "DR-FIL-1652", name: "Fuel Pre-Filter Element", brand: "Hengst", partNumber: "E103KP D197",
    oe: ["A4700920405", "4700920405"], category: "Filters", price: 88, stock: 52, warehouse: AUH,
    fitment: ["Mercedes-Benz Actros MP4"],
    specs: { Height: "160 mm", Diameter: "94 mm", Micron: "30 μm" }, image: IMG.fuel,
  },
  {
    id: "p72", sku: "DR-FIL-1669", name: "Fuel Filter, Spin-On", brand: "Fleetguard", partNumber: "FF5687",
    oe: ["51125030061", "51.12503.0061"], category: "Filters", price: 74, stock: 90, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Height: "192 mm", Diameter: "93 mm", Thread: "M20 x 1.5" }, image: IMG.fuel,
  },
  {
    id: "p73", sku: "DR-FIL-1685", name: "Fuel Filter Element", brand: "Mahle", partNumber: "KX 393D",
    oe: ["1873016", "2003505"], category: "Filters", price: 98, stock: 39, warehouse: JAFZ,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { Height: "203 mm", Diameter: "96 mm", Micron: "5 μm" }, image: IMG.fuel,
  },
  {
    id: "p74", sku: "DR-FIL-1702", name: "Fuel Water Separator", brand: "Baldwin", partNumber: "PF7930",
    oe: ["1643080", "1794863"], category: "Filters", price: 128, stock: 33, warehouse: DIP,
    fitment: ["DAF XF", "DAF CF"],
    specs: { Height: "186 mm", Diameter: "94 mm", Type: "Water separator" }, image: IMG.fuel,
  },
  {
    id: "p75", sku: "DR-FIL-1718", name: "Fuel Filter, Cursor Engine", brand: "Donaldson", partNumber: "P550990",
    oe: ["2997376", "500315480"], category: "Filters", price: 82, stock: 44, warehouse: AUH,
    fitment: ["Iveco Stralis", "Iveco Eurocargo"],
    specs: { Height: "186 mm", Diameter: "93 mm", Thread: "M16 x 1.5" }, image: IMG.fuel,
  },
  {
    id: "p76", sku: "DR-FIL-1735", name: "Fuel Filter, Spin-On", brand: "Sakura", partNumber: "FC-1802",
    oe: ["23390-E0020", "23390E0020"], category: "Filters", price: 45, stock: 108, warehouse: SHJ,
    fitment: ["Hino 500", "Hino 700"],
    specs: { Height: "150 mm", Diameter: "84 mm", Thread: "M20 x 1.5" }, image: IMG.fuel,
  },
  {
    id: "p77", sku: "DR-FIL-1751", name: "Air Filter Element, Primary", brand: "MANN-FILTER", partNumber: "C 33 1600/1",
    oe: ["A0040943504", "0040943504"], category: "Filters", price: 215, stock: 36, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Length: "600 mm", Diameter: "330 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p78", sku: "DR-FIL-1768", name: "Air Filter, Safety Element", brand: "MANN-FILTER", partNumber: "CF 1650",
    oe: ["A0040943604", "0040943604"], category: "Filters", price: 98, stock: 40, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Length: "550 mm", Diameter: "165 mm", Type: "Secondary" }, image: IMG.air,
  },
  {
    id: "p79", sku: "DR-FIL-1784", name: "Air Filter Element", brand: "Donaldson", partNumber: "P782857",
    oe: ["81084050021", "81.08405.0021"], category: "Filters", price: 205, stock: 31, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Length: "520 mm", Diameter: "305 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p80", sku: "DR-FIL-1801", name: "Air Filter Element", brand: "Fleetguard", partNumber: "AF26165",
    oe: ["21386644", "7421386644"], category: "Filters", price: 225, stock: 27, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Length: "580 mm", Diameter: "312 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p81", sku: "DR-FIL-1817", name: "Air Filter, Primary", brand: "Mahle", partNumber: "LX 3013",
    oe: ["1869993", "2144993"], category: "Filters", price: 230, stock: 22, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { Length: "544 mm", Diameter: "320 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p82", sku: "DR-FIL-1834", name: "Air Filter Element", brand: "Baldwin", partNumber: "RS5364",
    oe: ["1657523", "1638054"], category: "Filters", price: 210, stock: 25, warehouse: DIP,
    fitment: ["DAF XF 106", "DAF CF"],
    specs: { Length: "512 mm", Diameter: "296 mm", Type: "Primary" }, image: IMG.air,
  },
  {
    id: "p83", sku: "DR-FIL-1850", name: "Cabin Filter, Activated Carbon", brand: "Hengst", partNumber: "E1988LC",
    oe: ["81619100019", "81.61910.0019"], category: "Filters", price: 72, stock: 55, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Length: "340 mm", Width: "170 mm", Media: "Activated carbon" }, image: IMG.air,
  },

  // ─── Suspension ─────────────────────────────────────────────────────────
  {
    id: "p7", sku: "DR-SUS-0407", name: "Torque Rod Repair Kit", brand: "DT Spare Parts", partNumber: "1.31867",
    oe: ["81432206231", "81.43220.6231"], category: "Suspension", price: 265, stock: 13, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Bore: "85 mm", Width: "130 mm", Material: "Steel / rubber" }, image: IMG.rod,
  },
  {
    id: "p16", sku: "DR-SUS-1120", name: "Rear Axle Torque Rod Kit", brand: "Lemförder", partNumber: "42587 01",
    oe: ["A9603503606", "9603503606"], category: "Suspension", price: 690, stock: 11, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Length: "585 mm", Bore: "85 mm", Position: "Rear axle" }, image: IMG.rod,
  },
  {
    id: "p17", sku: "DR-SUS-1164", name: "V-Stay Repair Kit", brand: "Sampa", partNumber: "030.589",
    oe: ["81432706078", "81.43270.6078"], category: "Suspension", price: 320, stock: 26, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Bore: "108 mm", Material: "Steel / rubber", Pieces: "7" }, image: IMG.rod,
  },
  {
    id: "p18", sku: "DR-SUS-1195", name: "Stabilizer Bar Bush Kit", brand: "Febi Bilstein", partNumber: "172344",
    oe: ["20533294", "7420533294"], category: "Suspension", price: 175, stock: 34, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks C"],
    specs: { Diameter: "58 mm", Position: "Front axle", Pieces: "4" }, image: IMG.rod,
  },
  {
    id: "p84", sku: "DR-SUS-1230", name: "Torque Rod, Complete", brand: "Sampa", partNumber: "095.339",
    oe: ["A9603501506", "9603501506"], category: "Suspension", price: 620, stock: 9, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Length: "612 mm", Bore: "85 mm", Position: "Rear axle" }, image: IMG.rod,
  },
  {
    id: "p85", sku: "DR-SUS-1247", name: "V-Stay, Complete", brand: "Lemförder", partNumber: "32718 01",
    oe: ["A9603505105", "9603505105"], category: "Suspension", price: 1480, stock: 5, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Length: "1100 mm", Bore: "108 mm", Weight: "24 kg" }, image: IMG.rod,
  },
  {
    id: "p86", sku: "DR-SUS-1263", name: "V-Stay Repair Kit", brand: "DT Spare Parts", partNumber: "3.67055",
    oe: ["81432706078"], category: "Suspension", price: 295, stock: 18, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Bore: "108 mm", Material: "Steel / rubber", Pieces: "7" }, image: IMG.rod,
  },
  {
    id: "p87", sku: "DR-SUS-1280", name: "Torque Rod Bush", brand: "Febi Bilstein", partNumber: "15537",
    oe: ["81432210087", "81.43221.0087"], category: "Suspension", price: 68, stock: 84, warehouse: AUH,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Bore: "85 mm", Width: "130 mm", Material: "Rubber / steel" }, image: IMG.rod,
  },
  {
    id: "p88", sku: "DR-SUS-1296", name: "Torque Rod Repair Kit", brand: "Sampa", partNumber: "030.201",
    oe: ["20390836", "7420390836"], category: "Suspension", price: 240, stock: 22, warehouse: DIP,
    fitment: ["Volvo FH", "Volvo FM", "Volvo FMX"],
    specs: { Bore: "80 mm", Width: "122 mm", Pieces: "5" }, image: IMG.rod,
  },
  {
    id: "p89", sku: "DR-SUS-1313", name: "V-Stay Bush Kit", brand: "Lemförder", partNumber: "38893 01",
    oe: ["21054845", "7421054845"], category: "Suspension", price: 330, stock: 16, warehouse: SHJ,
    fitment: ["Volvo FH", "Volvo FM"],
    specs: { Bore: "100 mm", Material: "Steel / rubber", Pieces: "6" }, image: IMG.rod,
  },
  {
    id: "p90", sku: "DR-SUS-1329", name: "Torque Rod, Rear Axle", brand: "DT Spare Parts", partNumber: "1.25335",
    oe: ["1421286", "1770689"], category: "Suspension", price: 590, stock: 7, warehouse: JAFZ,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Length: "570 mm", Bore: "80 mm", Position: "Rear axle" }, image: IMG.rod,
  },
  {
    id: "p91", sku: "DR-SUS-1346", name: "Stabilizer Bush, Rear", brand: "Sampa", partNumber: "011.079",
    oe: ["1394513", "1445716"], category: "Suspension", price: 42, stock: 96, warehouse: AUH,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { Diameter: "60 mm", Length: "80 mm", Material: "Rubber" }, image: IMG.rod,
  },
  {
    id: "p92", sku: "DR-SUS-1362", name: "Torque Rod Kit", brand: "Febi Bilstein", partNumber: "105584",
    oe: ["1626903", "1747356"], category: "Suspension", price: 310, stock: 14, warehouse: DIP,
    fitment: ["DAF XF 106", "DAF CF"],
    specs: { Bore: "82 mm", Width: "126 mm", Pieces: "4" }, image: IMG.rod,
  },
  {
    id: "p93", sku: "DR-SUS-1379", name: "Stabilizer Bar Bush Kit, Front", brand: "DT Spare Parts", partNumber: "5.10330",
    oe: ["1610720", "1626150"], category: "Suspension", price: 130, stock: 30, warehouse: SHJ,
    fitment: ["DAF XF", "DAF CF"],
    specs: { Diameter: "55 mm", Position: "Front axle", Pieces: "4" }, image: IMG.rod,
  },
  {
    id: "p94", sku: "DR-SUS-1395", name: "V-Stay Repair Kit", brand: "Sampa", partNumber: "020.171",
    oe: ["42536262", "42538126"], category: "Suspension", price: 340, stock: 12, warehouse: JAFZ,
    fitment: ["Iveco Stralis", "Iveco S-Way", "Iveco Trakker"],
    specs: { Bore: "100 mm", Material: "Steel / rubber", Pieces: "7" }, image: IMG.rod,
  },
  {
    id: "p95", sku: "DR-SUS-1412", name: "Torque Rod Bush Kit", brand: "Lemförder", partNumber: "39112 01",
    oe: ["5010557091", "7485135004"], category: "Suspension", price: 165, stock: 28, warehouse: AUH,
    fitment: ["Renault Trucks T", "Renault Trucks C", "Renault Trucks K"],
    specs: { Bore: "80 mm", Width: "122 mm", Pieces: "4" }, image: IMG.rod,
  },
  {
    id: "p96", sku: "DR-SUS-1428", name: "Torque Rod, Front", brand: "Febi Bilstein", partNumber: "176010",
    oe: ["48710-1520", "487101520"], category: "Suspension", price: 480, stock: 10, warehouse: DIP,
    fitment: ["Hino 700", "Hino 500"],
    specs: { Length: "520 mm", Bore: "70 mm", Position: "Front axle" }, image: IMG.rod,
  },
  {
    id: "p97", sku: "DR-SUS-1445", name: "Stabilizer Link Kit", brand: "Sampa", partNumber: "095.464",
    oe: ["1-51385-042-0", "1513850420"], category: "Suspension", price: 190, stock: 23, warehouse: SHJ,
    fitment: ["Isuzu Giga", "Isuzu F Series"],
    specs: { Length: "180 mm", Thread: "M16 x 1.5", Pieces: "2" }, image: IMG.rod,
  },

  // ─── Electrical ─────────────────────────────────────────────────────────
  {
    id: "p8", sku: "DR-ELC-0520", name: "Crankshaft Speed Sensor", brand: "Bosch", partNumber: "0 281 002 315",
    oe: ["51271207015", "51.27120.7015"], category: "Electrical", price: 210, stock: 9, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "Neoplan"],
    specs: { Voltage: "24 V", Connector: "2 pin", Length: "1140 mm" }, image: IMG.sensor,
  },
  {
    id: "p19", sku: "DR-ELC-1211", name: "ABS Wheel Speed Sensor", brand: "WABCO / ZF", partNumber: "441 032 921 2",
    oe: ["A0015429018", "0015429018"], category: "Electrical", price: 235, stock: 19, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor", "Mercedes-Benz Arocs"],
    specs: { Voltage: "24 V", Length: "2050 mm", Connector: "2 pin" }, image: IMG.sensor,
  },
  {
    id: "p20", sku: "DR-ELC-1240", name: "Camshaft Position Sensor", brand: "Bosch", partNumber: "0 281 006 028",
    oe: ["51271207019", "51.27120.7019"], category: "Electrical", price: 285, stock: 13, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Voltage: "24 V", Connector: "3 pin", Type: "Hall effect" }, image: IMG.sensor,
  },
  {
    id: "p21", sku: "DR-ELC-1278", name: "Exhaust Temperature Sensor", brand: "Hella", partNumber: "6PT 014 494-131",
    oe: ["2294291", "2247305"], category: "Electrical", price: 360, stock: 7, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series"],
    specs: { Range: "-40 to 900 C", Cable: "680 mm", Connector: "2 pin" }, image: IMG.sensor,
  },
  {
    id: "p98", sku: "DR-ELC-1320", name: "ABS Wheel Speed Sensor, 2.5 m", brand: "WABCO / ZF", partNumber: "441 032 578 0",
    oe: ["81271206143", "81.27120.6143"], category: "Electrical", price: 240, stock: 26, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Voltage: "24 V", Length: "2500 mm", Connector: "2 pin" }, image: IMG.sensor,
  },
  {
    id: "p99", sku: "DR-ELC-1336", name: "ABS Sensor, Straight", brand: "Knorr-Bremse", partNumber: "0 486 000 219",
    oe: ["20528660", "7420528660"], category: "Electrical", price: 225, stock: 21, warehouse: SHJ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Voltage: "24 V", Length: "1250 mm", Type: "Straight" }, image: IMG.sensor,
  },
  {
    id: "p100", sku: "DR-ELC-1353", name: "ABS Sensor, Angled", brand: "Hella", partNumber: "6PU 011 220-001",
    oe: ["1530723", "1892059"], category: "Electrical", price: 260, stock: 14, warehouse: JAFZ,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Voltage: "24 V", Length: "1830 mm", Type: "Angled 90°" }, image: IMG.sensor,
  },
  {
    id: "p101", sku: "DR-ELC-1369", name: "Wheel Speed Sensor Kit", brand: "DT Spare Parts", partNumber: "4.63958",
    oe: ["1506004", "1789435"], category: "Electrical", price: 195, stock: 32, warehouse: AUH,
    fitment: ["DAF XF", "DAF CF"],
    specs: { Voltage: "24 V", Length: "1650 mm", Contents: "Sensor, bush, grease" }, image: IMG.sensor,
  },
  {
    id: "p102", sku: "DR-ELC-1386", name: "Crankshaft Sensor, OM471", brand: "Bosch", partNumber: "0 281 002 942",
    oe: ["A0091533328", "0091533328"], category: "Electrical", price: 245, stock: 18, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Voltage: "24 V", Connector: "2 pin", Type: "Inductive" }, image: IMG.sensor,
  },
  {
    id: "p103", sku: "DR-ELC-1402", name: "Crankshaft Position Sensor", brand: "Hella", partNumber: "6PU 009 168-681",
    oe: ["21107553", "7421107553"], category: "Electrical", price: 230, stock: 16, warehouse: SHJ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Voltage: "24 V", Connector: "2 pin", Type: "Inductive" }, image: IMG.sensor,
  },
  {
    id: "p104", sku: "DR-ELC-1419", name: "Camshaft Sensor", brand: "Bosch", partNumber: "0 281 002 505",
    oe: ["1462087", "1835958"], category: "Electrical", price: 275, stock: 11, warehouse: JAFZ,
    fitment: ["Scania R Series", "Scania G Series", "Scania S Series"],
    specs: { Voltage: "24 V", Connector: "3 pin", Type: "Hall effect" }, image: IMG.sensor,
  },
  {
    id: "p105", sku: "DR-ELC-1435", name: "Boost Pressure Sensor", brand: "Bosch", partNumber: "0 281 006 102",
    oe: ["51274210160", "51.27421.0160"], category: "Electrical", price: 165, stock: 29, warehouse: AUH,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Voltage: "5 V", Range: "0.5 – 4.5 bar", Connector: "4 pin" }, image: IMG.sensor,
  },
  {
    id: "p106", sku: "DR-ELC-1452", name: "Coolant Temperature Sensor", brand: "Febi Bilstein", partNumber: "28336",
    oe: ["A0071530028", "0071530028"], category: "Electrical", price: 85, stock: 57, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor", "Mercedes-Benz Atego"],
    specs: { Thread: "M14 x 1.5", Connector: "2 pin", Range: "-40 to 130 C" }, image: IMG.sensor,
  },
  {
    id: "p107", sku: "DR-ELC-1468", name: "Oil Pressure Sensor", brand: "Hella", partNumber: "6PR 008 476-101",
    oe: ["81274210230", "81.27421.0230"], category: "Electrical", price: 120, stock: 38, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Thread: "M14 x 1.5", Range: "0 – 10 bar", Connector: "3 pin" }, image: IMG.sensor,
  },
  {
    id: "p108", sku: "DR-ELC-1485", name: "NOx Sensor, Downstream", brand: "Continental", partNumber: "5WK9 6690C",
    oe: ["A0101531828", "0101531828"], category: "Electrical", price: 1180, stock: 6, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Voltage: "24 V", Cable: "900 mm", Position: "After SCR" }, image: IMG.sensor,
  },
  {
    id: "p109", sku: "DR-ELC-1501", name: "NOx Sensor, Upstream", brand: "Continental", partNumber: "5WK9 6683C",
    oe: ["22303391", "7422303391"], category: "Electrical", price: 1240, stock: 4, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Voltage: "24 V", Cable: "1100 mm", Position: "Before SCR" }, image: IMG.sensor,
  },
  {
    id: "p110", sku: "DR-ELC-1518", name: "Exhaust Gas Temperature Sensor", brand: "Bosch", partNumber: "0 986 259 060",
    oe: ["2007950", "1888405"], category: "Electrical", price: 340, stock: 9, warehouse: DIP,
    fitment: ["Scania R Series", "Scania G Series"],
    specs: { Range: "-40 to 900 C", Cable: "540 mm", Connector: "2 pin" }, image: IMG.sensor,
  },
  {
    id: "p111", sku: "DR-ELC-1534", name: "Speed Sensor, Gearbox", brand: "Hella", partNumber: "6PU 009 146-611",
    oe: ["0501214211", "0501 214 211"], category: "Electrical", price: 175, stock: 20, warehouse: SHJ,
    fitment: ["MAN TGX", "DAF XF", "Iveco Stralis"],
    specs: { Voltage: "24 V", Thread: "M18 x 1.5", Connector: "2 pin" }, image: IMG.sensor,
  },

  // ─── Air & Brake ────────────────────────────────────────────────────────
  {
    id: "p4", sku: "DR-AIR-0104", name: "Air Dryer Cartridge", brand: "WABCO / ZF", partNumber: "432 410 222 7",
    oe: ["0004295695", "A0004295695"], category: "Air & Brake", price: 185, stock: 42, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros", "MAN TGX", "Volvo FH", "DAF XF"],
    specs: { Thread: "M39 x 1.5", Type: "Coalescence filter", Pressure: "13 bar" }, image: IMG.dryer,
  },
  {
    id: "p22", sku: "DR-AIR-1310", name: "Air Dryer Cartridge Plus", brand: "Knorr-Bremse", partNumber: "K096837K50",
    oe: ["A0004295795", "0004295795"], category: "Air & Brake", price: 225, stock: 38, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Arocs"],
    specs: { Thread: "M39 x 1.5", Pressure: "14 bar", Type: "Oil separator" }, image: IMG.dryer,
  },
  {
    id: "p23", sku: "DR-AIR-1346", name: "Four-Circuit Protection Valve", brand: "WABCO / ZF", partNumber: "934 714 152 0",
    oe: ["81521516098", "81.52151.6098"], category: "Air & Brake", price: 780, stock: 6, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Ports: "8", Pressure: "10 bar", Thread: "M22 x 1.5" }, image: IMG.protectionValve,
  },
  {
    id: "p24", sku: "DR-AIR-1382", name: "Electronic Air Processing Unit", brand: "Knorr-Bremse", partNumber: "K020023N50",
    oe: ["7421720144", "21720144"], category: "Air & Brake", price: 2480, stock: 3, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Voltage: "24 V", Pressure: "12.5 bar", Ports: "12" }, image: IMG.protectionValve,
  },
  {
    id: "p112", sku: "DR-AIR-1420", name: "Air Dryer Cartridge, Standard", brand: "WABCO / ZF", partNumber: "432 410 020 2",
    oe: ["81521020012", "81.52102.0012"], category: "Air & Brake", price: 155, stock: 60, warehouse: DIP,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Thread: "G 1 1/4", Pressure: "13 bar", Type: "Standard" }, image: IMG.dryer,
  },
  {
    id: "p113", sku: "DR-AIR-1437", name: "Air Dryer Cartridge, Oil Separator", brand: "Knorr-Bremse", partNumber: "K039454X00",
    oe: ["81521020012"], category: "Air & Brake", price: 205, stock: 34, warehouse: SHJ,
    fitment: ["MAN TGX", "MAN TGS"],
    specs: { Thread: "G 1 1/4", Pressure: "13 bar", Type: "Oil separator" }, image: IMG.dryer,
  },
  {
    id: "p114", sku: "DR-AIR-1453", name: "Air Dryer Cartridge", brand: "WABCO / ZF", partNumber: "432 410 244 2",
    oe: ["21620181", "7421620181"], category: "Air & Brake", price: 180, stock: 48, warehouse: JAFZ,
    fitment: ["Volvo FH", "Volvo FM", "Renault Trucks T"],
    specs: { Thread: "M39 x 1.5", Pressure: "13 bar", Type: "Coalescence filter" }, image: IMG.dryer,
  },
  {
    id: "p115", sku: "DR-AIR-1470", name: "Air Dryer Cartridge", brand: "Sampa", partNumber: "096.213",
    oe: ["1518683", "2117560"], category: "Air & Brake", price: 145, stock: 52, warehouse: AUH,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Thread: "M39 x 1.5", Pressure: "13 bar", Type: "Standard" }, image: IMG.dryer,
  },
  {
    id: "p116", sku: "DR-AIR-1486", name: "Air Dryer Cartridge", brand: "Febi Bilstein", partNumber: "103012",
    oe: ["1681570", "1907612"], category: "Air & Brake", price: 160, stock: 44, warehouse: DIP,
    fitment: ["DAF XF", "DAF CF", "Iveco Stralis"],
    specs: { Thread: "M39 x 1.5", Pressure: "13 bar", Type: "Standard" }, image: IMG.dryer,
  },
  {
    id: "p117", sku: "DR-AIR-1503", name: "Air Dryer Cartridge Plus", brand: "Knorr-Bremse", partNumber: "K087958K50",
    oe: ["A0004295695"], category: "Air & Brake", price: 240, stock: 30, warehouse: SHJ,
    fitment: ["Mercedes-Benz Actros", "MAN TGX", "DAF XF"],
    specs: { Thread: "M39 x 1.5", Pressure: "14 bar", Type: "Oil separator" }, image: IMG.dryer,
  },
  {
    id: "p118", sku: "DR-AIR-1519", name: "Pressure Regulator Valve", brand: "WABCO / ZF", partNumber: "975 303 473 0",
    oe: ["A0034317206", "0034317206"], category: "Air & Brake", price: 420, stock: 12, warehouse: JAFZ,
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor"],
    specs: { Pressure: "8.1 bar", Ports: "3", Thread: "M22 x 1.5" }, image: IMG.protectionValve,
  },
  {
    id: "p119", sku: "DR-AIR-1536", name: "Four-Circuit Protection Valve", brand: "Knorr-Bremse", partNumber: "AE4613",
    oe: ["20718005", "7420718005"], category: "Air & Brake", price: 740, stock: 7, warehouse: AUH,
    fitment: ["Volvo FH", "Volvo FM"],
    specs: { Ports: "6", Pressure: "10 bar", Thread: "M22 x 1.5" }, image: IMG.protectionValve,
  },
  {
    id: "p120", sku: "DR-AIR-1552", name: "Trailer Control Valve", brand: "WABCO / ZF", partNumber: "973 009 300 0",
    oe: ["A0044296344", "0044296344"], category: "Air & Brake", price: 1150, stock: 5, warehouse: DIP,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Pressure: "10 bar", Ports: "5", Type: "Pneumatic" }, image: IMG.protectionValve,
  },
  {
    id: "p121", sku: "DR-AIR-1569", name: "Foot Brake Valve", brand: "Knorr-Bremse", partNumber: "DX65B",
    oe: ["1450391", "1519212"], category: "Air & Brake", price: 880, stock: 6, warehouse: SHJ,
    fitment: ["Scania R Series", "Scania G Series", "Scania P Series"],
    specs: { Pressure: "10 bar", Circuits: "2", Thread: "M16 x 1.5" }, image: IMG.footBrakeValve,
  },
  {
    id: "p122", sku: "DR-AIR-1585", name: "Relay Valve", brand: "WABCO / ZF", partNumber: "973 011 000 0",
    oe: ["81521166113", "81.52116.6113"], category: "Air & Brake", price: 310, stock: 19, warehouse: JAFZ,
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"],
    specs: { Pressure: "10 bar", Ports: "4", Thread: "M22 x 1.5" }, image: IMG.protectionValve,
  },
  {
    id: "p123", sku: "DR-AIR-1602", name: "Air Compressor Repair Kit", brand: "Sampa", partNumber: "093.312",
    oe: ["A5411300215", "5411300215"], category: "Air & Brake", price: 265, stock: 21, warehouse: AUH,
    fitment: ["Mercedes-Benz Actros MP3", "Mercedes-Benz Axor"],
    specs: { Bore: "92 mm", Contents: "Piston rings, gaskets, valve plate", Pieces: "11" }, image: IMG.compressorKit,
  },
  {
    id: "p124", sku: "DR-AIR-1618", name: "Compressed Air Dryer, Complete", brand: "Knorr-Bremse", partNumber: "LA8135",
    oe: ["A0004302915", "0004302915"], category: "Air & Brake", price: 2650, stock: 3, warehouse: QUOZ,
    fitment: ["Mercedes-Benz Actros MP4", "Mercedes-Benz Arocs"],
    specs: { Voltage: "24 V", Pressure: "12.5 bar", Type: "Single chamber, heated" }, image: IMG.dryer,
  },
  // Verified manufacturer-catalog records. Price, stock and warehouse require supplier confirmation.
  {
    id: "verified-1", sku: "MANN-HU12140X", name: "Oil Filter HU 12 140 x", brand: "MANN-FILTER", partNumber: "HU 12 140 x",
    oe: ["5411840325", "5411800209", "4571800009"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor", "Neoplan"], specs: { Height: "313 mm", OuterDiameter: "113 mm", InnerDiameter: "45 mm", GTIN: "4011558268909" }, image: IMG.oil,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/en/catalog/search-results/product.html/hu12140x_mann-filter.html",
  },
  {
    id: "verified-2", sku: "MANN-HU12003X", name: "Oil Filter HU 12 003 x", brand: "MANN-FILTER", partNumber: "HU 12 003 x",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["MAN TGX", "MAN TGS"], specs: { Height: "234 mm", OuterDiameter: "120 mm", InnerDiameter: "53 mm", GTIN: "4011558059279" }, image: IMG.oil,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/de-de/katalog/suchergebnisse/produkt.html/hu12003x_mann-filter.html",
  },
  {
    id: "verified-3", sku: "MANN-C27023", name: "Air Filter C 27 023", brand: "MANN-FILTER", partNumber: "C 27 023",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["MAN TGX", "MAN TGS"], specs: { Height: "510 mm", OuterDiameter: "267 mm", InnerDiameter: "170 mm", SecondaryElement: "CF 1640" }, image: IMG.air,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/en/catalog/search-results/product.html/c27023_mann-filter.html",
  },
  {
    id: "verified-4", sku: "MANN-HD6018", name: "Hydraulic Steering Filter HD 6018", brand: "MANN-FILTER", partNumber: "HD 6018",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor", "Mercedes-Benz Atego"], specs: { Height: "100 mm", OuterDiameter: "60 mm", InnerDiameter: "18 mm", GTIN: "4011558572488" }, image: IMG.oil,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/en/catalog/search-results/product.html/hd6018_mann-filter.html",
  },
  {
    id: "verified-5", sku: "MANN-C6415001", name: "Panel Air Filter C 64 1500/1", brand: "MANN-FILTER", partNumber: "C 64 1500/1",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Mercedes-Benz Actros", "Mercedes-Benz Axor", "Mercedes-Benz Atego"], specs: { Width: "24.6 in", InnerWidth: "22.2 in", Height: "3.1 in", Type: "Panel air filter" }, image: IMG.air,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/us-en/catalog/search-results/product.html/c641500/1_mann-filter.html",
  },
  {
    id: "verified-6", sku: "MANN-HU131253X", name: "Oil Filter HU 13 125/3 x", brand: "MANN-FILTER", partNumber: "HU 13 125/3 x",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["MAN TGX", "MAN TGS", "MAN TGA"], specs: { Type: "Oil filter element", EngineFamily: "MAN D2066 / D2676", Application: "Commercial vehicle" }, image: IMG.oil,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/us-en/catalog/search-results/product.html/hu13125/3x_mann-filter.html",
  },
  {
    id: "verified-7", sku: "MANN-U1003", name: "Urea Filter U 1003", brand: "MANN-FILTER", partNumber: "U 1003",
    oe: ["See official catalog"], category: "Filters", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["MAN TGX", "MAN TGS"], specs: { Type: "Urea prefilter", EmissionStandard: "Euro 5 / Euro 6 / EEV", EngineFamily: "D2066 / D2676" }, image: IMG.fuel,
    verified: true, commercialData: false, source: "https://www.mann-filter.com/uk-en/catalogue/search-results/product.html/u1003_mann-filter.html",
  },
  {
    id: "verified-8", sku: "WABCO-4324102227", name: "Essential Air Dryer Cartridge", brand: "WABCO / ZF", partNumber: "432 410 222 7",
    oe: ["4324102227"], category: "Air & Brake", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Universal spin-on air dryer applications"], specs: { WorkingPressure: "14 bar", Port: "M39 x 1.5", Colour: "White", ServiceInterval: "Up to 1 year" }, image: IMG.dryer,
    verified: true, commercialData: false, source: "https://www.wabco-customercentre.com/catalog/docs/wabco_product-catalogue_en.pdf",
  },
  {
    id: "verified-9", sku: "WABCO-4324100202", name: "Standard Air Dryer Cartridge", brand: "WABCO / ZF", partNumber: "432 410 020 2",
    oe: ["4324100202"], category: "Air & Brake", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Mechanical and electronic air dryers"], specs: { WorkingPressure: "14 bar", Port: "M39 x 1.5", Colour: "Black", ServiceInterval: "Up to 2 years" }, image: IMG.dryer,
    verified: true, commercialData: false, source: "https://www.wabco-customercentre.com/catalog/docs/wabco_product-catalogue_en.pdf",
  },
  {
    id: "verified-10", sku: "WABCO-4329012232", name: "Air System Protector Cartridge", brand: "WABCO / ZF", partNumber: "432 901 223 2",
    oe: ["4329012232"], category: "Air & Brake", price: 0, stock: 0, warehouse: "Supplier confirmation required",
    fitment: ["Mechanical and electronic air dryers"], specs: { WorkingPressure: "14 bar", Port: "M39 x 1.5", Type: "Coalescing cartridge", Function: "Moisture and oil separation" }, image: IMG.dryer,
    verified: true, commercialData: false, source: "https://www.wabco-customercentre.com/catalog/docs/wabco_product-catalogue_en.pdf",
  },
];
