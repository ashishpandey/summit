import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import logo from './logo.png';
import Clusters from './clusters';

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import ClusterByService from "./cluster_by_service/cluster_by_service";

const alternateAppName = process.env.APP_NAME;

const AppRouter = () => (
  <Router>
    <div className="App">
      <div className='App-header'>
        <div className='App-header-container'>
          <img src={logo} className="App-logo" alt="logo" />
          {alternateAppName ? (
            [
              <div className='App-title'>{alternateAppName}</div>,
              <div className='App-subtitle'>powered by&nbsp;<a href='https://github.com/ashishpandey/summit'>Summit</a></div>
            ]
          ) : (
            <div className='App-title'>Summit</div>
          )}
        </div>
      </div>
      <div className="App-content">
        <Route exact path="/" component={Clusters} />
        <Route path="/cluster/:clusterName" component={ClusterByService} />
      </div>
    </div>
  </Router>
);

export default AppRouter;
