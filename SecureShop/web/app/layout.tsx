import { Inter, Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/shop";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "500"] });

export const metadata = {
  title: "SecureShop",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cart = session ? await getCart() : null;
  const cartCount = cart && cart.error === null ? cart.data.total_quantity : 0;

  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} min-h-screen bg-white font-sans text-neutral-950`}>
        <SiteHeader session={session ? { email: session.email, role_id: session.role_id } : null} cartCount={cartCount} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
