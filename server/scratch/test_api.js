
async function testFetch() {
  const id = 'rest_verde_fresh';
  try {
    const response = await fetch(`http://localhost:5000/api/restaurants/${id}`);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

testFetch();
