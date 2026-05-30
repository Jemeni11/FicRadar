import Radar from '@/components/shared/Radar'

export default function PopupHeader() {
  return (
    <header className="flex w-full items-center gap-3 border-b border-white/5 bg-fr-2 px-4 py-3">
      <div className="size-10 shrink-0">
        <Radar />
      </div>
      <h1
        className="text-xl font-semibold tracking-tight text-white"
        translate="no"
      >
        FicRadar
      </h1>
    </header>
  )
}
