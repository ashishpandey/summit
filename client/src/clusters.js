import React, { Component } from 'react';
import { Link } from "react-router-dom";
import fetchData from './serverApi';
import * as R from 'ramda';
import SubHeader from "./common/sub_header";
import './clusters.css';
import Description from "./common/description";

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
      clusterName => (<li key={clusterName}><Link to={`/cluster/${clusterName}`}>{clusterName}</Link></li>),
      this.state.clusters);
    return (
      <div>
        <SubHeader title='clusters'/>
        <Description>The following clusters are configured:</Description>
        <ul className='cluster-list'>{clusters}</ul>
      </div>
    )
  }
}
