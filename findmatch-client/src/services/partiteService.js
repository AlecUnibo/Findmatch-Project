import axios from 'axios'

const API_URL = 'http://localhost:3000/api/partite'

export const getPartite = async ({ sport, luogo, data, ora }) => {
  const params = new URLSearchParams()

  if (sport) params.append('sport', sport)
  if (luogo) params.append('luogo', luogo)
  if (data) params.append('data', data)
  if (ora) params.append('ora', ora)


  const response = await axios.get(`http://localhost:3000/api/partite?${params.toString()}`)
  return response.data
}

export const getPartitaById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};