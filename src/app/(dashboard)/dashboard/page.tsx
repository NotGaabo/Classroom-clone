'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createClass = async () => {
    const res = await fetch('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    alert('Clase creada 🔥')
  }

  return (
    <div>
      <h1>Crear clase</h1>

      <input
        placeholder="Nombre"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Descripción"
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={createClass}>
        Crear
      </button>
    </div>
  )
}
