const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple product list
const PRODUCTS = [
  { id: 1, name: 'CyberSecurity', price: 15000, desc: 'Artificial Intelligence, Machine Learning' },
  { id: 2, name: 'Full Stack Developer', price: 45000, desc: 'Front End, Back End, Data Base' },
  { id: 3, name: 'Data Science', price: 25000, desc: 'Data Collection, Data Mining' },
  { id: 4, name: 'DEVOPS', price: 35000, desc: 'Automation, CI/CD' }
];

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'devops-demo-secret',
  resave: false,
  saveUninitialized: true
}));

// home / product list
app.get('/', (req, res) => {
  res.render('index', { products: PRODUCTS, cart: req.session.cart || [] });
});

// product detail
app.get('/product/:id', (req, res) => {
  const p = PRODUCTS.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).send('Product not found');
  res.render('product', { product: p, cart: req.session.cart || [] });
});

// add to cart
app.post('/cart/add', (req, res) => {
  const id = Number(req.body.productId);
  const product = PRODUCTS.find(x => x.id === id);
  if (!product) return res.status(400).send('Invalid product');
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(product);
  res.redirect('back');
});

// view cart
app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((s, p) => s + p.price, 0);
  res.render('cart', { cart, total });
});

// simple checkout (no payment)
app.post('/checkout', (req, res) => {
  req.session.cart = [];
  res.render('checkout');
});

// health
app.get('/health', (req, res) => res.send('ok'));

const serverPort = process.env.PORT || 3000;
app.listen(serverPort, () => {
  console.log(`App listening on port ${serverPort}`);
});
