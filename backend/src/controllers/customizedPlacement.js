import Student from '../models/student.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
dotenv.config();
connectDB();

// node src/controllers/customizedPlacement.js

 const calculateTotFirstSem = (gpa,entrance,gender,disability,region)=>{
    let total = 0
    total =  ((50*gpa)/100) + ((20*entrance)/100)
    if(gender=='Female'){
        total += 5
    }
    if(disability!=='None'){
        total += 5
    }
    const emergingRegions =['afar','benishangul gumz','gambella','somali']
    if (emergingRegions.includes(region.toLowerCase()))
    {
        total +=5
    }
    return total
}
//  const calculateTotSecSem = (cgpa,entrance,gender,disability,region)=>{
//     let total = 0
//     total =  ((50*cgpa)/100) + ((20*entrance)/100)
//     if(gender=='Female'){
//         total += 5
//     }
//     if(disability!=='None'){
//         total += 5
//     }
//     const emergingRegions =['afar','benishangul gumz','gambella','somali']
//     if (emergingRegions.includes(region.toLowerCase()))    {
//         total +=5
//     }
//     return total
// }

//the ff code is used to assign a department for natural science and first semister student only
const placementForFirstSemNatural = async()=>{
const naturalFirstSem = await Student.find({stream:'natural',gpa:{$exists:true},cgpa:{$exists:false},Department:null},)
//the ff code is used to assign a department for natural science and first semister student only
if(naturalFirstSem.length>0){
    console.log('filtering students which has no score and calculating their total score and update their total score value')
    const studentsWithoutTotScore = naturalFirstSem.filter((stu)=>{return stu.totalScore == 0})  // filter only students who has no total score
    if (studentsWithoutTotScore.length>0){    // used to calculate total score and assign only for only who don't have total score
        for( const stu of studentsWithoutTotScore){
    const result = calculateTotFirstSem(stu.gpa,stu.entranceScore,stu.gender,stu.disability,stu.region)
    if(result>0){
        // console.log(result)
        await Student.updateOne(
            {studentId:stu.studentId},
            {$set:{totalScore:result}}
        )
    }
}
    }
//the ff code is used if the there are one or more students who has total score and to sort and assign department for each student
const studentsWithScoreAndPref = naturalFirstSem.filter((stu)=>{return stu.totalScore>0 && stu.preferences.length>0})
if(studentsWithScoreAndPref.length==0){
   console.log("student with total score and preference not found!") 
}
else{
    console.log("sorting each student with score in descending order and assigning department")
    const sortedStudents = studentsWithScoreAndPref.sort((a,b)=>{return b.totalScore - a.totalScore})
    const departments = await Department.find()
    for (const stu of sortedStudents){
        for (const pref of stu.preferences){
            const dept = departments.find((d)=>{return d.deptID.toLowerCase() == pref.toLowerCase()})
            if(!dept || dept.capacity == 0){
                continue
            }
            else if(dept && dept.capacity>0 ){
                await Student.updateOne({studentId:stu.studentId},{$set:{Department:dept.deptID}})
                await Department.updateOne({deptID:dept.deptID},{$inc:{capacity:-1},$push:{assignedStudents:stu.studentId}})
                dept.capacity--
                break
            }
            
        }
 }
}
}
}
//placementForFirstSemNatural()
// const studentswithDepartment = await Student.find({Department:{$ne:null}})
// console.log(studentswithDepartment)
const clearPlacement=async()=>{await Student.updateMany({},{$set:{preferences:[],Department:null,totalScore:0}},)}  
clearPlacement()
// const studentswithDepartment = await Student.find({Department:{$ne:null}})
const students = await Student.find()
console.log(students)
//next step is assign by checking his preference is from the 6 natural student alternatives  and assign only once one department  for each student by checking department capacity iteratively for each prefence
            //then check female quota of each department iteratively 
            //unsign the last male student from the department and assign for top female among not assigned yet but prefers it untill 20% of female reached or no female need it or for all departments
            //re assign male students who are replaced by female on the department of other their choose which is still not filled