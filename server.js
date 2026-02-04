/**
 * =======================
 * Load Environment
 * =======================
 */
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

const app = express();

/**
 * =======================
 * PORT CONFIG
 * =======================
 */
const PORT = process.env.PORT || 4000;

/**
 * =======================
 * Jenkins Configuration
 * =======================
 */
const {
  JENKINS_URL,
  JENKINS_JOB,
  JENKINS_USER,
  JENKINS_TOKEN,
  DEPLOY_SECRET
} = process.env;

/**
 * =======================
 * ENV VALIDATION (IMPORTANT)
 * =======================
 */
if (!JENKINS_URL || !JENKINS_JOB || !JENKINS_USER || !JENKINS_TOKEN) {
  console.error('❌ Jenkins environment variables missing');
  process.exit(1);
}

if (!DEPLOY_SECRET) {
  console.error('❌ DEPLOY_SECRET is missing');
  process.exit(1);
}

/**
 * =======================
 * Sample Products
 * =======================
 */
const PRODUCTS = [
  { id: 1, name: 'Gen AI', price: 15000, desc: 'AI, ML' },
  { id: 2, name: 'Full Stack Developer', price: 45000, desc: 'Frontend, Backend, DB' },
  { id: 3, name: 'Data Science', price: 25000, desc: 'Data Mining, Analytics' },
  { id: 4, name: 'DEVOPS', price: 35000, desc: 'Automation, CI/CD' }
];

/**
 * =======================
 * App Configuration
 * =======================
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'devops-demo-secret',
    resave: false,
    saveUninitialized: true
  })
);

/**
 * =======================
 * UI Routes
 * =======================
 */
app.get('/', (req, res) => {
  res.render('index', {
    products: PRODUCTS,
    cart: req.session.cart || []
  });
});

app.get('/product/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).send('Product not found');

  res.render('product', {
    product,
    cart: req.session.cart || []
  });
});

app.post('/cart/add', (req, res) => {
  const product = PRODUCTS.find(p => p.id === Number(req.body.productId));
  if (!product) return res.status(400).send('Invalid product');

  req.session.cart = req.session.cart || [];
  req.session.cart.push(product);
  res.redirect('back');
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  res.render('cart', { cart, total });
});

app.post('/checkout', (req, res) => {
  req.session.cart = [];
  res.render('checkout');
});

/**
 * =======================
 * DEVOPSHUB API (DAY 4 CORE)
 * =======================
 */
app.post('/deploy', async (req, res) => {
  const secret = req.headers['x-deploy-secret'];

  if (secret !== DEPLOY_SECRET) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized deployment request'
    });
  }

  try {
    const buildUrl = `${JENKINS_URL}/job/${JENKINS_JOB}/build`;

    await axios.post(buildUrl, {}, {
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    });

    res.json({
      status: 'success',
      message: 'Jenkins build triggered successfully'
    });

  } catch (err) {
    console.error('❌ Jenkins trigger failed:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger Jenkins build'
    });
  }
});

/**
 * =======================
 * Health Check
 * =======================
 */
app.get('/health', (req, res) => {
  res.send('ok');
});

/**
 * =======================
 * START SERVER (FIXED)
 * =======================
 */
app.listen(PORT, () => {
  console.log(`🚀 App listening on port ${PORT}`);
});
