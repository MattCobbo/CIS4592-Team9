import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'

import UserProfile from './routes/user_profile';
import PrivateRoute from './components/private_route';
import Layout from './components/layout';
import Login from './routes/login';
import Register from './routes/register';
import Home from './routes/home';
import About from './routes/about';
import Search from './routes/search';
<<<<<<< HEAD
import Settings from './routes/settings';
=======
>>>>>>> 169e02a4d6cdb7b35851ccc886deec7133702ae8
import Organizations from './routes/Organizations';
import CreateOrganization from './routes/CreateOrganization';
import OrganizationProfile from './routes/OrganizationProfile';

import { AuthProvider } from './context/useAuth';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Routes>
<<<<<<< HEAD
            <Route element={<Layout><PrivateRoute><UserProfile/></PrivateRoute></Layout>} path='/:username' />
            <Route element={<Layout><PrivateRoute><Home/></PrivateRoute></Layout>} path='/' />
            <Route element={<Layout><PrivateRoute><Search/></PrivateRoute></Layout>} path='/search/:searchValue' />
            <Route element={<Layout><PrivateRoute><About/></PrivateRoute></Layout>} path='/about' />
            <Route element={<Layout><PrivateRoute><Settings/></PrivateRoute></Layout>} path='/settings' />
            <Route element={<Layout><Login/></Layout>} path='/login' />
            <Route element={<Layout><Register/></Layout>} path='/register' />
=======
            <Route element={<Layout><PrivateRoute><UserProfile /></PrivateRoute></Layout>} path='/:username' />
            <Route element={<Layout><PrivateRoute><Home /></PrivateRoute></Layout>} path='/' />
            <Route element={<Layout><PrivateRoute><Search /></PrivateRoute></Layout>} path='/search/:searchValue' />
            <Route element={<Layout><PrivateRoute><About /></PrivateRoute></Layout>} path='/about' />
            <Route element={<Layout><Login /></Layout>} path='/login' />
            <Route element={<Layout><Register /></Layout>} path='/register' />
>>>>>>> 169e02a4d6cdb7b35851ccc886deec7133702ae8
            <Route element={<Layout><PrivateRoute><Organizations /></PrivateRoute></Layout>} path='/organizations' />
            <Route element={<Layout><PrivateRoute><CreateOrganization /></PrivateRoute></Layout>} path='/create-organization' />
            <Route element={<Layout><PrivateRoute><OrganizationProfile /></PrivateRoute></Layout>} path='/organization/:orgId' />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
