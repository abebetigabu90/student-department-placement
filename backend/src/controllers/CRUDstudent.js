import Student from '../models/student.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
dotenv.config();
connectDB();

// node src/controllers/CRUDstudent.js

//  await Student.deleteMany({})
//  const deletedstudents = await Student.find()
//  console.log(deletedstudents)

//  const student = await Student.insertMany(
//     [
//         {
//         studentId:'dtu1',
//         fullName:'aster1',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:100,
//         gpa:3,
//         preferences:['cs','IT','other']
//      },
//      {
//         studentId:'dtu2',
//         fullName:'aster2',
//         stream:'natural',
//         gender:'Female',
//         region:'Amhara',
//         entranceScore:100,
//         gpa:2,
//         preferences:['cs','IT','other']
//     },
//      {
//         studentId:'dtu3',
//         fullName:'maru',
//         stream:'natural',
//         gender:'Male',
//         region:'Amhara',
//         entranceScore:200,
//         gpa:4,
//         preferences:['cs','IT','other']
//     },
//      {
//         studentId:'dtu4',
//         fullName:'maru2',
//         stream:'natural',
//         gender:'Male',
//         region:'Amhara',
//         entranceScore:250,
//         gpa:4,
//         preferences:['computer Science','IT','medicine']
//     }
//     ]
// )
// const insertedStudents = await Student.find()
//  console.log(insertedStudents)


//  const students = await Student.find()
// console.log(students)
// const updatedPreference = await Student.updateMany(
//     {},
//     {$set:{preferences:['cs','IT','other']}}
// )


// // const deleteDepartment = await Department.deleteMany({})
// await Department.insertMany(
//     [
//     //     {   
//     //     deptID:'cs',
//     //     name:'computer science',
//     //     capacity:2
//     // },
//       {   
//         deptID:'IT',
//         name:'information technology',
//         capacity:2
//     },
//       {   
//         deptID:'other',
//         name:'other natural science',
//         capacity:2
//     },
//     ]
// )

// const students =await Student.find()
// console.log(students)