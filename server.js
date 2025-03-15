const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const db = require('./database/database.js');
const path = require('path');
const app = express();
const fs = require('fs');

const upload = multer();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/profile.html', (req, res) => { 
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/blog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/basket.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'basket.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.post('/register', upload.none(), (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  const trimmedLogin = login.trim();
  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 4 || !(/^[a-zA-Z]+$/.test(trimmedPassword) || /^[0-9]+$/.test(trimmedPassword))) {
    return res.status(400).json({ error: 'Пароль должен содержать либо только буквы, либо только цифры, минимум 4 символа' });
  }

  db.get('SELECT login FROM users WHERE login = ?', [trimmedLogin], (err, row) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (row) return res.status(400).json({ error: 'Логин уже существует' });

    const hashedPassword = bcrypt.hashSync(trimmedPassword, 10);
    db.run('INSERT INTO users (login, password) VALUES (?, ?)', [trimmedLogin, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка регистрации' });
      res.json({ success: true });
    });
  });
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  db.get('SELECT * FROM users WHERE login = ?', [login], (err, user) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Неверный логин или пароль' });
    }

    req.session.user = { id: user.id, login: user.login };
    res.redirect('/profile.html');
  });
});

app.get('/profile', isAuthenticated, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], (err, user) => {
    if (err || !user) return res.status(500).send('Ошибка загрузки профиля');
    res.json(user);
  });
});

app.post('/profile', isAuthenticated, upload.none(), (req, res) => {
  const { fullName, phone, email, address } = req.body;

  const phoneValid = !phone || /^\d{0,11}$/.test(phone);
  const emailValid = !email || /^[a-zA-Z0-9._%+-]+@(mail|gmail)\.[a-zA-Z]{2,}$/.test(email);

  if (!phoneValid || !emailValid) {
    return res.status(400).json({ error: 'Неверный формат телефона или email' });
  }

  db.run(
    'UPDATE users SET fullName = ?, phone = ?, email = ?, address = ? WHERE id = ?',
    [fullName || null, phone || null, email || null, address || null, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения' });
      res.json({ success: true });
    }
  );
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/index.html');
});

app.get('/session-status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, login: req.session.user.login });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/update-stock', (req, res) => {
  try {
    const updatedClothes = req.body;
    const filePath = path.join(__dirname, 'database', 'clothes.json');
    console.log('Попытка записи в файл:', filePath);
    console.log('Данные для записи:', JSON.stringify(updatedClothes, null, 2));

    if (!fs.existsSync(filePath)) {
      throw new Error('Файл clothes.json не найден');
    }

    fs.accessSync(filePath, fs.constants.W_OK); // Проверка прав на запись
    fs.writeFileSync(filePath, JSON.stringify(updatedClothes, null, 2));
    console.log('Файл успешно обновлен');
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при обновлении stock:', error.message);
    res.status(500).json({ error: 'Не удалось обновить stock', details: error.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});