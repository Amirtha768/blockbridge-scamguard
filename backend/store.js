// Simple file-based store — replace with MySQL when ready
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'data.json');

function read() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ users: [], payments: [] }));
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email) {
  return read().users.find(u => u.email === email) || null;
}

export function findUserById(id) {
  return read().users.find(u => u.id === id) || null;
}

export function createUser({ name, email, password }) {
  const data = read();
  const user = {
    id: Date.now(),
    name,
    email,
    password,
    plan: 'FREE',
    subscription_status: 'NONE',
    expiry_date: null,
    created_at: new Date().toISOString(),
  };
  data.users.push(user);
  write(data);
  return user;
}

export function updateUserPlan(id, plan) {
  const data = read();
  const user = data.users.find(u => u.id === id);
  if (user) {
    user.plan = plan.toUpperCase();
    user.subscription_status = 'ACTIVE';
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    user.expiry_date = expiry.toISOString();
    write(data);
  }
}

export function savePayment(payment) {
  const data = read();
  data.payments.push({ ...payment, created_at: new Date().toISOString() });
  write(data);
}
