import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContextProvider from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import NotificationSystem from "@/components/NotificationSystem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quick Delivery - POS System",
  description: "Modern POS system with delivery management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
          {children}
          <NotificationSystem />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </AuthContextProvider>
      </body>
    </html>
  );
}
