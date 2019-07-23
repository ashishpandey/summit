import React from 'react';
import {Link} from "react-router-dom";

export default function SubHeader(props) {

  const {title, links = []} = props;

  const linkObjects = [];
  links.forEach(link => {
    linkObjects.push(<Link to={link.path} className='previous'>{link.text}</Link>)
    linkObjects.push(<div className='previous'>&nbsp;>&nbsp;</div>)
  });

  return (
    <div className='App-subheader'>
      {linkObjects}
      <div className='current'>{title}</div>
    </div>
  )

}
