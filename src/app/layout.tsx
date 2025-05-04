import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'Desafio GAC',
  description: 'Desafio frontend grupo Adriano Cobucci',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body>
        <>
          {children}
          <ToastContainer position="bottom-right" theme="colored" />
        </>
      </body>
    </html>
  );
}
