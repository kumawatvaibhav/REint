import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'UK Wind Power Monitor',
    description: 'Live vs Forecast Generation Data from Elexon BMRS',
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
