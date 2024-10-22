import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import CreateGuitar from "./Pages/CreateInstruments/CreateGuitar.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>

      <CreateGuitar />
  </StrictMode>,
)
