import 'normalize.css';
import './styles/index.css';

import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom';


ReactDOM.render(
    <React.StrictMode>
      <App/>
    </React.StrictMode>, document.querySelector('#root'),
);
