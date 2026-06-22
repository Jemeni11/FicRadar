import React from 'react'
import ReactDOM from 'react-dom/client'

import AuthorScrapeTab from './author-scrape.tsx'

import '@/assets/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthorScrapeTab />
  </React.StrictMode>,
)
