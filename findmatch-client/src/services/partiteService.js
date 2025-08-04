import axios from 'axios'

const API_URL = 'http://localhost:3000/api/partite'

export const getPartite = async ({ sport, luogo, data, ora }) => {
  const params = new URLSearchParams()

  if (sport) params.append('sport', sport)
  if (luogo) params.append('luogo', luogo)
  if (data) params.append('data', data)
  if (ora) params.append('ora', ora)

<<<<<<< HEAD
  const response = await axios.get(`http://localhost:3000/api/partite?${params.toString()}`)
  return response.data
}

=======
  const response = await axios.get('http://localhost:3000/api/partite?${params.toString()}')
  return response.data
}
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
