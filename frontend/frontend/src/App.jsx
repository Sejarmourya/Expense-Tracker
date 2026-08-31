import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  const saveExpense = async () => {
    if (!title || !amount || !category) {
      setMessage("Please fill all fields ⚠️");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/expenses/${editingId}`
        : "http://localhost:5000/api/expenses";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
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
        setMessage(
          editingId
            ? "Expense updated successfully ✅"
            : "Expense added successfully ✅"
        );

        clearForm();
        getExpenses();
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    }
  };

  const editExpense = (expense) => {
    setEditingId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setMessage("");
  };

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
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setEditingId(null);
  };

  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <div className="app">
      <div className="container">

        <header>
          <h1>💰 Expense Tracker</h1>
          <p>Manage your daily expenses easily</p>
        </header>

        <div className="total-card">
          <span>Total Expenses</span>
          <h2>₹{totalExpense}</h2>
        </div>

        <div className="form-card">
          <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

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

          <div className="form-buttons">
            <button className="primary-btn" onClick={saveExpense}>
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button className="cancel-btn" onClick={clearForm}>
                Cancel
              </button>
            )}
          </div>

          {message && <p className="message">{message}</p>}
        </div>

        <div className="expense-section">
          <h2>Recent Expenses</h2>

          {expenses.length === 0 ? (
            <p className="empty">No expenses found.</p>
          ) : (
            expenses.map((expense) => (
              <div className="expense-card" key={expense._id}>
                <div>
                  <h3>{expense.title}</h3>
                  <span>{expense.category}</span>
                </div>

                <div className="expense-right">
                  <strong>₹{expense.amount}</strong>

                  <div>
                    <button
                      className="edit-btn"
                      onClick={() => editExpense(expense)}
                    >
                      Edit ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(expense._id)}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;