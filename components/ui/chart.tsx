"use client"

import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { TooltipProps } from "recharts"

interface ChartProps {
  children: React.ReactNode
  config: Record<string, { label: string; color: string }>
  className?: string
}

interface CustomCSSProperties extends React.CSSProperties {
  '--color-keys'?: string
  [key: `--color-${string}`]: string | undefined
}

export function ChartContainer({ children, config, className }: ChartProps) {
  return (
    <TooltipProvider>
      <div
        className={className}
        style={
          {
            "--color-keys": Object.keys(config).join(","),
            ...Object.entries(config).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [`--color-${key}`]: value.color,
              }),
              {}
            ),
          } as CustomCSSProperties
        }
      >
        {children}
      </div>
    </TooltipProvider>
  )
}

type ChartValue = string | number

interface TooltipPayloadItem {
  name: string
  value: ChartValue
  payload?: {
    label?: string
    [key: string]: ChartValue | string | undefined
  }
}

interface ChartTooltipProps extends Omit<TooltipProps<ChartValue, string>, 'payload'> {
  payload?: TooltipPayloadItem[]
}

interface ChartTooltipContentProps {
  className?: string
  style?: CustomCSSProperties
  payload?: TooltipPayloadItem[]
  active?: boolean
  label?: string
  hideLabel?: boolean
}

export const ChartTooltip = function ChartTooltip(props: ChartTooltipProps) {
  if (!props.active || !props.payload?.length) {
    return null
  }
  
  return <ChartTooltipContent {...props} />
}

export function ChartTooltipContent({
  className,
  style,
  payload = [],
  active,
  label,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload.length) {
    return null
  }

  const keys = style?.["--color-keys"]?.toString().split(",") ?? []

  return (
    <TooltipContent className={className}>
      <div className="space-y-1">
        {!hideLabel && (label || payload[0]?.payload?.label) && (
          <div>{label || payload[0]?.payload?.label}</div>
        )}
        <div className="flex flex-col gap-0.5">
          {payload.map((item, index) => {
            const name = item.name
            const value = item.value
            const key = keys[index] ?? String(name).toLowerCase()
            return (
              <div key={String(name)} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="size-2 rounded-full"
                    style={{
                      background: `var(--color-${key})`,
                    }}
                  />
                  <span>{name}</span>
                </div>
                <span>{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipContent>
  )
}

