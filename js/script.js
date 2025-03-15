document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

 
  fetch('/session-status')
    .then(res => res.json())
    .then(data => {
      const loggedInSection = document.getElementById('loggedIn');
      const loggedOutSection = document.getElementById('loggedOut');
      const userLoginSpan = document.getElementById('userLogin');

      if (data.loggedIn) {
        if (loggedInSection) loggedInSection.style.display = 'block';
        if (loggedOutSection) loggedOutSection.style.display = 'none';
        if (userLoginSpan) userLoginSpan.textContent = data.login;
      } else {
        if (loggedInSection) loggedInSection.style.display = 'none';
        if (loggedOutSection) loggedOutSection.style.display = 'block';
      }

      
      if (currentPage === '/profile.html') {
        const profileContent = document.getElementById('profileContent');
        const authPrompt = document.getElementById('authPrompt');

        if (data.loggedIn) {
          profileContent.style.display = 'block';
          authPrompt.style.display = 'none';
        } else {
          profileContent.style.display = 'none';
          authPrompt.style.display = 'block';
        }
      }
    })
    .catch(err => console.log('Session check failed:', err));

  
  if (currentPage === '/login.html') {
    const form = document.getElementById('authForm');
    const errorDiv = document.getElementById('loginError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/login', {
        method: 'POST',
        body: formData
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => { throw new Error(data.error); });
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            window.location.href = '/index.html';
          }
        })
        .catch(err => {
          errorDiv.textContent = err.message || 'Произошла ошибка при входе';
        });
    });
  }

 
  if (currentPage === '/register.html') {
    const form = document.getElementById('regForm');
    const errorDiv = document.getElementById('error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/register', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            errorDiv.textContent = data.error;
          } else if (data.success) {
            window.location.href = '/login.html';
          }
        })
        .catch(err => {
          errorDiv.textContent = 'Произошла ошибка при регистрации';
        });
    });
  }

  
  if (currentPage === '/profile.html') {
    const loginSpan = document.getElementById('login');
    const form = document.getElementById('profileForm');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const inputs = form.querySelectorAll('input');

    fetch('/profile')
      .then(res => {
        if (!res.ok) return; 
        return res.json();
      })
      .then(user => {
        if (user) {
          loginSpan.textContent = user.login;
          document.querySelector('[name="fullName"]').value = user.fullName || '';
          document.querySelector('[name="phone"]').value = user.phone || '';
          document.querySelector('[name="email"]').value = user.email || '';
          document.querySelector('[name="address"]').value = user.address || '';
        }
      })
      .catch(err => console.log('Profile load failed:', err));

    editBtn.addEventListener('click', () => {
      inputs.forEach(input => input.disabled = false);
      editBtn.disabled = true;
      saveBtn.disabled = false;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/profile', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else if (data.success) {
            inputs.forEach(input => input.disabled = true);
            editBtn.disabled = false;
            saveBtn.disabled = true;
          }
        })
        .catch(err => {
          alert('Произошла ошибка при сохранении');
        });
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const sizeButtons = document.querySelectorAll('.size-buttons .btn');

  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      sizeButtons.forEach(btn => {
        btn.classList.remove('btn-primary', 'me-2');
        btn.classList.add('btn-outline-primary');
      });
      button.classList.remove('btn-outline-primary');
      button.classList.add('btn-primary', 'me-2');
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('productsContainer');


  fetch('/database/clothes.json')
    .then(response => {
      if (!response.ok) throw new Error('Ошибка загрузки JSON');
      return response.json();
    })
    .then(clothes => {
      container.innerHTML = ''; 

      clothes.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.className = 'col-md-3 col-sm-6 col-padding animate-box';
        productDiv.setAttribute('data-animate-effect', 'fadeInLeft');
        productDiv.innerHTML = `
          <div class="blog-entry">
            <a href="about.html" class="blog-img">
              <img src="${item.photo}" class="img-responsive" alt="${item.name}">
            </a>
            <div class="desc">
              <span>${item.name}</span>
              <h3><a href="about.html">$${item.price}</a></h3>
              <p><a href="#" class="btn btn-primary btn-md">В корзину</a></p>
            </div>
          </div>
        `;
        container.appendChild(productDiv);
      });

      const animateBoxes = container.querySelectorAll('.animate-box:not(.animated)');
      animateBoxes.forEach(box => {
        $(box).waypoint(function(direction) {
          if (direction === 'down' && !$(this.element).hasClass('animated')) {
            $(this.element).addClass('animated fadeInLeft');
          }
        }, { offset: '80%' });
      });
    })
    .catch(error => console.error('Ошибка загрузки товаров:', error));
});


document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  let allClothes = [];
  let selectedCategories = [];
  let isLoggedIn = false;

  const specialCategories = ["ЛЕТО 2025", "ЧЕРНАЯ ПЯТНИЦА", "НОВИНКИ"];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
      cartBadge.textContent = cart.length || '';
      cartBadge.style.display = cart.length > 0 ? 'inline' : 'none';
    }
  }

  function addToCart(itemId, size = null) {
    const product = allClothes.find(item => item.id === itemId);
    if (product) {
      const sizeObj = product.sizes.find(s => s.size === size);
      if (size && (!sizeObj || sizeObj.stock <= 0)) {
        alert('Выбранного размера нет в наличии');
        return;
      }
      cart.push({ id: itemId, size: size || product.sizes[0].size });
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      alert('Товар добавлен в корзину');
    }
  }

  if (currentPage === '/blog.html') {
    const categoryFilter = document.getElementById('categoryFilter');

    const urlParams = new URLSearchParams(window.location.search);
    const initialFilter = urlParams.get('filter');

    fetch('/database/clothes.json')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки JSON');
        return response.json();
      })
      .then(clothes => {
        allClothes = clothes;
        renderFilters();

        if (initialFilter && (specialCategories.includes(initialFilter) || allClothes.some(item => item.category === initialFilter))) {
          selectedCategories = [initialFilter];
          document.getElementById(initialFilter).checked = true;
        }

        renderProducts();
      })
      .catch(error => console.error('Ошибка загрузки товаров:', error));

    function renderFilters() {
      if (!categoryFilter) return;
      specialCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'checkbox-label';
        div.innerHTML = `
          <input type="checkbox" id="${category}" value="${category}">
          <label for="${category}">${category}</label>
        `;
        categoryFilter.appendChild(div);
      });

      const separator = document.createElement('hr');
      categoryFilter.appendChild(separator);

      const allCategories = new Set();
      allClothes.forEach(item => allCategories.add(item.category));

      allCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'checkbox-label';
        div.innerHTML = `
          <input type="checkbox" id="${category}" value="${category}">
          <label for="${category}">${category}</label>
        `;
        categoryFilter.appendChild(div);
      });

      categoryFilter.addEventListener('change', (e) => {
        const checkbox = e.target;
        if (checkbox.type === 'checkbox') {
          if (checkbox.checked) {
            selectedCategories.push(checkbox.value);
          } else {
            selectedCategories = selectedCategories.filter(cat => cat !== checkbox.value);
          }
          renderProducts();
        }
      });
    }

    function renderProducts() {
      const container = document.getElementById('productsContainer');
      if (!container) {
        console.error('Элемент #productsContainer не найден');
        return;
      }
      container.innerHTML = '';

      let filteredClothes = allClothes;
      if (selectedCategories.length > 0) {
        filteredClothes = allClothes.filter(item => {
          return selectedCategories.includes(item.category) || 
                 selectedCategories.some(cat => item.topCategories.includes(cat));
        });
      }

      filteredClothes.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.className = 'col-md-3 col-sm-6 col-padding animate-box';
        productDiv.setAttribute('data-animate-effect', 'fadeInLeft');
        productDiv.innerHTML = `
          <div class="blog-entry">
            <a href="about.html?id=${item.id}" class="blog-img">
              <img src="${item.photo}" class="img-responsive" alt="${item.name}">
            </a>
            <div class="desc">
              <span>${item.name}</span>
              <h3><a href="about.html?id=${item.id}">$${item.price}</a></h3>
              <p><button class="btn btn-primary btn-md add-to-cart" data-id="${item.id}">В корзину</button></p>
            </div>
          </div>
        `;
        container.appendChild(productDiv);
      });

      const animateBoxes = container.querySelectorAll('.animate-box:not(.animated)');
      animateBoxes.forEach(box => {
        $(box).waypoint(function(direction) {
          if (direction === 'down' && !$(this.element).hasClass('animated')) {
            $(this.element).addClass('animated fadeInLeft');
          }
        }, { offset: '80%' });
      });

      container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const itemId = parseInt(button.dataset.id);
          addToCart(itemId);
        });
      });
    }
  }

  if (currentPage === '/about.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    fetch('/database/clothes.json')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки JSON');
        return response.json();
      })
      .then(clothes => {
        allClothes = clothes;
        const product = allClothes.find(item => item.id === productId);
        if (product) {
          document.getElementById('productImage').src = product.photo;
          document.getElementById('productImage').alt = product.name;
          document.getElementById('productName').textContent = product.name;
          document.getElementById('productCategory').textContent = product.category + (product.topCategories.length > 0 ? ` (${product.topCategories.join(', ')})` : '');
          document.getElementById('productPrice').textContent = product.price;
          document.getElementById('productDescription').textContent = product.description;

          const sizeButtons = document.getElementById('sizeButtons');
          sizeButtons.innerHTML = '';
          product.sizes.forEach(size => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn ${size.stock > 0 ? 'btn-outline-primary' : 'btn-outline-secondary disabled'} btn-md me-2`;
            button.dataset.size = size.size;
            button.textContent = size.size;
            if (size.stock === 0) button.disabled = true;
            sizeButtons.appendChild(button);
          });

          const addToCartBtn = document.querySelector('.btn-primary');
          addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedSize = sizeButtons.querySelector('.btn-primary')?.dataset.size;
            if (!selectedSize) {
              alert('Выберите размер');
              return;
            }
            addToCart(productId, selectedSize);
          });

          sizeButtons.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
              sizeButtons.querySelectorAll('.btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
              });
              btn.classList.remove('btn-outline-primary');
              btn.classList.add('btn-primary');
            });
          });
        } else {
          document.querySelector('.narrow-content').innerHTML = '<p>Товар не найден</p>';
        }
      })
      .catch(error => console.error('Ошибка загрузки товара:', error));
  }

  if (currentPage === '/basket.html') {
    const basketContent = document.getElementById('basketContent');
    const basketTotal = document.getElementById('basketTotal');
    const authPrompt = document.getElementById('authPrompt');
    const checkoutButton = document.getElementById('checkoutButton');

    fetch('/database/clothes.json')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки JSON');
        return response.json();
      })
      .then(clothes => {
        allClothes = clothes;
        renderBasket();

        fetch('/session-status')
          .then(res => res.json())
          .then(data => {
            isLoggedIn = data.loggedIn;
            if (isLoggedIn) {
              authPrompt.style.display = 'none';
              updateCheckoutButtonVisibility();
              document.getElementById('checkout').addEventListener('click', checkout);
            } else {
              authPrompt.style.display = 'block';
              checkoutButton.style.display = 'none';
            }
          })
          .catch(error => console.error('Ошибка проверки сессии:', error));
      })
      .catch(error => console.error('Ошибка загрузки корзины:', error));

    function renderBasket() {
      if (!basketContent) return;
      basketContent.innerHTML = '';
      let total = 0;

      cart.forEach((cartItem, index) => {
        const product = allClothes.find(item => item.id === cartItem.id);
        if (product) {
          total += product.price;
          const productDiv = document.createElement('div');
          productDiv.className = 'col-md-3 col-sm-6 col-padding animate-box';
          productDiv.setAttribute('data-animate-effect', 'fadeInLeft');
          productDiv.innerHTML = `
            <div class="blog-entry">
              <a href="about.html?id=${product.id}" class="blog-img">
                <img src="${product.photo}" class="img-responsive" alt="${product.name}">
              </a>
              <div class="desc">
                <span>${product.name}</span>
                <h3><a href="about.html?id=${product.id}">$${product.price}</a></h3>
                <p>Размер: ${cartItem.size}</p>
                <p><button class="btn btn-danger btn-md remove-from-cart" data-index="${index}">Удалить</button></p>
              </div>
            </div>
          `;
          basketContent.appendChild(productDiv);
        }
      });

      basketTotal.textContent = cart.length > 0 ? `Итого: $${total.toFixed(2)}` : 'Корзина пуста';

      const animateBoxes = basketContent.querySelectorAll('.animate-box:not(.animated)');
      animateBoxes.forEach(box => {
        $(box).waypoint(function(direction) {
          if (direction === 'down' && !$(this.element).hasClass('animated')) {
            $(this.element).addClass('animated fadeInLeft');
          }
        }, { offset: '80%' });
      });

      basketContent.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const index = parseInt(button.dataset.index);
          cart.splice(index, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartBadge();
          renderBasket();
          updateCheckoutButtonVisibility();
        });
      });

      if (isLoggedIn) updateCheckoutButtonVisibility();
    }

    function updateCheckoutButtonVisibility() {
      if (cart.length > 0) {
        checkoutButton.style.display = 'block';
      } else {
        checkoutButton.style.display = 'none';
      }
    }

    function checkout() {
      if (!isLoggedIn) return;

      const cartCount = {};
      cart.forEach(cartItem => {
        const key = `${cartItem.id}-${cartItem.size}`;
        cartCount[key] = (cartCount[key] || 0) + 1;
      });

      Object.keys(cartCount).forEach(key => {
        const [id, size] = key.split('-');
        const product = allClothes.find(item => item.id === parseInt(id));
        if (product) {
          const sizeObj = product.sizes.find(s => s.size === size);
          if (sizeObj && sizeObj.stock >= cartCount[key]) {
            sizeObj.stock -= cartCount[key];
          } else {
            alert(`Недостаточно товара ${product.name} размера ${size} в наличии`);
            return;
          }
        }
      });

      fetch('/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allClothes)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { 
            throw new Error(`Ошибка обновления stock: ${err.details || 'Неизвестная ошибка сервера'}`); 
          });
        }
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderBasket();
        alert('Заказ успешно оформлен!');
      })
      .catch(error => {
        console.error('Ошибка оформления заказа:', error);
        alert('Не удалось оформить заказ: ' + error.message);
      });
    }
  }

  if (currentPage === '/index.html' || currentPage === '/') {
    const catalogContainer = document.querySelector('.narrow-content .row.row-bottom-padded-md');

    fetch('/database/clothes.json')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки JSON');
        return response.json();
      })
      .then(clothes => {
        allClothes = clothes;
        renderMiniCatalog();
      })
      .catch(error => console.error('Ошибка загрузки мини-каталога:', error));

    function renderMiniCatalog() {
      if (!catalogContainer) {
        console.error('Контейнер мини-каталога не найден');
        return;
      }
      catalogContainer.innerHTML = '';

      const shuffledClothes = allClothes.sort(() => 0.5 - Math.random());
      const selectedClothes = shuffledClothes.slice(0, 4);

      selectedClothes.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.className = 'col-md-3 col-sm-6 col-padding animate-box';
        productDiv.setAttribute('data-animate-effect', 'fadeInLeft');
        productDiv.innerHTML = `
          <div class="blog-entry">
            <a href="about.html?id=${item.id}" class="blog-img">
              <img src="${item.photo}" class="img-responsive" alt="${item.name}">
            </a>
            <div class="desc">
              <span>${item.name}</span>
              <h3><a href="about.html?id=${item.id}">$${item.price}</a></h3>
              <p><button class="btn btn-primary btn-md add-to-cart" data-id="${item.id}">В корзину</button></p>
            </div>
          </div>
        `;
        catalogContainer.appendChild(productDiv);
      });

      const animateBoxes = catalogContainer.querySelectorAll('.animate-box:not(.animated)');
      animateBoxes.forEach(box => {
        $(box).waypoint(function(direction) {
          if (direction === 'down' && !$(this.element).hasClass('animated')) {
            $(this.element).addClass('animated fadeInLeft');
          }
        }, { offset: '80%' });
      });

      catalogContainer.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const itemId = parseInt(button.dataset.id);
          addToCart(itemId);
        });
      });
    }
  }
});