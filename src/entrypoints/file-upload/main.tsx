import React from 'react'
import ReactDOM from 'react-dom/client'

import FileUploadTab from './file-upload.tsx'

import '@/assets/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FileUploadTab />
  </React.StrictMode>,
)
