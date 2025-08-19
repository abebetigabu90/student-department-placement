import Student from '../models/student.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
dotenv.config();
connectDB();
import chalk from 'chalk'
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
const naturalFirstSem = await Student.find({stream:'natural',gpa:{$exists:true},cgpa:{$exists:false},$or: [ { Department: null }, { Department: { $exists: false } } ]},)
//the ff code is used to assign a department for natural science and first semister student only
if(naturalFirstSem.length>0){
    const studentsWithoutTotScore = naturalFirstSem.filter((stu)=>{return stu.totalScore == 0})  // filter only students who has no total score
    if (studentsWithoutTotScore.length>0){   
        console.log(chalk.green.bold('calculating total score for students who donot have!')) // used to calculate total score and assign only for only who don't have total score
        for( const stu of studentsWithoutTotScore){
    const result = calculateTotFirstSem(stu.gpa,stu.entranceScore,stu.gender,stu.disability,stu.region)
    if(result === null || result === undefined){
        console.log(chalk.red(`total score is not calculated for ${stu.fullName}`))
        continue
    }
    else {
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
   console.log(chalk.red.bold('natural science student which has total score and preference not found!'));
}
else{
    console.log(chalk.green.bold("sorting each student with score in descending order and assigning department"))
    const sortedStudents = studentsWithScoreAndPref.sort((a,b)=>{return b.totalScore - a.totalScore})
    const departments = await Department.find()
    const deptMap = new Map(departments.map((d)=>{return [d.name.toLowerCase(),d.deptID]}))
    const validFirstSemNatDepartments = ['computer science','medicine','pharmacy','other natural','IT','engineering']

    for (const stu of sortedStudents){
        for (const pref of stu.preferences){
            const dept = departments.find((d)=>{return d.name.toLowerCase() == pref.toLowerCase()})
            if(!dept || dept.capacity == 0){
                if(!dept){console.log(chalk.red(`${pref}, not found on the department documents `))}
                else{console.log(chalk.red(`${pref},capacity is full`))}
              continue
            }
            else if(dept && dept.capacity>0 && validFirstSemNatDepartments.includes(dept.name.toLowerCase()) ){
                console.log(chalk.green(`processing...to place ${stu.fullName} on ${dept.name}`))
                await Student.updateOne({studentId:stu.studentId},{$set:{Department:deptMap.get(dept.name.toLowerCase())}})
                dept.capacity--
                const res = await Department.updateOne({ deptID: dept.deptId },{ $push: { assignedStudents: stu.studentId } })
                if (res.modifiedCount === 0) {console.log('Department update failed:', dept.name)}
                console.log(chalk.blue(`${stu.fullName}, is successfully placed on ${dept.name}`))
                break
            }
            else{
                console.log(chalk.red.bold(`Invalid department preference: ${pref}`))
            continue
            }
            
        }
 }
}
}
}



//placementForFirstSemNatural()
const clearPlacement=async()=>{
    await Student.updateMany({},{$set:{Department:null}})
    await Department.updateMany({},{$set:{assignedStudents:[]}})
}  
 //clearPlacement()
const departments = await Department.find()
console.log(departments)
const students = await Student.find()
console.log(students)



//next step is assign by checking his preference is from the 6 natural student alternatives  and assign only once one department  for each student by checking department capacity iteratively for each prefence
            //then check female quota of each department iteratively 
            //unsign the last male student from the department and assign for top female among not assigned yet but prefers it untill 20% of female reached or no female need it or for all departments
            //re assign male students who are replaced by female on the department of other their choose which is still not filled