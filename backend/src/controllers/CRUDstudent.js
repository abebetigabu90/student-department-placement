import Student from '../models/student.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
dotenv.config();
connectDB();

// node src/controllers/CRUDstudent.js

//  await Student.deleteMany({})
//  const deletedstudents = await Student.find()
// console.log(deletedstudents)

//  const student = await Student.insertMany(
//     [
//         {
//         studentId:'dtu1',
//         fullName:'aster1',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:630,
//         gpa:4,
//         preferences:['medicine','pharmacy','other natural']
//      },
//      {
//         studentId:'dtu2',
//         fullName:'aster2',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:500,
//         gpa:3,
//         preferences:['medicine','pharmacy','other natural']
//     },
//       {
//         studentId:'dtu3',
//         fullName:'aster3',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:500,
//         gpa:2,
//         preferences:['medicine','pharmacy','other natural']
//     },
//      {
//         studentId:'dtu4',
//         fullName:'maru1',
//         stream:'natural',
//         gender:'Male',
//         region:'Amhara',
//         entranceScore:690,
//         gpa:4,
//         preferences:['medicine','pharmacy','other natural']
//     },
//      {
//         studentId:'dtu5',
//         fullName:'maru2',
//         stream:'natural',
//         gender:'Male',
//         region:'Amhara',
//         entranceScore:650,
//         gpa:4,
//         preferences:['medicine','pharmacy','other natural']
//     },
//       {
//         studentId:'dtu6',
//         fullName:'maru3',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:600,
//         gpa:3,
//         preferences:['medicine','pharmacy','other natural']
//     },
//     ]
// )
// const insertedStudents = await Student.find()
//  console.log(insertedStudents)


//  const students = await Student.find()
// console.log(students)
// const updatedPreference = await Student.updateMany(
//     {},
//     {$set:{preferences:['Medicine','Computer Science','Other Natural']}}
// )
// const updatedPreference = await Student.updateOne(
//     {studentId:'dtu5'},
//     {$set:{entranceScore:685,totalScore:0,Department:null}}
// )


// const deleteDepartment = await Department.deleteMany({})
// const departments = await Department.find()
// console.log(departments)

// await Department.insertMany(
//     [
//         {   
//         deptID:'cs',
//         name:'computer science',
//         stream:'natural',
//         capacity:2
//     },
//       {   
//         deptID:'IT',
//         name:'information technology',
//         stream:'natural',
//         capacity:2
//     },
//       {   
//         deptID:'otherNatural',
//         name:'other natural',
//          stream:'natural',
//         capacity:2
//     },
//       {   
//         deptID:'medicine',
//         name:'medicine',
//         stream:'natural',
//         capacity:2
//     },
//         {   
//         deptID:'pharmacy',
//         name:'pharmacy',
//          stream:'natural',
//         capacity:2
//     },
//     {   
//         deptID:'engineering',
//         name:'engineering',
//          stream:'natural',
//         capacity:2
//     },
//     ]
// )


// const unplaceAllStudents = await Student.updateMany(
//     {},
//     {$set:{Department:null}}
// )
// const unplaceAllStudentsfromDepts = await Department.updateMany(
//     {},
//     {$set:{assignedStudents:[],totalAssignedStudents:0}}
// )
//  const students = await Student.find()
// console.log(students)
// const departments = await Department.find()
// console.log(departments)
// const students =await Student.find()
// console.log(students)
