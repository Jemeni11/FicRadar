import { BuyMeACoffeeIcon, GitHubSponsorsIcon } from '@/icons'

export default function PopupFooter() {
  return (
    <footer className="flex items-center justify-between bg-fr-3 px-4 py-3 text-xs text-white">
      <p className="text-pretty">
        Made with <span className="text-red-500">❤️</span> by{' '}
        <a
          href="https://github.com/Jemeni11"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-fr-1 underline underline-offset-2"
        >
          Jemeni
        </a>
        {' · '}
        <a
          href="https://github.com/Jemeni11/FicRadar"
          target="_blank"
          rel="noreferrer"
          className="text-fr-1 underline underline-offset-2"
        >
          GitHub
        </a>
      </p>

      <div className="flex items-center gap-2">
        <a
          href="https://www.buymeacoffee.com/jemeni11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy Me a Coffee"
        >
          <BuyMeACoffeeIcon />
        </a>
        <a
          href="https://github.com/sponsors/Jemeni11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Sponsors"
        >
          <GitHubSponsorsIcon />
        </a>
      </div>
    </footer>
  )
}
