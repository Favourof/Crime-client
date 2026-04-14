import './globals.css';

export const metadata = {
  title: 'Crime Analysis Dashboard',
  description: 'Law enforcement crime analysis system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
