import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnstwpqamayvsijurltc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impuc3R3cHFhbWF5dnNpanVybHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTY3NjYsImV4cCI6MjA5MjkzMjc2Nn0.QmPY4_AT6E0jvoUd94L8BMs2LEqrEwNPpHl9oI4zfVw'

const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }