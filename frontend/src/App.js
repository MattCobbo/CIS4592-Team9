import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'

import UserProfile from './routes/user_profile';
import Layout from './components/layout';
import Login from './routes/login';
import Register from './routes/register';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route element={<Layout><UserProfile/></Layout>} path='/:username' />
          <Route element={<Layout><Login/></Layout>} path='/login' />
          <Route element={<Layout><Register/></Layout>} path='/register' />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
