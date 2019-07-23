import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './logo.png';
import Clusters from './clusters';

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import ClusterByService from "./cluster_by_service/cluster_by_service";

const AppRouter = () => (
  <Router>
    <div className="App">
      <div className='App-header'>
        <img src={logo} className="App-logo" alt="logo" />
        <div className='App-title'>Summit</div>
      </div>
      <div className="App-content">
        <Route exact path="/" component={Clusters} />
        {/*<Route path="/cluster_by_service/:clusterName" component={Cluster} />*/}
        <Route path="/cluster/:clusterName" component={ClusterByService} />
      </div>
    </div>
  </Router>
);

export default AppRouter;
