const { supabase } = require('./database');

async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .single();
  if (error) return null;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

async function insertUser(user) {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    created_at: user.createdAt,
  });
  if (error) throw new Error(error.message);
  return user;
}

async function updateName(id, name) {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { findByEmail, findById, insertUser, updateName };
