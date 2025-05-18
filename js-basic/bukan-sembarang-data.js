// 4. Bukan Sembarang Data
const employees = [
  {
    name: 'Fulan',
    email: 'fulan@dicoding.com',
    joinYear: 2020,
  },
];

function addEmployee(name, email, joinYear) {
  /**
   * @TODO
   * lengkapi fungsi ini agar dapat menambahkan objek employee baru
   * berdasarkan nilai argumen fungsi dan simpan ke dalam array `employees`
   */
  
  const employee = {
    name,
    email,
    joinYear,
  }
  console.log(employee);
  employees.push(employee);
  console.log("Employees => length: " + employees.length);
   
}
addEmployee("Yasmin", "yasmin@gmail.com", 2025 );
console.log(employees);