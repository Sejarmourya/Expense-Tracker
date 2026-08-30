import { useEffect, useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [message, setMessage] = useState("");

  // GET - Fetch expenses
  const getExpenses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/expenses");
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // POST - Add expense
  const addExpense = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Expense added successfully ✅");

        setTitle("");
        setAmount("");
        setCategory("");

        getExpenses();
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    }
  };

  // DELETE - Delete expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Expense deleted successfully 🗑️");
        getExpenses();
      } else {
        setMessage("Expense not found ❌");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    }
  };

  // Run when page loads
  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <div>
      <h1>Expense Tracker</h1>

      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button onClick={addExpense}>Add Expense</button>

      <p>{message}</p>

      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <div key={expense._id}>
          <h3>{expense.title}</h3>
          <p>Amount: ₹{expense.amount}</p>
          <p>Category: {expense.category}</p>

          <button onClick={() => deleteExpense(expense._id)}>
            Delete 🗑️
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;