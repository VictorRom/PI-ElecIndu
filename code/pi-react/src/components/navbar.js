import { Link } from 'react-router-dom';
import DropdownComponent from './dropdown';


function Navbar({handlePrototypeChange}) {

  const optionsPrototype = [
    { label: "Prototype Long", value: "1" },
    { label: "Prototype Mini", value: "2" },
  ];

  return (
    <header className="header sticky top-0 bg-white shadow-md flex items-center justify-between px-8 py-02 mx-auto" style={{height: "7vh"}}>
      <h1 className="w-2/12 flex flex-wrap items-center">
          <Link to="/" className='inline-flex items-center'>
            <img src={require('../assets/images/meditracker-logo.png')} alt="Meditracker Logo" className="w-1/6 flex"/>
            <span className="flex text-black-500 font-bold text-2xl ml-3">MediTrakker</span>
            <span className="flex text-black-500 font-bold text-2xl mb-3">TM</span>
          </Link>
      </h1>
      <nav className="nav font-semibold text-lg">
          <ul className="flex items-center">
            <Link to="/live">
              <li className="p-4 border-b-2 border-green-500 border-opacity-0 hover:border-opacity-100 hover:text-green-500 duration-200 cursor-pointer active">
                Live
              </li>
            </Link>
            <Link to="/trail">
              <li className="p-4 border-b-2 border-green-500 border-opacity-0 hover:border-opacity-100 hover:text-green-500 duration-200 cursor-pointer">
                Trail
              </li>
            </Link>
            <Link to="/delete">
              <li className="p-4 border-b-2 border-green-500 border-opacity-0 hover:border-opacity-100 hover:text-green-500 duration-200 cursor-pointer">
                Delete
              </li>
            </Link>
          </ul>
      </nav>

      <div className="w-3/12 flex justify-end">
        <DropdownComponent options={optionsPrototype} onChange={handlePrototypeChange} />
      </div>
    </header>
  );
}

export default Navbar;
