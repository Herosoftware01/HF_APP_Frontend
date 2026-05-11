
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerLicense } from '@syncfusion/ej2-base'

registerLicense('Ngo9BigBOggjHTQxAR8/V1JHaF5cWWdCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWXxcdHRWRmFfU01+WkBWYEo=');


const host = window.location.hostname

// favicon
const favicon = document.getElementById('app-favicon')

// create manifest dynamically
const manifestLink = document.createElement('link')
manifestLink.rel = 'manifest'

if (host === 'hf.herofashion.com') {
  favicon.href = '/icons/application.png'
  manifestLink.href = '/manifest-hf.json'

  document.title = 'Production APP'

  // optional theme color update
  updateThemeColor('#42b883')

} else {
  favicon.href = '/icons/pwa-icon.png'
  manifestLink.href = '/manifest-other.json'

  document.title = 'Development APP'

  updateThemeColor('#000000')
}

document.head.appendChild(manifestLink)

function updateThemeColor(color) {
  let metaTheme = document.querySelector('meta[name="theme-color"]')

  if (!metaTheme) {
    metaTheme = document.createElement('meta')
    metaTheme.name = 'theme-color'
    document.head.appendChild(metaTheme)
  }

  metaTheme.content = color
}

createRoot(document.getElementById('root')).render(
  <App />
)
