import Radar from '@/components/shared/Radar'

export default function PopupHeader() {
  return (
    <header className="flex w-full items-center gap-3 border-b border-white/5 bg-fr-2 px-4 py-3 pointer-coarse:flex-col pointer-fine:flex-row">
      <div className="pointer-coarse:flex pointer-coarse:size-40 pointer-coarse:items-center pointer-coarse:justify-center pointer-fine:size-10 pointer-fine:shrink-0">
        <Radar />
      </div>
      <h1
        className="font-semibold tracking-tight text-white pointer-coarse:text-3xl pointer-fine:text-xl"
        translate="no"
      >
        FicRadar
      </h1>
    </header>
  )
}
