import { Dashboard } from '../components/Dashboard'

export default function Home() {
  return (
    <main className="app-grid-noise relative overflow-x-clip px-4 pb-10 pt-6 md:px-8 md:pt-9">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-120px] top-[-140px] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(255,122,50,0.38)_0%,_rgba(255,122,50,0)_66%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-160px] top-[-110px] h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(15,123,159,0.35)_0%,_rgba(15,123,159,0)_69%)]"
      />
      <div className="mx-auto max-w-7xl">
        <Dashboard />
      </div>
    </main>
  )
}