import Radar from '@/components/shared/Radar'

export default function PopupHeader() {
  return (
    <header className="flex w-full items-center gap-3 bg-[linear-gradient(90deg,#141142,#4143c7)] px-4 py-3">
      <div className="size-14 shrink-0">
        <Radar />
      </div>
      <h1 className="text-2xl font-bold text-balance text-white">FicRadar</h1>
    </header>
  )
}
