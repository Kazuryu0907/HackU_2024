import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import "./globals.css";
import './App.css'

import MyGoogleMap from './MyGoogleMap.tsx'
import TrainTimeTable from './TrainTimeTable.tsx'


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h2 className="moji">Hello!</h2>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}

      {/* <p>Google Maps with Next.js and TypeScript</p> */}
      <div className='wh-full'>
        <MyGoogleMap />
        <TrainTimeTable/>
      </div>
      
    </>
  )
}

export default App
