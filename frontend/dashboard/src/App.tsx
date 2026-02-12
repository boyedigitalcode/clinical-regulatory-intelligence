import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"

function Dashboard() {
  return <h1 className="text-2xl font-bold">Executive Dashboard</h1>
}

function Competitive() {
  return <h1 className="text-2xl font-bold">Competitive Intelligence</h1>
}

function FDA() {
  return <h1 className="text-2xl font-bold">FDA Actions</h1>
}

function Safety() {
  return <h1 className="text-2xl font-bold">Safety Signals</h1>
}

function Reports() {
  return <h1 className="text-2xl font-bold">Reports</h1>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/competitive" element={<Competitive />} />
        <Route path="/fda" element={<FDA />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  )
}
