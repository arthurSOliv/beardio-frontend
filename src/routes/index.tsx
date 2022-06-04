
  
import React from 'react';

import { Switch } from 'react-router-dom';

import Route from './Route';

import SignIn from '../pages/SIgnIn';
import SignUp from '../pages/SignUp';
// import ForgotPassword from '../pages/ForgotPassword';
// import ResetPassword from '../pages/ResetPassword';

import ClientDashboard from '../pages/Client/Dashboard';
import ClientProfile from '../pages/Client/Profile';
import Providers from '../pages/Client/Providers';
import Provider from '../pages/Client/Provider';
import ProviderDashboard from '../pages/Provider/Dashboard';
import ForgotPassword from '../pages/ForgotPassoword';
import ResetPassword from '../pages/ResetPassword';
import ProviderProfile from '../pages/Provider/Profile';
// import Profile from '../pages/Profile';

import { useAuth } from '../hooks/auth';

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path="/" exact component={SignIn} />
      <Route path="/signup" exact component={SignUp} />
      <Route path="/forgot-password" exact component={ForgotPassword} />
      <Route path="/reset-password" exact component={ResetPassword} />
      <Route path="/clientDashboard" exact component={ClientDashboard} isPrivate />
      <Route path="/clientProfile" exact component={ClientProfile} isPrivate />
      <Route path="/providers" exact component={Providers} isPrivate />
      <Route path="/provider/:id" exact component={Provider} isPrivate />
      <Route path="/providerDashboard" exact component={ProviderDashboard} isPrivate />
      <Route path="/providerProfile" exact component={ProviderProfile} isPrivate />
    </Switch>
  )
};

export default Routes;