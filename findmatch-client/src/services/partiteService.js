import axios from 'axios'

const API_URL = 'http://localhost:3000/api/partite'

export const getPartite = async (termine, data, ora) => {
  const params = {}
  if (termine) params.termine = termine
  if (data) params.data = data
  if (ora) params.ora = ora

  const response = await axios.get(API_URL, { params })
  return response.data
}
