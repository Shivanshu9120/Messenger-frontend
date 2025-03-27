import {BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import GroupCreation from './pages/GroupCreation'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/chat' element={<Home/>}></Route>
      <Route path='/create-group' element={<GroupCreation/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
