const FEEDBACK_URL = 'https://tally.so/r/7Rjpgz?project=FicRadar'

export default function FeedbackLink() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noreferrer"
      className="text-fr-accent underline underline-offset-2 transition-[color] duration-150 hover:text-white"
    >
      Send feedback
    </a>
  )
}
