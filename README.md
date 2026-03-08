```
1️⃣ What is the difference between var, let, and const?
2️⃣ What is the spread operator (...)?
3️⃣ What is the difference between map(), filter(), and forEach()?
4️⃣ What is an arrow function?
5️⃣ What are template literals?
```

# JavaScript Basics (Short Notes)

## 1️⃣ Difference between var, let, and const

- **var** → old way to declare variable. It is function scoped and sometimes create problems.
- **let** → block scoped and value can be changed.
- **const** → block scoped but value can not be reassigned.

Example:
```js
var a = 10;
let b = 20;
const c = 30;
```

---

## 2️⃣ What is the spread operator (...)? 

The **spread operator (...)** is used to expand elements of an array or object.

Example:
```js
const arr = [1,2,3];
const newArr = [...arr,4];
```

---

## 3️⃣ Difference between map(), filter(), and forEach()

- **forEach()** → just loops through array, returns nothing.
- **map()** → loops and returns a **new array**.
- **filter()** → returns a new array based on a condition.

---

## 4️⃣ What is an arrow function?

Arrow function is a shorter way to write function.

Example:
```js
const add = (a,b) => a + b;
```

---

## 5️⃣ What are template literals?

Template literals are strings written with **backticks (` `)** and allow variables inside string.

Example:
```js
const name = "Mehedi";
console.log(`Hello ${name}`);
```