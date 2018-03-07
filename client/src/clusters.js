import React, { Component } from 'react';
import { Link } from "react-router-dom";
import fetchData from './serverApi';
import * as R from 'ramda';

export default class Clusters extends Component {
  state = {
    clusters: []
  };

  componentDidMount() {
    fetchData('/api/monit/clusters')
      .then(res => this.setState({ clusters: res }))
      .catch(err => console.log(err));
  }

  render() {
    const clusters = R.map(
      clusterName => (<li><Link to={`/cluster/${clusterName}`}>{clusterName}</Link></li>),
      this.state.clusters);
    return (
      <div>
        <p>The following clusters are configured:</p>
        <ul>{clusters}</ul>
      </div>
    )
  }
}
