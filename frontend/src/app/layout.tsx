import { Inter, Manrope } from "next/font/google";
import "@/src/app/globals.css";
import { cn } from "@/src/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["300", "400", "500", "600"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["600", "700", "800"] });

export const metadata = {
  title: "CNI Honduras — Consejo Nacional de Inversiones",
  description:
    "Promoviendo y protegiendo la Inversión Extranjera Directa en la República de Honduras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("scroll-smooth", inter.variable, manrope.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f8f9fa] font-sans text-[#191c1d] antialiased">{children}</body>
    </html>
  );
}
