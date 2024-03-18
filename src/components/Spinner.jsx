import spinner from '../assets/svg/spinner.svg';

function Spinner() {
  return (
    <div className="bg-black bg-opacity-50 flex items-center justify-center fixed inset-0 z-50">
      <div>
        <img src={spinner} alt="loading..." className="h-24" />
      </div>
    </div>
  );
}

export default Spinner;
