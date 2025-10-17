import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    onValueChange?: (value: string) => void
  }
>(({ className, onValueChange, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    onChange={(e) => onValueChange?.(e.target.value)}
    {...props}
  />
))
Select.displayName = "Select"

// Simplified components that don't create additional select elements
const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("", className)} {...props} />
))
SelectValue.displayName = "SelectValue"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
