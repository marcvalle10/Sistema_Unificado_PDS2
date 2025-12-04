'use client'
import * as React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({
  children,
  isLoading,
  className = '',
  disabled,
  ...rest // <- aquí vienen type, onClick, etc.
}: Props) {
  return (
    <button
      // type, onClick, etc. se pasan con {...rest}
      {...rest}
      disabled={disabled || isLoading}
      className={`w-full py-3 px-4 bg-yellow-500 text-white rounded-xl font-semibold text-xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)] transition-all ${
        disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-600'
      } ${className}`}
    >
      {isLoading ? 'Cargando…' : children}
    </button>
  )
}
