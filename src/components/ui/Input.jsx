import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, hint, prefix, suffix, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-orange-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-400 text-sm select-none">{prefix}</span>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900
            placeholder:text-gray-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 hover:border-gray-300'}
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-8' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-400 text-sm select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
})

export default Input
