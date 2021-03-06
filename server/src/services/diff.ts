export default function diff(a: Set<String>, b: Set<String>) {
  const diffArray = [];
  a.forEach((value) => {
    if (!b.has(value)) {
      diffArray.push(value);
    }
  });
  return diffArray;
}
