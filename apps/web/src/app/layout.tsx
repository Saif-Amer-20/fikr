import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'منصّة فِكْر',
  description: 'إدارة الأفكار داخل المؤسسة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}