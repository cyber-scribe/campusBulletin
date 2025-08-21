import "./globals.css"

export const metadata = {
  title: 'Campus Bulletin Board',
  description: 'Digital Notice Board for Campus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
