"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { CheckCircle2, CircleAlert, Info, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ICONE_POR_TIPO = {
  sucesso: CheckCircle2,
  erro: CircleAlert,
  aviso: Info,
} as const

export type TipoDeAviso = keyof typeof ICONE_POR_TIPO

const COR_POR_TIPO: Record<TipoDeAviso, string> = {
  sucesso: "text-success",
  erro: "text-destructive",
  aviso: "text-muted-foreground",
}

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

/**
 * A pilha de avisos. Fica montada uma vez, na casca, e qualquer tela publica
 * nela pelo `useAvisos`.
 */
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        className={cn(
          "fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none",
          className
        )}
        {...props}
      >
        <ListaDeAvisos />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

function ListaDeAvisos() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <>
      {toasts.map((aviso) => {
        const tipo = (aviso.type ?? "aviso") as TipoDeAviso
        const Icone = ICONE_POR_TIPO[tipo] ?? Info

        return (
          <ToastPrimitive.Root
            key={aviso.id}
            toast={aviso}
            className={cn(
              "flex items-start gap-3 rounded-3xl border border-border bg-popover p-4 text-popover-foreground shadow-lg",
              "data-starting-style:translate-y-2 data-starting-style:opacity-0",
              "data-ending-style:translate-y-2 data-ending-style:opacity-0",
              "transition-[transform,opacity] duration-200"
            )}
          >
            <Icone className={cn("mt-0.5 size-4 shrink-0", COR_POR_TIPO[tipo])} />
            <div className="min-w-0 flex-1 space-y-0.5">
              <ToastPrimitive.Title className="text-sm font-medium" />
              <ToastPrimitive.Description className="text-sm text-muted-foreground" />
            </div>
            <ToastPrimitive.Close
              aria-label="Fechar"
              render={<Button variant="ghost" size="icon-xs" />}
            >
              <XIcon />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
    </>
  )
}

export { ToastPrimitive, ToastProvider, ToastViewport }
