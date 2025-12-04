import { useState } from 'react'

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean 
}) {
  return (
    <div className={`flex items-center mb-4 ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled} 
        className={`w-5 h-5 mr-2 accent-blue-900 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      <label 
        className={`text-stone-900 text-xl font-normal ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {label}
      </label>
    </div>
  )
}