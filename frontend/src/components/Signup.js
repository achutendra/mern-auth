import { Box, Button, TextField, Typography } from '@mui/material'
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: ""
  });

  const sendRequest = async() => {
    const res = await axios.post('http://localhost:5000/api/signup', {
      name: inputs.name,
      email: inputs.email,
      password: inputs.password
    }).catch(err => console.log(err));

    const data = await res.data;
    return data;
  };

  const handleChange = (e) => {
    setInputs(prev => ({...prev, [e.target.name]: e.target.value}));
    // console.log(e.target.name, "value", e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(inputs);
    sendRequest().then(() => history("/login"))
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit}>
        <Box 
          marginLeft="auto"
          marginRight="auto"
          width={300}
          display="flex"
          flexDirection={"column"}
          justifyContent="center"
          alignItems="center"
          >
          <Typography variant='h2'>Signup</Typography>

          <TextField 
            onChange={handleChange}
            name= "name"
            value={inputs.name}
            variant='outlined'
            placeholder='Name'
            margin='normal'
          />
          <TextField 
            onChange={handleChange}
            name= "email"
            type="email"
            value={inputs.email}
            variant='outlined'
            placeholder='Email'
            margin='normal'
          />
          <TextField 
            onChange={handleChange}
            name= "password"
            type="password"
            value={inputs.password}
            variant='outlined'
            placeholder='Password'
            margin='normal'
          />
          <Button variant='contained' type='submit'>Signup</Button>
        </Box>
      </form>
    </div>
  )
}

export default Signup