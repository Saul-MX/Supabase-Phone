export interface PhoneColor {
  id: string;
  name: string;
  hex: string;
  imageUrl: string | null;
}

export interface Phone {
  id: string;
  slug: string;
  name: string;
  brand: { name: string; slug: string };
  description: string | null;
  price: number;
  currency: string;
  storageGb: number | null;
  ramGb: number | null;
  screenInches: number | null;
  batteryMah: number | null;
  mainCameraMp: number | null;
  os: string | null;
  imageUrl: string | null;
  colors: PhoneColor[];
}
