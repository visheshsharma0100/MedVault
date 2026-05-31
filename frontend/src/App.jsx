import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Signup from './Signup.jsx'
import Signin from './Signin.jsx'
import Dashboard from './Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
