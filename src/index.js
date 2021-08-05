class List {
    constructor() {
        this.items = [];
        this.closePopUp();
    }

    addItem(valuesObject, listPrefix) {
        const id = Date.now();
        Object.defineProperty(valuesObject, 'id', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: id
        });
        this.items.push(valuesObject);

        const $list = document.querySelector(`.${listPrefix}__list`);
        const $item = document.createElement('li');
        $item.classList.add(`${listPrefix}__item`);

        const $itemContent = document.createElement('div');
        $itemContent.classList.add(`${listPrefix}__content`);
        $itemContent.innerHTML = this.createItem(valuesObject);

        const $itemDelete = document.createElement('span');
        $itemDelete.classList.add('delete');

        const $itemEdit = document.createElement('span');
        $itemEdit.classList.add('edit');
        $item.prepend($itemContent, $itemEdit, $itemDelete);
        $item.dataset.id = id;
        $list.prepend($item);
    }

    removeItem(listPrefix) {
        const $list = document.querySelector(`.${listPrefix}__list`);
        $list.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete')) {
                const $item = e.target.parentElement;
                const id = +$item.dataset.id;
                this.items = this.items.filter(item => item.id !== id);
                $item.remove();
            }
        });

    }

    formHandler(listPrefix) {
        const $form = document.querySelector(`#${listPrefix}__form`);
        $form.addEventListener('submit', e => {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input:not([type="submit"])');
            const valuesObject = {};
            inputs.forEach(input => valuesObject[input.name] = input.value.trim());
            this.addItem(valuesObject, listPrefix);
        });
    }

    editItem(listPrefix) {
        const $list = document.querySelector(`.${listPrefix}__list`);
        $list.addEventListener('click', e => {
            if (e.target.classList.contains('edit')) {
                const $item = e.target.parentElement;
                const id = +$item.dataset.id;
                const currentItem = this.items.find(item => item.id === id);
                const $form = document.createElement('form');
                $form.classList.add(`#${listPrefix}__form_edit`);
                for (const key in currentItem) {
                    const $input = document.createElement('input');
                    $input.setAttribute('name', key);
                    $input.setAttribute('placeholder', key);
                    $input.setAttribute('type', document.querySelector(`input[name="${key}"]`).type);
                    $input.setAttribute('value', currentItem[key]);
                    $input.classList.add('input');
                    $form.append($input);
                }

                const $button = document.createElement('input');
                $button.setAttribute('type', 'submit');
                $button.setAttribute('value', 'Edit');
                $button.classList.add('button', `${listPrefix}__button`);

                const $note = document.createElement('div');
                $note.classList.add('note');

                $form.append($button, $note);
                this.showPopUp($form);

                $form.addEventListener('submit', event => {
                    event.preventDefault();
                    const inputs = event.target.querySelectorAll('input:not([type="submit"])');
                    const $messageDiv = document.querySelector('.note');
                    inputs.forEach(input => {
                        if (input.value) {
                            currentItem[input.name] = input.value.trim();
                            $messageDiv.innerHTML = 'Item changed';
                        } else {
                            $messageDiv.innerHTML = 'Please fill in all fields';
                        }
                    });

                    $item.querySelector(`.${listPrefix}__content`).innerHTML = this.createItem(currentItem);
                });
            }
        });
    }

    createItem = (valuesObject) => {
        let template = '';
        for (const key in valuesObject) {
            template += `${key}: ${valuesObject[key]} `;
        }
        return template;
    }

    showPopUp = (content) => {
        const $modal = document.querySelector('.modal');
        $modal.style.display = 'block';
        document.body.classList.add('body_hidden');
        const $content = document.querySelector('.popup__content');
        $content.prepend(content);
    }

    closePopUp = () => {
        const $modal = document.querySelector('.modal');
        const $close = document.querySelector('.popup__close');
        $close.addEventListener('click', () => {
            const $content = document.querySelector('.popup__content');
            $content.innerHTML = '';
            $modal.style.display = 'none';
            document.body.classList.remove('body_hidden');
        });
    }
}

class ToDoList extends List {
    constructor(listPrefix) {
        super();
        this.items = [];
        this.formHandler(listPrefix);
        this.editItem(listPrefix);
        this.removeItem(listPrefix);
        this.isCompleted(listPrefix);
        this.getStatistic(listPrefix);
    }

    addItem(valuesObject, listPrefix) {
        const $error = document.querySelector('.error');
        if (this.isNotUnique(valuesObject)) {
            $error.innerHTML = 'Please enter a unique value';
        } else {
            $error.innerHTML = '';
            Object.defineProperty(valuesObject, 'completed', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: false
            });
            super.addItem(valuesObject, listPrefix);
            const $form = document.querySelector(`#${listPrefix}__form`);
            $form.reset();
        }
    }

    createItem = (valuesObject) => `${valuesObject.title}: ${valuesObject.text}`;

    isCompleted(listPrefix) {
        const $list = document.querySelector(`.${listPrefix}`);
        $list.addEventListener('click', (e) => {
            if (e.target.className === 'todo__content') {
                const $item = e.target.parentElement;
                const id = +$item.dataset.id;
                const currentItem = this.items.find(item => item.id === id);
                if (currentItem.completed) {
                    $item.classList.remove('todo__item_completed');
                    currentItem.completed = false;
                } else {
                    $item.classList.add('todo__item_completed');
                    currentItem.completed = true;
                }
            }
        });
    }

    isNotUnique({ title, text }) {
        const note = this.items.find(item => item.title === title || item.text === text);
        return !!note;
    }

    getStatistic(listPrefix) {
        const $list = document.querySelector(`.${listPrefix}`);
        $list.addEventListener('click', (e) => {
            const total = this.items.length;
            const completed = this.items.filter(item => item.completed).length;
            if (e.target.classList.contains('button_statistic')) {
                const $result = document.createElement('div');
                $result.innerHTML = `<b>Total</b>: ${total} <br> <b>Completed</b>: ${completed}`;
                this.showPopUp($result);
            }
        });
    }

}

class ContactList extends List {
    constructor(listPrefix) {
        super();
        this.items = [];
        this.formHandler(listPrefix);
        this.editItem(listPrefix);
        this.removeItem(listPrefix);
        this.findContact(listPrefix);
    }

    addItem(valuesObject, listPrefix) {
        super.addItem(valuesObject, listPrefix);
        const $form = document.querySelector(`#${listPrefix}__form`);
        $form.reset();
    }

    createItem = (valuesObject) => `<span>${valuesObject.name} ${valuesObject.surname} (${valuesObject.phone})</span>`;

    findContact(listPrefix) {
        const $list = document.querySelector(`.${listPrefix}`);
        $list.addEventListener('click', (e) => {
            if (e.target.classList.contains('button_search')) {
                const $search = document.createElement('input');
                $search.setAttribute('type', 'text');
                $search.setAttribute('name', 'search');
                $search.setAttribute('placeholder', 'Search');
                $search.classList.add('input');


                const $result = document.createElement('div');
                $result.classList.add('search-result');

                const $searchWrap = document.createElement('div');
                $searchWrap.classList.add('search-wrap');

                $searchWrap.append($search, $result);

                this.showPopUp($searchWrap);

                $search.addEventListener('keyup', ({ target }) => {
                    if (!target.value) return;
                    $result.innerHTML = '';
                    const results = new Set();
                    const $value = $search.value.toString().toLowerCase();
                    const falseIndex = -1;

                    this.items.forEach(item => {
                        for (const key in item) {
                            if (item[key].toString().toLowerCase().indexOf($value) !== falseIndex) {
                                results.add(item);
                            }
                        }
                    });

                    results.forEach(element => {
                        $result.innerHTML += this.createItem(element);
                    });
                });
            }
        });
    }
}

new ToDoList('todo');
new ContactList('contact');
