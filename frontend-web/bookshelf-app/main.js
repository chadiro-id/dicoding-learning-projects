const STORAGE_KEY_APP_THEME = 'app_theme';
const STORAGE_KEY_BOOK_LIST = 'book_list';

const EVENT_ITEM_ADDED = 'itemAdded';
const EVENT_ITEM_COMPLETE = 'itemComplete';
const EVENT_ITEM_CHANGE = 'itemChange';
const EVENT_ITEM_REMOVED = 'itemRemoved';

const CN_BOOK_ITEM = 'bs-book-item';
const CN_BOOK_ITEM_TITLE = CN_BOOK_ITEM + '__title';
const CN_BOOK_ITEM_AUTHOR = CN_BOOK_ITEM + '__author';
const CN_BOOK_ITEM_YEAR = CN_BOOK_ITEM + '__year';

const ATTR_DATA_THEME = 'data-theme';
const ATTR_DATA_BOOK_ID = 'data-bookid';
const ATTR_DATA_TEST_ID = 'data-testid';

const darkTheme = 'dark';
const lightTheme = 'light';
const defaultTheme = 'default';

const bookList = [];

document.addEventListener('DOMContentLoaded', () => {
  const btnAppTheme = document.getElementById('btn-app-theme');
  btnAppTheme.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute(ATTR_DATA_THEME);
    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (currentTheme !== defaultTheme) {
      isDark = currentTheme === darkTheme;
    }
    const desiredTheme = isDark ? lightTheme : darkTheme;
    localStorage.setItem(STORAGE_KEY_APP_THEME, desiredTheme);
    setAppTheme(desiredTheme);
  });

  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = bookForm.querySelector('#bookFormTitle').value;
    const author = bookForm.querySelector('#bookFormAuthor').value;
    const year = bookForm.querySelector('#bookFormYear').value;
    const isComplete = bookForm.querySelector('#bookFormIsComplete').checked;
    addItem(title, author, parseInt(year), isComplete);
  });

  const inputYear = document.getElementById('bookFormYear');
  inputYear.setAttribute('max', new Date().getFullYear());

  const inputIsComplete = document.getElementById('bookFormIsComplete');
  inputIsComplete.addEventListener('change', (evt) => {
    bookForm.querySelector('.bs-shelf-name').textContent = evt.target.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = document.getElementById('searchBookTitle').value;
    searchItems(keyword);
  });

  initModal();
  observeFooter();
  loadData();
});

document.addEventListener(EVENT_ITEM_ADDED, (evt) => {
  const bookshelfName = evt.detail.data.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
  showSnackbar(`Buku <strong>${evt.detail.data.title}</strong> berhasil ditambahkan kedalam rak <mark>${bookshelfName}</mark>`, () => {
    const bookItem = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${evt.detail.data.id}"]`);
    bookItem.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  });

  saveData();
});

document.addEventListener(EVENT_ITEM_CHANGE, (evt) => {
  showSnackbar(`Buku nomor <mark>${evt.detail.data.id}</mark> berhasil diperbarui`, () => {
    const bookItem = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${evt.detail.data.id}"]`);
    bookItem.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  });

  saveData();
});

document.addEventListener(EVENT_ITEM_COMPLETE, (evt) => {
  const shelf = evt.detail.data.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';

  showSnackbar(`Buku <strong>${evt.detail.data.title}</strong> berhasil dipindahkan ke rak <mark>${shelf}</mark>`, () => {
    const itemView = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${evt.detail.data.id}"]`);
    itemView.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
    });
  });

  saveData();
});

document.addEventListener(EVENT_ITEM_REMOVED, (evt) => {
  showSnackbar(`Buku <strong>${evt.detail.title}</strong> berhasil di hapus`, true);
  saveData();
});

/**
 * Load data from local storage.
 */
function loadData() {
  let theme = defaultTheme;
  if (isStorageExist()) {
    const appThemeData = localStorage.getItem(STORAGE_KEY_APP_THEME);
    const bookListData = localStorage.getItem(STORAGE_KEY_BOOK_LIST);

    if (appThemeData === lightTheme) theme = lightTheme;
    if (appThemeData === darkTheme) theme = darkTheme;
  
    if (bookListData) {
      const books = JSON.parse(bookListData);
      for (const book of books) {
        bookList.push(book);
      }
    }
  }

  displayItems();
  setAppTheme(theme);
}

/**
 * Save data to local storage.
 * @returns 
 */
function saveData() {
  if (!isStorageExist()) return false;
  const data = JSON.stringify(bookList);
  localStorage.setItem(STORAGE_KEY_BOOK_LIST, data);
  return true;
}

/**
 * Check if local storage is available.
 * @returns 
 */
function isStorageExist() {
  return typeof Storage !== undefined;
}

/**
 * Create an element to display item data.
 * @param {{id: number, title: string, author: string, year: number, isComplete: boolean}} data 
 * @returns 
 */
function makeItem(data) {
  const bookItem = document.createElement('div');
  bookItem.setAttribute(ATTR_DATA_BOOK_ID, `${data.id}`);
  bookItem.setAttribute(ATTR_DATA_TEST_ID, 'bookItem');
  bookItem.classList.add(CN_BOOK_ITEM);

  const titleElement = document.createElement('h3');
  titleElement.innerText = data.title;
  titleElement.setAttribute(ATTR_DATA_TEST_ID, 'bookItemTitle');
  titleElement.classList.add(CN_BOOK_ITEM_TITLE);

  const authorElement = document.createElement('p');
  authorElement.innerText = `Penulis: ${data.author}`;
  authorElement.setAttribute(ATTR_DATA_TEST_ID, 'bookItemAuthor');
  authorElement.classList.add(CN_BOOK_ITEM_AUTHOR);

  const yearElement = document.createElement('p');
  yearElement.innerText = `Tahun: ${data.year}`;
  yearElement.setAttribute(ATTR_DATA_TEST_ID, 'bookItemYear');
  yearElement.classList.add(CN_BOOK_ITEM_YEAR);

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('bs-book-item__action');

  const btnActionComplete = document.createElement('button');
  btnActionComplete.innerText = data.isComplete ? 'Tandai belum selesai' : 'Tandai sudah selesai';
  btnActionComplete.setAttribute(ATTR_DATA_TEST_ID, 'bookItemIsCompleteButton');
  btnActionComplete.classList.add('bs-button-outlined');
  btnActionComplete.addEventListener('click', () => {
    toggleItemComplete(data.id);
  });

  const btnDelete = document.createElement('button');
  btnDelete.innerText = 'Hapus';
  btnDelete.setAttribute(ATTR_DATA_TEST_ID, 'bookItemDeleteButton');
  btnDelete.classList.add('bs-button-filled');
  btnDelete.addEventListener('click', () => {
    const isDelete = confirm('Apakah anda yakin ingin menghapus buku ini?');
    if (isDelete) {
      removeItem(data.id);
    }
  });

  const btnEdit = document.createElement('button');
  btnEdit.innerText = 'Edit';
  btnEdit.setAttribute(ATTR_DATA_TEST_ID, 'bookItemEditButton');
  btnEdit.classList.add('bs-button-filled');
  btnEdit.addEventListener('click', () => {
    showModal('modal-edit-item', data)
  });

  actionContainer.append(btnActionComplete, btnDelete, btnEdit);
  bookItem.append(titleElement, authorElement, yearElement, actionContainer);
 
  return bookItem;
}

/**
 * Adding new item.
 * @param {string} title 
 * @param {string} author 
 * @param {number} year 
 * @param {boolean} isComplete 
 */
function addItem(title, author, year, isComplete) {
  const data = {
    id: Date.now(),
    title,
    author,
    year,
    isComplete
  }
  bookList.push(data);

  const finishedShelf = document.getElementById('bookshelf-finished');
  const unfinishedShelf = document.getElementById('bookshelf-unfinished');

  const bookshelf = data.isComplete ? finishedShelf : unfinishedShelf;

  const searchKeyword = document.getElementById('searchBookTitle').value;

  if (searchKeyword.length > 0) {
    displayItems();
  }
  else {
    const itemView = makeItem(data);
    bookshelf.querySelector('.bs-bookshelf__item-container').prepend(itemView);
    bookshelf.querySelector('.bs-bookshelf__empty-message').classList.toggle('bs-bookshelf__empty-message--hidden', true);
  }

  const eventOptions = {
    detail: {
      data
    }
  }
  document.dispatchEvent(new CustomEvent(EVENT_ITEM_ADDED, eventOptions));
}

/**
 * Update data on item with the given id.
 * @param {number} id - id of item to be updated.
 * @param {string} title - the new title data.
 * @param {string} author - the new author data.
 * @param {number} year - the new year data.
 */
function updateItem(id, title, author, year) {
  const book = bookList.find(x => x.id === id);
  book.title = title;
  book.author = author;
  book.year = year;
  
  const itemView = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${id}"]`);
  itemView.querySelector('.' + CN_BOOK_ITEM_TITLE).innerText = book.title;
  itemView.querySelector('.' + CN_BOOK_ITEM_AUTHOR).innerText = 'Penulis: ' + book.author;
  itemView.querySelector('.' + CN_BOOK_ITEM_YEAR).innerText = 'Tahun: ' + book.year;

  const eventOptions = {
    detail: {
      data: book
    }
  }
  document.dispatchEvent(new CustomEvent(EVENT_ITEM_CHANGE, eventOptions));
}

/**
 * Change the item status whether it is completed or not.
 * This will also move items to another container.
 * @param {number} id - id of item.
 */
function toggleItemComplete(id) {
  const book = bookList.find(x => x.id === id);
  book.isComplete = !book.isComplete;

  const oldItemView = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${id}"]`);
  const itemContainer = oldItemView.parentElement;
  oldItemView.remove();

  if (itemContainer.children.length === 0) {
    const emptyMsg = itemContainer.parentElement.querySelector('.bs-bookshelf__empty-message');
    emptyMsg.classList.remove('bs-bookshelf__empty-message--hidden');
  }

  let bookshelf;
  let filteredBooks;

  if (book.isComplete) {
    bookshelf = document.getElementById('completeBookList');
    filteredBooks = bookList.filter(x => x.isComplete);
  }
  else {
    bookshelf = document.getElementById('incompleteBookList');
    filteredBooks = bookList.filter(x => x.isComplete === false);
  }

  filteredBooks.sort((a, b) => b.id - a.id);
  const index = filteredBooks.findIndex(x => x.id === id);
  const newItemView = makeItem(filteredBooks[index]);
  if (index < filteredBooks.length - 1) {
    const refItemView = bookshelf.children[index + 1];
    bookshelf.insertBefore(newItemView, refItemView);
  }
  else {
    bookshelf.appendChild(newItemView);
  }
  bookshelf.parentElement.querySelector('.bs-bookshelf__empty-message').classList.toggle('bs-bookshelf__empty-message--hidden', true);

  const eventOptions = {
    detail: {
      data: book
    }
  }
  document.dispatchEvent(new CustomEvent(EVENT_ITEM_COMPLETE, eventOptions));
}

/**
 * Delete item with the given id.
 * @param {number} id - id of item to be deleted.
 */
function removeItem(id) {
  const book = bookList.find(x => x.id === id);

  const itemView = document.querySelector(`[${ATTR_DATA_BOOK_ID}="${id}"]`);
  const itemContainer = itemView.parentElement;
  itemView.remove();

  if (itemContainer.children.length === 0) {
    itemContainer.parentElement.querySelector('.bs-bookshelf__empty-message').classList.toggle('bs-bookshelf__empty-message--hidden', false);
  }

  const index = bookList.indexOf(book);
  bookList.splice(index, 1);

  const eventOptions = {
    detail: {
      title: book.title
    }
  }
  document.dispatchEvent(new CustomEvent(EVENT_ITEM_REMOVED, eventOptions));
}

/**
 * Render elements to display item data.
 * @param {Array<{id: number, title: string, author: string, year: number, isComplete: boolean}>} items - array of item data.
 */
function renderItems(items) {
  const finishedShelf = document.getElementById('completeBookList');
  const unfinishedShelf = document.getElementById('incompleteBookList');

  finishedShelf.innerHTML = '';
  unfinishedShelf.innerHTML = '';

  items.sort((a, b) => b.id - a.id );

  for (const item of items) {
    const itemView = makeItem(item);
    if (item.isComplete) {
      finishedShelf.append(itemView);
    }
    else {
      unfinishedShelf.append(itemView);
    }
  }
}

/**
 * Displays all available items.
 */
function displayItems() {
  const bookshelfs = document.querySelectorAll('.bs-bookshelf');
  const finishedBooks = bookList.filter((item) => item.isComplete);
  const unfinishedBooks = bookList.filter((item) => item.isComplete === false);

  bookshelfs.forEach(item => {
    const searchingInfo = item.querySelector('.bs-bookshelf__searching-info');
    const emptyMsg = item.querySelector('.bs-bookshelf__empty-message');
    searchingInfo.classList.toggle('bs-bookshelf__searching-info--hidden', true);
    emptyMsg.textContent = 'Rak ini kosong, anda bisa menambahkan baru atau memindahkan dari rak lain.';
    if (item.getAttribute('id') === 'bookshelf-finished') {
      emptyMsg.classList.toggle('bs-bookshelf__empty-message--hidden', finishedBooks.length > 0);
    }
    else {
      emptyMsg.classList.toggle('bs-bookshelf__empty-message--hidden', unfinishedBooks.length > 0);
    }
  });

  renderItems([...bookList]);
}

/**
 * Search for items by keyword based on title.
 * @param {string} keyword - search query.
 */
function searchItems(keyword) {
  const bookshelfs = document.querySelectorAll('.bs-bookshelf');

  const searchResults = bookList.filter((item) => {
    return item.title.toLowerCase().includes(keyword.toLowerCase());
  });

  const isValidKeyword = typeof keyword === 'string' && keyword.length > 0;
  const finishedBooks = searchResults.filter((item) => item.isComplete);
  const unfinishedBooks = searchResults.filter((item) => item.isComplete === false);

  bookshelfs.forEach(item => {
    const emptyMsg = item.querySelector('.bs-bookshelf__empty-message');
    const searchingInfo = item.querySelector('.bs-bookshelf__searching-info');
    emptyMsg.textContent = isValidKeyword ? 'Tidak ditemukan' : 'Rak ini kosong, anda bisa menambahkan baru atau memindahkan dari rak lain.';
    searchingInfo.innerHTML = `Menampilkan hasil pencarian "<strong>${keyword}</strong>":`;
    searchingInfo.classList.toggle('bs-bookshelf__searching-info--hidden', !isValidKeyword);
    if (item.getAttribute('id') === 'bookshelf-finished') {
      emptyMsg.classList.toggle('bs-bookshelf__empty-message--hidden', finishedBooks.length > 0);
    }
    else {
      emptyMsg.classList.toggle('bs-bookshelf__empty-message--hidden', unfinishedBooks.length > 0);
    }
  });
  
  renderItems(searchResults);
}

/**
 * function to adjust the appearance of the page when the theme has been determined.
 * @param {string} theme - theme name. dark, light or default device.
 */
function setAppTheme(theme) {
  const icAppTheme = document.getElementById('ic-app-theme');
  const icLightMode = document.getElementById('ic-light-mode');
  const icDarkMode = document.getElementById('ic-dark-mode');

  icAppTheme.style.display = (theme !== lightTheme && theme !== darkTheme) ? 'block' : 'none';
  icLightMode.style.display = theme === darkTheme ? 'block' : 'none';
  icDarkMode.style.display = theme === lightTheme ? 'block' : 'none';

  const currentTheme = (theme !== lightTheme && theme !== darkTheme) ? defaultTheme : theme;
  document.documentElement.setAttribute(ATTR_DATA_THEME, currentTheme);
}

/**
 * Observe the visibility of the footer element to manipulate the appearance of content on the footer.
 */
function observeFooter() {
  const footerContainer = document.querySelector('.bs-footer__container');
  
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: [0.9, 0.95]
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.95) {
        const wordMain = document.querySelector('.bs-words__main');
        const wordAdditional = document.querySelector('.bs-words__additional');
        wordMain.classList.remove('bs-words__main--hidden');
        wordAdditional.classList.remove('bs-words__additional--hidden');
        obs.unobserve(entry.target);
      }
    });
  }, options);
  observer.observe(footerContainer);
}

/**
 * create an event that is triggered when the modal is displayed.
 * @param {string} id - modal id.
 * @param {*} data - optional.
 * @returns 
 */
const makeEventModalShow = (id, data) => {
  const options = {
    detail: {
      id,
      data
    }
  }
  return new CustomEvent('showModal', options);
}

/**
 * create an event that is triggered when the modal is closed.
 * @param {string} id - modal id.
 * @param {number} closeKind - modal closing actio type. -1 negative, 0 neutral, 1 positive.
 * @param {*} data - optional.
 * @returns 
 */
const makeEventModalHide = (id, closeKind, data) => {
  const options = {
    detail: {
      id,
      closeKind,
      data
    }
  };
  return new CustomEvent('hideModal', options);
}

/**
 * Initialize modal elements.
 */
function initModal() {
  const modalEditItem = document.getElementById('modal-edit-item');

  modalEditItem.querySelector('#input-edit-book-year').setAttribute('max', new Date().getFullYear());

  modalEditItem.querySelector('.bs-modal__close-button').addEventListener('click', () => {
    hideModal('modal-edit-item', 0);
  });

  modalEditItem.querySelector('.bs-modal__cancel-button').addEventListener('click', () => {
    hideModal('modal-edit-item', -1);
  });

  modalEditItem.querySelector('#book-form-edit').addEventListener('submit', (evt) => {
    evt.preventDefault();

    const title = modalEditItem.querySelector('#input-edit-book-title').value;
    const author = modalEditItem.querySelector('#input-edit-book-author').value;
    const year = modalEditItem.querySelector('#input-edit-book-year').value;

    const data = {
      title, 
      author,
      year: parseInt(year)
    };

    hideModal('modal-edit-item', 1, data);
  });

  modalEditItem.addEventListener('showModal', (evt) => {
    modalEditItem.setAttribute('data-item-id', evt.detail.data.id);
    modalEditItem.querySelector('#input-edit-book-title').value = evt.detail.data.title;
    modalEditItem.querySelector('#input-edit-book-author').value = evt.detail.data.author;
    modalEditItem.querySelector('#input-edit-book-year').value = evt.detail.data.year;
  });

  modalEditItem.addEventListener('hideModal', (evt) => {
    if (evt.detail.closeKind === 1 && evt.detail.data !== null) {
      const itemId = modalEditItem.getAttribute('data-item-id');
      updateItem(
        parseInt(itemId),
        evt.detail.data.title,
        evt.detail.data.author,
        evt.detail.data.year
      );
    }
    modalEditItem.removeAttribute('data-item-id');
  });
}

/**
 * Display a modal with the given id.
 * @param {string} id - modal unique id.
 * @param {object} data - optional.
 */
function showModal(id, data) {
  const modal = document.getElementById(id);
  const modalBox = modal.querySelector('.bs-modal__box');
  modal.classList.toggle('bs-modal--open', true);

  const showEvent = makeEventModalShow(id, data)

  const animKeyframes = [
    { opacity: 1, transform: "translateY(0)" },
  ];

  const anim = modalBox.animate(animKeyframes, 250);
  anim.onfinish = () => {
    modalBox.classList.toggle('bs-modal__box--show', true);
  }
  modal.dispatchEvent(showEvent);
}

/**
 * Hide a modal with the given id.
 * @param {string} id - modal unique id.
 * @param {number} closeKind - a number to represent the action when the modal is closed. 0 is neutral, -1 is negative, 1 is positive
 * @param {object} data - optional.
 */
function hideModal(id, closeKind, data) {
  const modal = document.getElementById(id);
  const modalBox = modal.querySelector('.bs-modal__box');

  const closeEvent = makeEventModalHide(id, closeKind, data)

  const animKeyframes = [
    { opacity: 0, transform: "translateY(-20%)" },
  ];

  const anim = modalBox.animate(animKeyframes, 250);
  anim.onfinish = () => {
    modal.dispatchEvent(closeEvent);
    modalBox.classList.toggle('bs-modal__box--show', false);
    modal.classList.toggle('bs-modal--open', false);
  }
}

/**
 * Create snackbar element.
 * @param {string} message - snackbar message.
 * @param {boolean} withAction - define snackbar using action button or not.
 * @returns
 */
const makeSnackbar = (message, withAction) => {
  const snackbarElement = document.createElement('div');
  snackbarElement.classList.add('bs-snackbar');
  if (withAction) {
    snackbarElement.classList.add('bs-snackbar--with-action');
  }

  const messageElement = document.createElement('span');
  messageElement.classList.add('bs-snackbar__message');
  messageElement.innerHTML = message;

  const btnAction = document.createElement('button');
  btnAction.classList.add('bs-button','bs-snackbar__action-button');
  btnAction.innerText = "OK";

  snackbarElement.append(messageElement, btnAction);

  return snackbarElement;
}

/**
 * Display a snackbar.
 * @param {string} message - message to display.
 * @param {boolean|function} action - define snackbar using action button or not, if value is true then the action button is displayed and vice versa. 
 * If value is function then the action button will be displayed and will call the function as a callback.
 * @param {string} textOnActionButton - text displayed on action button.
 * @callback onClose when snackbar is closed.
 * @returns
 */
function showSnackbar(message, action, textOnActionButton, onClose) {
  const snackbarContainer = document.getElementById('snackbar');
  const snackbar = makeSnackbar(message, action);
  snackbarContainer.appendChild(snackbar);

  let closeOnAction = false;

  if (action) {
    const btnAction = snackbar.querySelector('.bs-snackbar__action-button');
    if (textOnActionButton && textOnActionButton !== '') btnAction.textContent = textOnActionButton;
    btnAction.addEventListener('click', () => {
      closeOnAction = true;
      if (typeof action === 'function') action();
      closeSnackbar();
    });
  }

  const animKeyframes = [
    { opacity: 1, transform: "translateY(0)" }
  ];

  const animShow = snackbar.animate(animKeyframes, 250);
  animShow.onfinish = () => {
    snackbar.classList.add('bs-snackbar--visible');
    setTimeout(() => {
      if (closeOnAction === false) {
        closeSnackbar();
      }
    }, 5000);
  };

  function closeSnackbar() {
    const animClose = snackbar.animate([{
      opacity: 0,
      transform: "translateY(-20%)"
    }], 250);

    animClose.onfinish = () => {
      if (onClose) onClose();
      snackbar.classList.remove('bs-snackbar--visible');
      snackbar.remove();
    }
  }

  return snackbar;
}