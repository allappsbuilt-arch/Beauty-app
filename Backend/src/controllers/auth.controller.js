const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../db/usersRepo');
const rewards = require('../services/rewards.service');
const { savePreferences } = require('./preferences.controller');
const { jwtSecret, jwtExpiresIn } = require('../config');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function signup(req, res) {
  const { name, email, password, referralCode } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (await store.findByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const referrer = referralCode ? await rewards.findReferrer(referralCode) : null;
  if (referralCode && String(referralCode).trim() && !referrer) {
    return res.status(400).json({ error: 'That referral code isn’t valid — check it or leave it blank' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await store.insertUser(user);
  if (referrer) await rewards.recordReferral(user.id, referrer.id);
  // New accounts go through the in-app onboarding (coach voice, allergies)
  // and start with no allergies picked for them.
  await savePreferences(user.id, {
    onboarding: { completed: false, completedAt: null },
    allergies: { ingredients: [] },
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await store.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  return res.json({ token, user: toPublicUser(user) });
}

async function me(req, res) {
  const user = await store.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: toPublicUser(user) });
}

const MAX_NAME_LENGTH = 60;

async function updateMe(req, res) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (name.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or less` });
  }
  const user = await store.updateName(req.userId, name);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: toPublicUser(user) });
}

module.exports = { signup, login, me, updateMe };
