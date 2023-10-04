import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {format} from 'date-fns'

import './App.css';

const baseUrl = "http://127.0.0.1:5000"

const initialState = {
  first_name: '',
  last_name: '',
  email: ''
};

function App() {
  const [formData, setFormData] = useState(initialState); 
  const [editFormData, setEditFormData] = useState(initialState); 
  const [usersList, setUsersList] = useState([]);
  const [userId, setUserId] = useState(null);

  const fetchEvents = async () => {
    const data = await axios.get(`${baseUrl}/users`)
    const { users } = data.data
    setUsersList(users);
  }

  const handleInputChange = (event, field) => {
    const { name, value } = event.target;
    if (field === 'edit') {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
    else {
    setFormData({
      ...formData,
      [name]: value,
    });
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/users/${id}`);
      const updatedList = usersList.filter(user => user.id !== id);
      setUsersList(updatedList);
    } catch (err) {
      console.error(err.message);
    }
  }

  const toggleEdit = (user) => {
    setUserId(user.id);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editFormData.email) {
        const data = await axios.put(`${baseUrl}/users/${userId}`, {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
        });
        const updatedUser = data.data.user;
        const updatedUsersList = usersList.map(user => {
          if (user.id === userId) {
            return user = updatedUser;
          }
          return user
        })
        setUsersList(updatedUsersList)
      } else {
        const data = await axios.post(`${baseUrl}/user`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        });
        setUsersList([...usersList, data.data]);
      }
      setFormData(initialState);
      setEditFormData(initialState);
      setUserId(null);
    } catch(err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [])

  return (
    <div className="App">
        <section>
          <form onSubmit={handleSubmit}>
            <label htmlFor="first name">First name</label>
            <input
            onChange={(event) => handleInputChange(event, 'create')}
              type="text"
              name="first_name"
              id="first_name"
              placeholder="Add your first name here..."
              value={formData.first_name}
            />
            <label htmlFor="last name">Last name</label>
            <input
            onChange={(event) => handleInputChange(event, 'create')}
              type="text"
              name="last_name"
              id="last_name"
              placeholder="Add your last name here..."
              value={formData.last_name}
            />
            <label htmlFor="email">Email</label>
            <input
            onChange={(event) => handleInputChange(event, 'create')}
              type="text"
              name="email"
              id="email"
              placeholder="Add your email here..."
              value={formData.email}
            />
            <button type="submit">Submit</button>
          </form>
        </section>
        <section>
          <ul>
            {usersList.map(user => {
              if (userId === user.id) {
                return (
                  <li>
                  <form onSubmit={handleSubmit} key={user.id}>
                    <input
                    onChange={(event) => handleInputChange(event, 'edit')}
                      type="text"
                      name="editFirstName"
                      id="editFirstName"
                      placeholder="Add your first name here..."
                      value={editFormData.first_name}
                    />
                    <input
                    onChange={(event) => handleInputChange(event, 'edit')}
                      type="text"
                      name="editLastName"
                      id="editLastName"
                      placeholder="Add your last name here..."
                      value={editFormData.last_name}
                    />
                    <input
                    onChange={(event) => handleInputChange(event, 'edit')}
                      type="text"
                      name="editEmail"
                      id="editEmail"
                      placeholder="Add your email here..."
                      value={editFormData.email}
                    />
                    <button type="submit">Submit</button>
                  </form>
                </li>
                )
              } else {
                return (
                  <li style={{display: "flex"}}key={user.id}>
                    {user.first_name} {user.last_name} {user.email}
                    <button onClick={() => toggleEdit(user)}>Edit</button>
                    <button onClick={()=> handleDelete(user.id)}>Delete</button>
                  </li>
                )
              }
            })}
          </ul>
        </section>
    </div>
  )
}

export default App;
