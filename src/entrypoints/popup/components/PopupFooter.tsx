import { BuyMeACoffeeIcon, GitHubSponsorsIcon } from '@/icons'

export default function PopupFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-white/5 bg-fr-3 px-4 py-4 text-xs text-fr-muted">
      <p className="text-pretty">
        Made with <span className="text-red-400">❤️</span> by{' '}
        <a
          href="https://github.com/Jemeni11"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-fr-accent underline underline-offset-2 transition-[color] duration-150 hover:text-white"
        >
          Jemeni11
        </a>
        {' · '}
        <a
          href="https://github.com/Jemeni11/FicRadar"
          target="_blank"
          rel="noreferrer"
          className="text-fr-accent underline underline-offset-2 transition-[color] duration-150 hover:text-white"
        >
          GitHub
        </a>
      </p>

      <div className="flex items-center gap-1">
        <a
          href="https://www.buymeacoffee.com/jemeni11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy Me a Coffee"
          className="flex size-10 items-center justify-center rounded-lg text-fr-muted transition-[color] duration-150 hover:text-[#FFDD00]"
        >
          <BuyMeACoffeeIcon className="size-5" />
        </a>
        <a
          href="https://github.com/sponsors/Jemeni11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Sponsors"
          className="flex size-10 items-center justify-center rounded-lg text-fr-muted transition-[color] duration-150 hover:text-[#EA4AAA]"
        >
          <GitHubSponsorsIcon className="size-5" />
        </a>
      </div>
    </footer>
  )
}
