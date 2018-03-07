import React, { Component } from 'react';
import * as R from 'ramda';
import {ButtonToolbar, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';

export default class Cluster extends Component {
  state = {
    showOk: true,
    summaries: [],
    initialized: false
  };

  componentDidMount() {
    this.refreshStatus();
    this.interval = setInterval(this.refreshStatus.bind(this), 10000);
  }

  toggleShowOk(targetState) {
    this.setState({ showOk: targetState })
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  refreshStatus() {
    this.loadClusterStatus()
      .then(res => this.setState({ initialized: true, summaries: res }))
      .catch(err => console.log(err));
  }

  loadClusterStatus = async () => {
    const { clusterName } = this.props.match.params;
    const response = await fetch(`/api/monit/cluster/${clusterName}/summary`);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    const { clusterName } = this.props.match.params;

    const visibleSummary = summary => (this.state.showOk || !summary.allOk);

    const loading = () => this.state.initialized ? null : (<div>Loading...</div>);
    const summaryTable = () => {
      const filteredRows = R.filter(visibleSummary, this.state.summaries);
      const visibleRows = R.map(status => (
        <tr>
          <th style={{ backgroundColor: status.led }}></th>
          <td className={status.instanceOk ? '' : 'err'}>{status.instance}</td>
          <td className={status.serviceOk ? '' : 'err'}>{status.service}</td>
          <td>{status.type}</td>
          <td className={status.monitored ? '' : 'warn'}>{status.monitored ? 'YES' : 'NO'}</td>
          <td className={status.pendingactions ? 'warn' : ''}>{status.pendingactions ? 'YES' : 'NO'}</td>
        </tr>
      ), filteredRows);

      const filterSummary = this.state.showOk ?
          <div>Displaying all {this.state.summaries.length} rows</div> :
          <div>
            Showing {filteredRows.length} rows. {this.state.summaries.length - filteredRows.length} healthy rows hidden
          </div>;

      return (
        <div>
          {filterSummary}
          <table className='table'>
            <thead>
              <th style={{width: 40}}></th>
              <th>instance</th>
              <th>service</th>
              <th>service type</th>
              <th>monitored</th>
              <th>pending actions</th>
            </thead>
            <tbody>
              {visibleRows}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div>
        <h3>Cluster: {clusterName}</h3>
        <ButtonToolbar style={{float: 'right', position: 'absolute', top: 7, right: 7}}>
          <ToggleButtonGroup type="radio" name="showAllChoice"
              value={this.state.showOk} onChange={this.toggleShowOk.bind(this)}>
            <ToggleButton value={true}>Show All</ToggleButton>
            <ToggleButton value={false}>Hide Green</ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
        { loading() || summaryTable() }
      </div>
    );
  }
}
