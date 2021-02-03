import './ProgressBar.css';

function ProgressBar() {
  return (
    <div class="progressWrap">
      <div class="time current">0:00</div>
      <div class="progressBar">
        <div class="progressBarCurrent"></div>
      </div>
      <div class="time end">0:00</div>
    </div>
  );
}

export default ProgressBar;
