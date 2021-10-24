import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ConditionalIcon(props) {
  const { condition, onTrue, onFalse } = props;

  return (
    <FontAwesomeIcon icon={condition ? onTrue : onFalse} />
  )
}

export default ConditionalIcon
