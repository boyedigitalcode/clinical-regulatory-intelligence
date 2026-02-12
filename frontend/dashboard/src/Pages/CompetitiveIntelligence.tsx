import { useEffect, useState } from "react"
import api from "../services/api"

export default function CompetitiveIntelligence() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get("/competitive").then(res => setData(res.data))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium mb-4">
        Competitive Intelligence
      </h1>

      <pre className="text-sm bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
