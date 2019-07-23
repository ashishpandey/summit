import React from 'react';
import {Link} from "react-router-dom";

export default function SubHeader(props) {

  const {title, links = []} = props;

  const linkObjects = [];
  links.forEach(link => {
    linkObjects.push(<Link key={`${link.text}-link`} to={link.path} className='previous'>{link.text}</Link>)
    linkObjects.push(<div key={`${link.text}-arrow`} className='previous'>&nbsp;>&nbsp;</div>)
  });

  return (
    <div className='App-subheader'>
      {linkObjects}
      <div className='current'>{title}</div>
    </div>
  )

}
