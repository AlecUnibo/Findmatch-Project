// src/services/partiteService.js
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/partite'

export const getPartite = async (paramsIn = {}) => {
  const { sport, luogo, data, ora, exclude_user_id } = paramsIn

  // usa axios params per comporre la querystring in modo sicuro
  const { data: rows } = await axios.get(API_URL, {
    params: {
      ...(sport ? { sport } : {}),
      ...(luogo ? { luogo } : {}),
      ...(data ? { data } : {}),
      ...(ora ? { ora } : {}),
      ...(exclude_user_id ? { exclude_user_id } : {}),
    },
  })
  return rows
}

export const getPartitaById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/${id}`)
    return data
  } catch (err) {
    // evita errori in console quando l’evento è stato eliminato
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}
