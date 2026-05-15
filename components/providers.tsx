import { TooltipProvider } from "./ui/tooltip"

export const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <>
    <TooltipProvider>
      {children}
    </TooltipProvider>
    </>
  )
}
