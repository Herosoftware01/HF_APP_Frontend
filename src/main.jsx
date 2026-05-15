
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { registerLicense } from '@syncfusion/ej2-base'

// registerLicense('Ngo9BigBOggjHTQxAR8/V1JHaF5cWWdCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWXxcdHRWRmFfU01+WkBWYEo=');


// const host = window.location.hostname

// // favicon
// const favicon = document.getElementById('app-favicon')

// // create manifest dynamically
// const manifestLink = document.createElement('link')
// manifestLink.rel = 'manifest'

// if (host === 'hf.herofashion.com') {
//   favicon.href = '/icons/application.png'
//   manifestLink.href = '/manifest-hf.json'

//   document.title = 'Production APP'

//   // optional theme color update
//   updateThemeColor('#42b883')

// } else {
//   favicon.href = '/icons/pwa-icon.png'
//   manifestLink.href = '/manifest-other.json'

//   document.title = 'Development APP'

//   updateThemeColor('#000000')
// }

// document.head.appendChild(manifestLink)

// function updateThemeColor(color) {
//   let metaTheme = document.querySelector('meta[name="theme-color"]')

//   if (!metaTheme) {
//     metaTheme = document.createElement('meta')
//     metaTheme.name = 'theme-color'
//     document.head.appendChild(metaTheme)
//   }

//   metaTheme.content = color
// }

// createRoot(document.getElementById('root')).render(
//   <App />
// )



import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerLicense } from '@syncfusion/ej2-base'

registerLicense('Ngo9BigBOggjHTQxAR8/V1JHaF5cWWdCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWXxcdHRWRmFfU01+WkBWYEo=');

const host = window.location.hostname;

// favicon
function setFavicon(icon) {
  let link = document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = icon + "?v=" + Date.now(); // cache fix
}

// theme color
function setTheme(color) {
  let meta = document.querySelector('meta[name="theme-color"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = color;
}

// DOMAIN LOGIC
if (host === "hf.herofashion.com") {
  setFavicon("/icons/application.png");
  setTheme("#42b883");
} else {
  setFavicon("/icons/pwa-icon.png");
  setTheme("#000000");
}

createRoot(document.getElementById("root")).render(<App />);