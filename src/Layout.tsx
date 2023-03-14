import * as React from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';

export interface ILayoutProps {
}

export default function Layout(props: ILayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div>
      <h1 onClick={() => navigate('/')}>Research Figs - {location.pathname}</h1>
      <Outlet/>
      <p style={{color: 'gray', marginTop: '5rem'}}>Updated: {new Date().toLocaleString()}</p>
    </div>
  );
}
