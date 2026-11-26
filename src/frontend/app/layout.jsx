import './globals.css';

export const metadata = {
  title: 'Gestão de Espaços',
  description: 'Plataforma de gestão de espaços e reservas'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
