import { useState } from 'react';
import './Loader.css';

function Loader(props) {
  const { ready } = props;
  const [ hide, setHide ] = useState(false);

  if (ready) {
    setTimeout(() => {
      setHide(true);
    }, 1000);
  }

  return (
    <div class={"loader" + (props.transparent ? " transparent" : "") + (ready ? " complete" : "") + (hide ? " hide" : "")}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 619 619">
        <path id="note_4" data-name="note 4" class="cls-1" d="M518.311,490.688v-62l84-35v-75c-35.664,15-72.337,31-108,46-0.334,39.33.333,77.671,0,117-53.435,4.385-43.856,79.883,10,71C520.806,549.966,545.739,517.545,518.311,490.688Zm61-136c-20,8.666-41,17.335-61,26,0.333,7.333-.334,14.668,0,22,20-8.666,41-17.335,61-26C578.977,369.355,579.644,362.02,579.311,354.687ZM494.44,505.063s11.755-.407,12.25,12.25c0,0,.491,11.843-12.25,12.25,0,0-10.484,1.057-12.249-12.25C482.191,517.313,482.335,505.382,494.44,505.063Z"/>
        <path id="note_3" data-name="note 3" class="cls-1" d="M180.463,522.473v-146l-132,43v118c-60.341,7-38.226,83.481,8,72,16.482-4.094,43.545-30.877,16-62v-62l84-27v55c-56.339,5.752-42.016,83.288,12,71C180.859,581.653,209.2,552.187,180.463,522.473Zm-24-113c-27.664,9.332-56.336,18.668-84,28v23l84-28C156.13,424.807,156.8,417.139,156.463,409.473Zm0.317,128.083s11.755-.407,12.25,12.25c0,0,.491,11.843-12.25,12.25,0,0-10.484,1.057-12.249-12.25C144.531,549.806,144.675,537.875,156.78,537.556ZM47.794,561.631s11.755-.407,12.25,12.25c0,0,.491,11.842-12.25,12.25,0,0-10.485,1.057-12.25-12.25C35.544,573.881,35.688,561.949,47.794,561.631Z"/>
        <path id="note_2" data-name="note 2" class="cls-2" d="M480.406,26c0.334,27.664-.333,55.336,0,83-8.79,4.358-22.012,10.706-31,15-3-7-7-15-10-22,5.666-3,11.334-5,17-8V56l-36,7v58l-32,15c-3.109-8.415-4.447-12.049-8-22,5-2.666,11-5.334,16-8,0.334-20.665-.333-42.335,0-63C424.07,37.334,452.742,31.666,480.406,26Z"/>
        <path id="note_1" data-name="note 1" class="cls-1" d="M132.875,191.594v-62c-28.331-12.666-56.669-24.335-85-37,0.333-24.331-.333-49.669,0-74,36,15.332,73,30.668,109,46v117c53.381,3.229,45.368,80.638-10,71C133.3,250.23,104.237,221.646,132.875,191.594Zm-60-136v22l60,25v-22Zm84,150s11.515-.4,12,12c0,0,.481,11.6-12,12,0,0-10.271,1.035-12-12C144.875,217.594,145.016,205.906,156.875,205.594Z"/>
        <path id="note_like_thing" data-name="note like thing" class="cls-2" d="M277.7,447.062c2.837,4.069,9.257,19.858,10,21q-8.5,5-17,10v48c-10.332,4.667-19.667,9.334-30,14-3.333-6.666-7.667-14.333-11-21q8.5-4.5,17-9v-48C256.365,457.063,268.034,452.062,277.7,447.062Z"/>
        <path id="line_3" data-name="line 3" class="cls-3" d="M396.868,387.784L421,364s6.747-6.512,14,1c0,0,5.641,6.642,0,13l-23.132,23.784s-5.446,4.734-13-1C398.868,400.784,393.4,395.982,396.868,387.784Zm52.949-53.25L464,321s7.407-5.852,14,1c0,0,5.121,6.861,0,13l-13.183,13.534s-5.446,4.734-13-1C451.817,347.534,446.348,342.732,449.817,334.534Z"/>
        <path id="line_2" data-name="line 2" class="cls-4" d="M450.627,162.889L465,149s5.992-4.923,13,2a9.73,9.73,0,0,1,0,13l-12.373,12.889s-5.446,4.734-13-1C452.627,175.889,447.158,171.087,450.627,162.889Zm-85.949,85.743L418,195s8.85-8.883,16-2c0,0,7.072,6.485,1,14l-55.322,55.632s-5.446,4.734-13-1C366.678,261.632,361.209,256.83,364.678,248.632Z"/>
        <path id="line_1" data-name="line 1" class="cls-5" d="M204,259l46-45s7.187-5.962,14,1c0,0,4.332,6.632,1,12l-46,46s-5.446,4.735-13-1C206,272,200.531,267.2,204,259Zm85.949-85.25L315,149s7.187-4.962,14,2c0,0,4.571,7.081,0,13l-24.051,23.75s-5.446,4.735-13-1C291.949,186.75,286.481,181.948,289.949,173.75Z"/>
        <path id="main_star" data-name="main star" class="cls-1" d="M268,286l24-71s10.4-15.4,23,0l23,71,75,1s17.488,2.51,9,21l-62,46,22,68s4.826,21.449-18,17l-61-44-61,44s-21.754,5.457-18-17l22-68-60-44s-12.507-16.426,6-23Zm-51,21h61s4.153-1.179,7-7l18-55,18,56s3.428,5.961,8,6h60l-48,35s-4.967,3.983-2,13l17,53-47-35s-7.169-3.306-13,1l-46,34,18-55s2.731-7.475-3-11Z"/>
      </svg>
    </div>
  );
}

export default Loader;
