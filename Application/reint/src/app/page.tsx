import {Dashboard} from "../components/Dashboard";

export default function Home(){
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl">
          <Dashboard />
      </div>
    </main>
  )
}