// app/components/InputField.tsx

import { useState } from 'react'

export default function InputField({
  label,
  type = 'text',
  error,
  ...props
}: {
  label: string
  type?: string
  error?: string
  [key: string]: any
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="mb-4">
      <label className="block text-zinc-800 text-xl font-normal mb-1">
        {label}
      </label>
      <input
        {...props}
        type={type}
        // 🚨 CORRECCIÓN CLAVE: 'text-gray-900' garantiza que el texto escrito sea oscuro
        className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
          error ? 'border-red-500' : 'border-zinc-300'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}