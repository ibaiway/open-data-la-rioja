import type { Metadata } from 'next'
import { IBM_Plex_Sans, Inconsolata } from 'next/font/google'
import './globals.css'
import clsx from 'clsx'

const incosolata = Inconsolata({ 
  subsets: ['latin'],
  variable: "--font-inconsolata",
  display: "swap",
})

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "600"],
  display: "swap"
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className='dark'>
      <body className={clsx(incosolata.variable, ibmPlexSans.variable, "bg-white dark:bg-slate-950")}>
          {children}
      </body>
    </html>
  )
}