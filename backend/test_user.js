

async function test() {
  const payload = {
    name: "John Doe",
    username: "john_doe",
    dept: "IQC",
    password: "password123",
    active: true
  };

  try {
    const res = await fetch('http://127.0.0.1:5000/api/users');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
