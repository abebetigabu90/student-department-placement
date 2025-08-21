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
const GenplacementForFirstSemNatural = async()=>{
const naturalFirstSem = await Student.find({stream:'natural',gpa:{$exists:true},cgpa:{$exists:false},$or: [ { Department: null }, { Department: { $exists: false } } ]},)
//the ff code is used to assign a department for natural science and first semister student only
if (naturalFirstSem.length == 0){
    console.log(chalk.blue.bold('all first semister and natural science students are placed!'))
}
else if(naturalFirstSem.length>0){    // else if  with condition is for readability you can make it simply else without condition
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
   console.log(chalk.red.bold('natural science student which has both total score and preference not found!'));
}
else{
    console.log(chalk.green.bold("sorting each student with score in descending order and assigning department"))
    const sortedStudents = studentsWithScoreAndPref.sort((a,b)=>{return b.totalScore - a.totalScore})
   // const departments = await Department.find()
    //const deptMap = new Map(departments.map((d)=>{return [d.name.toLowerCase(),d.deptID]}))
    const departments = await Department.find({name:{$in:[/^computer science$/i,/^medicine$/i,/^pharmacy$/i,/^other natural$/i,/^IT$/i,/^engineering$/i]}})
    //const validFirstSemNatDepartments = ['computer science','medicine','pharmacy','other natural','IT','engineering']
    for (const stu of sortedStudents){
        for (const pref of stu.preferences){
            const dept = departments.find((d)=>{return d.name.toLowerCase() == pref.toLowerCase()})
            if (!dept) {
            console.log(chalk.red.bold(`Invalid department preference: ${pref}`));
            continue;
            }

             //if(validFirstSemNatDepartments.includes(dept.name.toLowerCase()) )
              else  {
                console.log(chalk.green(`processing...to place ${stu.fullName} on ${dept.name}`))
                const res = await Department.updateOne({ deptID: dept.deptID,$expr:{$lt:["$totalAssignedStudents","$capacity"]}},{ $inc:{totalAssignedStudents:1},$push: { assignedStudents: stu.studentId } })
                if (res.modifiedCount === 0) {
                    console.log(`${stu.fullName} can not be placed in ${dept.name},capacity full or not found! `)
                    continue
                }
                 await Student.updateOne({studentId:stu.studentId},{$set:{Department:dept.deptID}})
                console.log(chalk.blue(`${stu.fullName}, is successfully placed on ${dept.name}`))
                break
            }
            //else {console.log(chalk.yellow(`${dept.name} is not valid for first semester placement`));} 
        }
 }
}
}
}
const femaleQuota_AdjustmentForNaturalSem1 = async()=>{
    // since female quota adjustment should be done in different levels at this level the female quota adjustment is on the listed departments to manage easily and to fix the error easily if it occur .
const departments = await Department.find({name:{$in:[/^computer science$/i,/^medicine$/i,/^pharmacy$/i,/^other natural$/i,/^IT$/i,/^engineering$/i]}})
for(const dept of departments){
    const females = await Student.find({gender:'Female',Department:dept.deptID})
    const males = await Student.find({gender:'Male',Department:dept.deptID})
    const totalStudentsOfdept = females.length + males.length
    const ratioOfdept = females.length/totalStudentsOfdept
    if(ratioOfdept>=0.2){
        console.log(chalk.blue.bold('there is no need of female quota adjustment already adjusted!'))
         continue
    }
    else{
        const FemalesWhoWantDept = await Student.find({gender:'Female',$or:[{Department:null},{Department:{$ne:dept.deptID}}],"preferences.0":dept.name})  // females who want dept to be placed
        const maxWantedFemales = Math.ceil(0.2*totalStudentsOfdept)
        if(FemalesWhoWantDept.length<=maxWantedFemales){
            const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
            for(let i=0;i < FemalesWhoWantDept.length;i++){
                //the ff two lines of codes displace the least score males to make the department free to place males 
                await Department.updateOne({deptID:dept.deptID},{$pull:{assignedStudents:sortedMales[i].studentId},$inc:{totalAssignedStudents:-1}})
                await Student.updateOne({studentId:sortedMales[i].studentId},{$set:{Department:null}})
                //since before assign females on the freed departments they should be displaced from their current department so the ff two lines of code do this
                await Department.updateOne({deptID:FemalesWhoWantDept[i].Department},{$pull:{assignedStudents:FemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:-1}})
                //the ff two lines of code are used to assign females on the freed departments
                await Department.updateOne({deptID:dept.deptID},{$push:{assignedStudents:FemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:1}})
                await Student.updateOne({studentId:FemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}})
            }
        }
        //the ff else code is if females count who want dept is greater than the maximum needed females to fill the quota
        else{
            const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
            const sortedFemalesWhoWantDept = FemalesWhoWantDept.sort((a,b)=>{return b.totalScore - a.totalScore}) 
            for(let i=0;i < maxWantedFemales;i++){
                //the ff two lines of codes displace the least score males to make the department free to place males 
                await Department.updateOne({deptID:dept.deptID},{$pull:{assignedStudents:sortedMales[i].studentId},$inc:{totalAssignedStudents:-1}})
                await Student.updateOne({studentId:sortedMales[i].studentId},{$set:{Department:null}})
                //since before assign females on the freed departments they should be displaced from their current department so the ff two lines of code do this
                if (sortedFemalesWhoWantDept[i].Department !== null && sortedFemalesWhoWantDept[i].Department !== undefined){
                    await Department.updateOne({deptID:sortedFemalesWhoWantDept[i].Department},{$pull:{assignedStudents:sortedFemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:-1}})
                }
                //the ff two lines of code are used to assign females on the freed departments
                await Department.updateOne({deptID:dept.deptID},{$push:{assignedStudents:sortedFemalesWhoWantDept[i].studentId},$inc: {totalAssignedStudents:1}})
                await Student.updateOne({studentId:sortedFemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}})
            }
        }
    }
}

}

//i use the ff async function for sequential execution to prevent concurrency
async function runPlacementforNaturalSem1(){
    await GenplacementForFirstSemNatural()
    await femaleQuota_AdjustmentForNaturalSem1()
    await GenplacementForFirstSemNatural() //to reassign males in first semister natural departments who are displaced for female quota adjustment
    const departments = await Department.find()
    console.log(departments)
    const students = await Student.find()
    console.log(students) 
}

runPlacementforNaturalSem1()
const clearPlacement=async()=>{
    await Student.updateMany({},{$set:{Department:null}})
    await Department.updateMany({},{$set:{assignedStudents:[],totalAssignedStudents:0}})
}  
//clearPlacement()



//next step is assign by checking his preference is from the 6 natural student alternatives  and assign only once one department  for each student by checking department capacity iteratively for each prefence
            //then check female quota of each department iteratively 
            //unsign the last male student from the department and assign for top female among not assigned yet but prefers it untill 20% of female reached or no female need it or for all departments
            //re assign male students who are replaced by female on the department of other their choose which is still not filled