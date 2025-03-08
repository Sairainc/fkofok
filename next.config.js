/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'rlwfhcyhusvihctzaqfn.supabase.co', // Supabase Storage
      'vercel.com', // Vercel
      'profile.line-scdn.net', // LINE Profile Images
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    NEXT_PUBLIC_LINE_ADD_FRIEND_URL: process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_MEN_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_MEN_PRICE_ID,
    NEXT_PUBLIC_STRIPE_WOMEN_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_WOMEN_PRICE_ID,
    NEXT_PUBLIC_SQUARE_MEN_PRICE_ID: process.env.NEXT_PUBLIC_SQUARE_MEN_PRICE_ID,
    NEXT_PUBLIC_SQUARE_WOMEN_PRICE_ID: process.env.NEXT_PUBLIC_SQUARE_WOMEN_PRICE_ID,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_LIFF_REDIRECT_URL: process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL,
  },
}

module.exports = nextConfig 