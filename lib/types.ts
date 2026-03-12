export type Restaurant = {
  id: string
  slug: string
  name: string
  tagline: string
  about: string | null
  address: string
  phone: string
  email: string | null
  hours: string
  cover_image_url: string | null
  logo_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  seo_title: string | null
  seo_description: string | null
  online_order_enabled: boolean | null
}

export type MenuCategory = {
  id: string
  restaurant_id: string
  name: string
  position: number
}

export type MenuItem = {
  id: string
  category_id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  image_url: string | null
  is_available: boolean
  position: number
}

export type GalleryImage = {
  id: string
  restaurant_id: string
  image_url: string
  position: number
}

export type Event = {
  id: string
  restaurant_id: string
  title: string
  description: string | null
  event_date: string
  show_button: boolean
  button_label: string | null
  created_at: string
}

