import React, {Component} from 'react';
import * as R from 'ramda';
import Popup from 'react-popup';
import {openPage} from "./dom_utils";
import {post, postAll, retrievePermission} from "./monit_utils";
import './cluster_by_service.css';
import './popup.css';
import SubHeader from "../common/sub_header";

const groupSummaryByInstance = (summaries) => {


  const groupUrl = (acc, status) => {
    acc[status.instance] = status.instanceUrl;
    return acc;
  };
  const monitorServices = summaries.filter(s => s.instanceOk === true && R.contains(s.type, ['program', 'process']));
  const instancesDown = summaries.filter(s => s.instanceOk === false).map(s => s.instance);

  const instancesUp = R.uniq(monitorServices.map(s => s.instance));
  const instances = R.union(instancesUp, instancesDown);
  const instanceToUrl = R.reduce(groupUrl, {}, summaries);

  const services = R.uniq(monitorServices.map(s => s.service)).sort();

  const byInstanceAndService = s => `${s.instance}|${s.service}`;
  const statusByInstanceAndService = R.groupBy(byInstanceAndService, monitorServices);

  const instanceUrl = (instance) => {
    return instanceToUrl[instance];
  };

  const serviceUrl = (instance, service) => {
    return `${instanceUrl(instance)}/${service}`;
  };

  const instanceUrls = () => {
    return instances.map(instanceUrl)
  };

  return {

    instances,
    services,

    instanceOk: (instance) => R.contains(instance, instancesUp),

    status: (instance, service) => {
      const statusList = statusByInstanceAndService[byInstanceAndService({instance, service})];
      if (statusList) {
        if (statusList.length > 1) {
          console.log(`There are multiple status. instance=${instance}, service=${service}`, statusList);
        }
        return statusList[0];
      } else {
        return null
      }
    },

    statusByService: (service) => {
      return monitorServices.filter(s => s.service === service);
    },

    statusByInstance: (instance) => {
      return monitorServices.filter(s => s.instance === instance);
    },

    serviceUrls: (service) => {
      return monitorServices.filter(s => s.service === service).map(s => serviceUrl(s.instance, s.service));
    },

    instanceUrl,
    instanceUrls,
    serviceUrl

  }
};

const showPopupForOneService = (instance, service, statusGroup) => {

  Popup.create({
    title: `${service} at ${instance}`,
    content: <span>start or stop service <b>{service}</b> at <b>{instance}</b><br/><i>press [esc] to close</i></span>,
    buttons: {
      left: [
        {
          text: 'Stop',
          className: 'danger',
          action: () => {
            post(statusGroup.serviceUrl(instance, service), {action: 'stop'});
            Popup.close();
          }
        }
      ],
      right: [
        {
          text: 'Start',
          className: 'success',
          action: () => {
            post(statusGroup.serviceUrl(instance, service), {action: 'start'});
            Popup.close();
          }
        },
        {
          text: 'Goto Monit',
          action: () => {
            openPage(statusGroup.serviceUrl(instance, service));
            Popup.close();
          }
        },
      ]
    }
  });
};

const showPopupForMultipleServices = (selected, statusGroup) => {

  const serviceUrls = selected.map(selected => {
    const parts = selected.split('|');
    return statusGroup.serviceUrl(parts[0], parts[1]);
  });

  Popup.create({
    title: `${serviceUrls.length} service(s)`,
    content: <span>
      start or stop <b>all {serviceUrls.length} services(s)</b><br/>
      <i>press [esc] to close</i>
    </span>,
    buttons: {
      left: [
        {
          text: `Stop all (${serviceUrls.length})`,
          className: 'danger',
          action: () => {
            postAll(serviceUrls, {action: 'stop'});
            Popup.close();
          }
        }
      ],
      right: [
        {
          text: `Start all (${serviceUrls.length})`,
          className: 'success',
          action: () => {
            postAll(serviceUrls, {action: 'start'});
            Popup.close();
          }
        }
      ]
    }
  });
};

export default class ClusterByService extends Component {
  state = {
    showOk: true,
    summaries: [],
    initialized: false,
    selected: [],
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
    const previouslyInitialized = this.state.initialized;
    this.loadClusterStatus()
      .then(res => {
        this.setState({initialized: true, summaries: res});
        return res;
      })
      .then( res => {
        if (!previouslyInitialized) {
          const statusGroup = groupSummaryByInstance(res);
          retrievePermission(statusGroup.instanceUrls());
        }
      })
      .catch(err => console.log(err));
  }

  loadClusterStatus = async () => {
    const { clusterName } = this.props.match.params;
    const response = await fetch(`/api/monit/cluster/${clusterName}/summary`);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  updateSelected = (instance, service, selected) => {
    const key = `${instance}|${service}`;
    if (R.contains(key, selected)) {
      return selected.filter(k => k !== key);
    } else {
      selected.push(key);
      return selected;
    }
  };

  addSelected = (instance, service, selected) => {
    const key = `${instance}|${service}`;
    if (!R.contains(key, selected)) {
      selected.push(key);
      return selected;
    }
    return selected;
  };

  removeSelected = (instance, service, selected) => {
    const key = `${instance}|${service}`;
    if (R.contains(key, selected)) {
      return selected.filter(k => k !== key);
    }
    return selected;
  };

  select = (instance, service) => {
    const selected = this.updateSelected(instance, service, this.state.selected);
    this.setState({selected: selected})
  };

  setSelected = selected => {
    this.setState({selected});
  };

  isSelected = (instance, service) => {
    const selected = this.state.selected;
    const key = `${instance}|${service}`;
    return R.contains(key, selected);
  };

  clearSelected = () => {
    this.setState({selected: []})
  };

  updateSelectedByStatus = (status) => {
    let allSelected = true;
    status.forEach(s => {
      if (!this.isSelected(s.instance, s.service)) {
        allSelected = false;
      }
    });

    let selected = this.state.selected;
    status.forEach(s => {
      if (allSelected) {
        selected = this.removeSelected(s.instance, s.service, selected);
      } else {
        selected = this.addSelected(s.instance, s.service, selected);
      }
    });
    this.setSelected(selected);
  };

  render() {

    const { clusterName } = this.props.match.params;
    const { summaries, showOk, initialized } = this.state;

    const loading = () => initialized ? null : (<div>Loading...</div>);

    const summaryTable = () => {

      const statusGroup = groupSummaryByInstance(summaries);

      const visibleRows = statusGroup.instances.map(instance => {
        if (statusGroup.instanceOk(instance)) {
          const items = statusGroup.services.map((service, index) => {

            const status = statusGroup.status(instance, service);
            if (status) {
              return (
                <td
                  className={`status clickable led-${status.led} ${this.isSelected(instance, service) ? "selected" : ""}`}
                  key={service}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      this.select(instance, service);
                    } else {
                      if (this.isSelected(instance, service)) {
                        showPopupForMultipleServices(this.state.selected, statusGroup);
                      } else {
                        if (this.state.selected && this.state.selected.length) {
                          this.clearSelected();
                        } else {
                          showPopupForOneService(instance, service, statusGroup);
                        }
                      }

                    }
                  }}>
                </td>
              );
            } else {
              return <td key={service} className={`status ignored ${index%2===0?'even':'odd'}`}/>;
            }

          });
          return (
            <tr key={instance}>
              <td
                className={`instance-name clickable`}>
                <i className="material-icons" onClick={() => {openPage(statusGroup.instanceUrl(instance));}}>toc</i>
                <span onClick={() => { this.updateSelectedByStatus(statusGroup.statusByInstance(instance)); }}>
                {instance}
                </span>
              </td>
              {items}
            </tr>
          );
        } else {
          return (
            <tr key={instance} className='instance-failed'>
              <td className='instance-name clickable'>
                <i className="material-icons" onClick={() => {openPage(statusGroup.instanceUrl(instance))}}>toc</i>
                {instance}
              </td>
              <td className='ignored' colSpan={statusGroup.services.length}/>
            </tr>
          )
        }
      });

      const headers = statusGroup.services.map((service, index) => {
        return (
          <td key={service}
              className={`clickable service-name ${index%2===0?'even':'odd'}`}
              onClick={() => { this.updateSelectedByStatus(statusGroup.statusByService(service)); }}>
            <div><span>{service}</span></div>
          </td>
        )

      });

      return (
        <div className='summary-container'>
          <table className='summary-table'>
            <thead>
            <tr>
              <td/>
              {headers}
            </tr>
            </thead>
            <tbody>
            {visibleRows}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className='App-content'>
        <Popup/>
        <SubHeader title={clusterName} links={[
          {text: 'clusters', path: '/'}
        ]}/>
        { loading() || summaryTable() }
        <div id='hidden_iframes' className='hidden-iframe-container'/>
      </div>
    );
  }
}
