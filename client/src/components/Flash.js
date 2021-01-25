import { useState } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Flash.css';

function Flash() {
  const [flashMessages, setFlashMessages] = useState([]);

  return (
    <div class="flashWrap">
      {flashMessages.map(message => {
        return (
          <div class="flash">
            <p>{message}</p>
            <FontAwesomeIcon icon={faTimes} onClick={(e) => {
              const flash = e.currentTarget.parentElement;
              const newMessages = flashMessages.slice();
              newMessages.splice(newMessages.indexOf(flash.innerText), 1);
              setFlashMessages(newMessages);
            }}/>
          </div>
        )
      })}
    </div>
  );
}

export default Flash;
