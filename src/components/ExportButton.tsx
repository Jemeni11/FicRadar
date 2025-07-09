const ExportButton = ({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition">
    {icon}
    {label}
  </button>
)

export default ExportButton
