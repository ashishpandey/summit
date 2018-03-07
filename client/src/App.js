import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './logo.png';
import Clusters from './clusters';
import Cluster from './cluster';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './App.css';

const AppRouter = () => (
  <Router>
    <div className="App">
      <header className="App-header">
        <Link to={'/'}><img src={logo} className="App-logo" alt="logo" /></Link>
        <span className="App-title">The sum of all Monits</span>
      </header>
      <div className="App-content">
        <Route exact path="/" component={Clusters} />
        <Route path="/cluster/:clusterName" component={Cluster} />
      </div>
    </div>
  </Router>
);

export default AppRouter;
