import * as React from 'react';
import {Link, Route, RouterProvider, Routes} from 'react-router-dom';
import SemanticMap from './pages/SemanticMap';
import Layout from './Layout';
import GVQA from './pages/GVQA';
import GraphDecoder from './pages/GraphDecoder';

export interface IAppProps {
}

const routes: {
  path: string;
  element: JSX.Element;
}[] = [
  {
    path: '/graphdecoder',
    element: <GraphDecoder />,
  },
  {
    path: '/gvqa',
    element: <GVQA />,
  },
  {
    path: '/semanticmap',
    element: <SemanticMap />,
  },
];

export default function App(props: IAppProps) {
  return (
    <Routes>
      <Route path={'/'} element={<Layout />}>
        <Route path={'/'} element={<React.Fragment>
          <ul>
            {routes.map((one, index) => <li key={index}>
              <Link to={one.path}>{one.path}</Link>
            </li>)}
          </ul>
        </React.Fragment>}/>
        {
          routes.map((one, index) =>
            <Route key={index} path={one.path} element={one.element} />,
          )
        }
      </Route>
    </Routes>

  );
}
