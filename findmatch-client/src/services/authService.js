import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const registerUser = async (name, surname, username, email, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    surname,
    username,
    email,
    password
  })
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  })
  return response.data
}
