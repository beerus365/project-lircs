const express = require('express')
const router = express.Router()
const { supabase } = require('../client/supabaseClient.js')

router.get('/books', async (req, res) => {
  try {
    const { data, error } = await supabase.from('books').select('*')
    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error fetching books:', error)
    res.status(500).json({ error: 'Error loading books' })
  }
})

module.exports = router