import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

function Toggler(props) {
  const { bool, dispatch, action } = props;

  return (
    <button onClick={() => {
      dispatch(action);
    }}>
      <FontAwesomeIcon icon={bool ? faToggleOn : faToggleOff} size="2x"/>
    </button>
  )
}

export default Toggler
