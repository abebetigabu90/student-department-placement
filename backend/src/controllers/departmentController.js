import Department from '../models/Department.js';
// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const departments = req.body; // expects an array of objects
    await Department.insertMany(departments);
    res.status(201).json({ message: 'Departments added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
