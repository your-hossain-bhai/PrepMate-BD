try {
  JSON.parse("The page cannot be found");
} catch (e) {
  console.log(e.message);
}
