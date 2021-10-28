import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Toggler from './Toggler';
import './Setting.css';

function Setting() {
  const dispatch = useDispatch();
  const { isLightTheme } = useSelector(store => store.app);

  return (
    <div className="settingWrap">
      <div className="property">
        <span className="description">
          Enable Light Theme
        </span>
        <Toggler bool={isLightTheme} dispatch={dispatch} action={{type: "APP/TOGGLE_LIGHT_THEME"}}/>
      </div>
    </div>
  )
}

export default Setting
