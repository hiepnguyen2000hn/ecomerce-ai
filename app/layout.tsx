import type {Metadata} from 'next';
import { Inter, Space_Grotesk, Geist } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/providers/root-provider';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LEVELUP | Ecommerce OS',
  description: 'Advanced management platform for modern e-commerce',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn(spaceGrotesk.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-white dark:bg-[#080808] text-black dark:text-white transition-colors duration-500 selection:bg-blue-500 selection:text-white">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
