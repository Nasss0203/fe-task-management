"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--border-radius": "var(--radius)",

          // Normal
          "--normal-bg": "hsl(0 0% 100%)",
          "--normal-text": "hsl(222 47% 11%)",
          "--normal-border": "hsl(214 32% 88%)",

          // Success — emerald
          "--success-bg": "hsl(0 0% 100%)",
          "--success-text": "hsl(222 47% 11%)",
          "--success-border": "hsl(160 84% 39%)",

          // Error — red
          "--error-bg": "hsl(0 0% 100%)",
          "--error-text": "hsl(222 47% 11%)",
          "--error-border": "hsl(0 84% 60%)",

          // Warning — amber
          "--warning-bg": "hsl(0 0% 100%)",
          "--warning-text": "hsl(222 47% 11%)",
          "--warning-border": "hsl(38 92% 50%)",

          // Info — blue
          "--info-bg": "hsl(0 0% 100%)",
          "--info-text": "hsl(222 47% 11%)",
          "--info-border": "hsl(221 83% 53%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "border-l-[3px]! shadow-md! shadow-slate-100!",
          success: "border-l-emerald-500! [&_[data-icon]]:text-emerald-500!",
          error: "border-l-red-500! [&_[data-icon]]:text-red-500!",
          warning: "border-l-amber-500! [&_[data-icon]]:text-amber-500!",
          info: "border-l-blue-500! [&_[data-icon]]:text-blue-500!",
          description: "text-slate-500! text-[13px]!",
          actionButton: "bg-transparent! border! border-current! text-slate-800! text-[12px]! font-semibold! rounded-md! px-3! py-1! hover:bg-slate-50! transition-colors!",
          cancelButton: "bg-transparent! text-slate-400! text-[12px]! rounded-md! px-2! py-1! hover:text-slate-600!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
