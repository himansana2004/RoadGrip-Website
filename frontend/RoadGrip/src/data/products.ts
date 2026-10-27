export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  size: string;
  width: number;
  aspectRatio: number;
  rimDiameter: number;
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  image: string;
  description: string;
  loadIndex: string;
  speedRating: string;
}
