import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        premium:
          "gradient-primary text-white shadow-lg shadow-glow-sm hover:shadow-glow hover:brightness-105 active:scale-[0.98] transition-all duration-300",
        glow:
          "bg-[#e1dcc9] text-black shadow-[0_0_36px_rgba(225,220,201,0.16)] hover:shadow-[0_0_48px_rgba(225,220,201,0.22)]",
        orange:
          "bg-[#e1dcc9] text-black border border-[#e1dcc9]/30 shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:bg-[#d4cdb6] transition-all duration-300 font-bold",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-xl",
        sm: "h-8 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-base font-bold",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button }
