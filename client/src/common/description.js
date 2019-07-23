import React from 'react';
import './description.css';

export default function Description(props) {

  const {children} = props;

  return (
    <div className='description'>{children}
    </div>
  )

}
