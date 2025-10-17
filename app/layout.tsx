import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Commute Cost Calculator',
  description: 'Calculate fuel costs and ROI for vehicle upgrades with elevation-aware calculations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
