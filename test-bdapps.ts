async function run() {
  const res = await fetch('https://api.appspro.dev/api/v1/sdk/otp/request', { method: 'POST' });
  const text = await res.text();
  console.log(text);
}
run();
