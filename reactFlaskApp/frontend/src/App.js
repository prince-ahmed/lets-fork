// import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

class User {
  constructor(id, first_name, last_name, email, wishlist) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.wishlist = wishlist;
  }

  // String representation of the User object
  toString() {
    return JSON.stringify(this);
  }

  // Static method to initialize User object from a JSON string
  static fromJSON(jsonString) {
    const { id, first_name, last_name, email, wishlist } = JSON.parse(jsonString);
    return new User(id, first_name, last_name, email, wishlist)
  }

}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile after component mounts
    axios.get('http://localhost:5000/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(response => setUser(response.data.user))
    .catch(error => console.error('Error:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null)
  };

  return (
    <div className="App">
      <header className='App-header'>
        {user ? (
          <div>
            <h1>Welcome, {user.first_name} {user.last_name}!</h1>
            <h2> Email: {user.email}</h2>
            <h3>Wishlist: {user.wishlist.join(', ')}</h3>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <h1>Please log in</h1>
        )}
      </header>
    </div>
  )


  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
}

export default App;
