import * as React from "react"
import { cn } from "../../utils/helpers"

const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { variant?: 'primary' | 'secondary' | 'ghost' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
      ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
    }
    
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
