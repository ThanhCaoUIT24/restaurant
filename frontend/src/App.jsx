import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './router/routes.jsx';
import { AuthProvider } from './auth/authContext.jsx';

function App() {
  const element = useRoutes(routes);
  return <AuthProvider>{element}</AuthProvider>;
}

export default App;
