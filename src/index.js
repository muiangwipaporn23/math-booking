import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './AppRouter';
import 'react-big-scheduler/lib/css/style.css'
import './global.scss';
import './ant.less';

ReactDOM.render(<AppRouter />, document.getElementById("app"));