export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface Booking {
  services: Service[];
  name: string;
  phone: string;
  date: string;
  time: string;
}

export interface Profile {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  houseNumber: string;
  complement: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface BarbershopInfo {
  id?: number;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  number: string;
  openingHours: string;
  whatsapp: string;
  logo?: string;
}

export type Screen = 'login' | 'signup' | 'home' | 'services' | 'cart' | 'booking' | 'confirmation' | 'profile' | 'admin_login' | 'admin_dashboard' | 'admin_services' | 'admin_products' | 'admin_info';
