const payload = {
  org_id: '88b8306b-ed36-41fc-ae22-b2fea6b50f44',
  lead_id: 1,
  phone: '+919999999999',
  agent_id: 'default_sales_agent',
  variables: { name: 'Test' }
};

fetch('http://localhost:8000/api/v1/ecosystem/trigger-call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-ecosystem-secret': 'super_secret_ecosystem_key_2024'
  },
  body: JSON.stringify(payload)
})
.then(res => res.json().then(data => console.log(res.status, data)))
.catch(err => console.error(err));
