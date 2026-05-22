async function testHelpdesk() {
  console.log("Asking the Helpdesk: 'Can I drink water before my biopsy?'...\n");

  const response = await fetch('http://localhost:8000/api/patient-helpdesk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opNumber: "OP-12345",
      message: "Can I drink water before my biopsy tomorrow?"
    })
  });

  if (!response.ok) {
    console.error("Server returned an error:", response.status);
    return;
  }

  // --- THE FIX: Decode the binary stream into text ---
  const decoder = new TextDecoder('utf-8');
  
  for await (const chunk of response.body) {
    process.stdout.write(decoder.decode(chunk, { stream: true })); 
  }
  
  console.log("\n\n✅ Stream Complete!");
}

testHelpdesk();