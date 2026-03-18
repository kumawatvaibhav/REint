import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { Header } from '../components/Header'
import './globals.css'

const displayFont = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-display',
})

const monoFont = IBM_Plex_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    weight: ['400', '500'],
})

export const metadata: Metadata = {
    title: 'REint Energy Studio',
    description: 'A redesigned control room for UK wind actuals vs forecasts from Elexon BMRS.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${displayFont.variable} ${monoFont.variable}`}>
                <div className="flex min-h-screen flex-col">
                    <Header />
                    <div className="flex-1">{children}</div>
                </div>
            </body>
        </html>
    )
}
