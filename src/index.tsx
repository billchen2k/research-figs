import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './style/main.css';
import {BrowserRouter} from 'react-router-dom';
import App from './App';


ReactDOM.render(<React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</React.StrictMode>,
document.getElementById('app'),
);

