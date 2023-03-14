import * as React from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';

export interface ILayoutProps {
}

export default function Layout(props: ILayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const enableDownload = () => {
    const e = document.createElement('script');
    e.setAttribute('src', 'https://nytimes.github.io/svg-crowbar/svg-crowbar-2.js');
    e.setAttribute('class', 'svg-crowbar');
    document.body.appendChild(e);
  };

  return (
    <div>
      <h1 onClick={() => navigate('/')}>Research Figs - {location.pathname}</h1>
      <Outlet />
      <div style={{marginTop: '5rem'}} />
      <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <button style={{marginBottom: '1rem'}} onClick={(() => enableDownload())}>Enable Download (svg-crowbar)</button>
        <span style={{color: 'gray'}}>Updated: {new Date().toLocaleString()}</span>
        <div style={{flex: 1}} />
        <span><a style={{color: 'gray'}} href={'https://github.com/billchen2k'}>@billchen2k</a></span>
      </div>
    </div>
  );
}
