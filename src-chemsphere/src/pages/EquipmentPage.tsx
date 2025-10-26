import Sidebar from '../components/Sidebar'

export default function EquipmentPage(){
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page">
        <h1 className="h3">Equipment</h1>
        <p className="mb-0">Equipment management UI (search, add, import/export) - scaffolded.</p>
      </main>
    </div>
  )
}
