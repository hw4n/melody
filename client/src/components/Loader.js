import './Loader.css';

function Loader(props) {
  return (
    <div class={"loader" + (props.transparent ? " transparent" : "")}>
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Loader;
